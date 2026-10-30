import { betterAuth } from "better-auth/minimal";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { getDb } from "@/lib/db/client";
import { account as authAccount, authSchema } from "@/lib/auth/schema";
import { getSiteOrigin, siteUrl } from "@/lib/seo/metadata";

const REQUIRED_ENVIRONMENT_VARIABLES = [
  "BETTER_AUTH_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "DATABASE_URL",
] as const;

const OWNER_GITHUB_ACCOUNT_ID = "167328383";
const GITHUB_PROVIDER_ID = "github";
const FIXED_DASHBOARD_REDIRECT = "/dashboard";

export type AuthConfigReadiness = {
  ready: boolean;
  /** Variable names only; values are never returned. */
  missing: string[];
};

export function getAuthConfigReadiness(): AuthConfigReadiness {
  const missing: string[] = REQUIRED_ENVIRONMENT_VARIABLES.filter(
    (name) => !process.env[name]?.trim(),
  );
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (process.env.CMS_ENABLED !== "true") missing.push("CMS_ENABLED");

  return {
    ready: missing.length === 0 && Boolean(secret && secret.length >= 32),
    missing: [...missing],
  };
}

function isAllowedGithubIdentity(profile: unknown): boolean {
  if (!profile || typeof profile !== "object") return false;
  const githubProfile = profile as { id?: unknown };
  return String(githubProfile.id ?? "") === OWNER_GITHUB_ACCOUNT_ID;
}

function createAuth() {
  const database = getDb();
  if (!database) return null;

  const origin = getSiteOrigin();
  const frontendIsHttps = new URL(origin).protocol === "https:";
  const secret = process.env.BETTER_AUTH_SECRET!.trim();
  const clientId = process.env.GITHUB_CLIENT_ID!.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!.trim();

  return betterAuth({
    appName: "Seif Dashboard",
    baseURL: origin,
    basePath: "/api/auth",
    secret,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: authSchema,
    }),
    trustedOrigins: [origin],
    emailAndPassword: {
      enabled: false,
    },
    account: { encryptOAuthTokens: true },
    socialProviders: {
      github: {
        clientId,
        clientSecret,
        // GitHub's minimum scopes needed for the stable numeric profile ID and
        // Better Auth's required email field.
        scope: ["read:user", "user:email"],
        redirectURI: siteUrl("/api/auth/callback/github"),
        // Only the verified numeric owner identity may be provisioned below.
        // Disabling implicit signup here would also lock the owner out on first login.
      },
    },
    user: {
      // This is evaluated before OAuth user/account provisioning and again for
      // returning OAuth sign-ins. Do not replace it with an email or username
      // comparison: the numeric provider identity is the authorization anchor.
      validateUserInfo: ({ source }) => {
        if (
          source.method !== "oauth" ||
          source.oauth?.providerId !== GITHUB_PROVIDER_ID ||
          !isAllowedGithubIdentity(source.oauth.profile)
        ) {
          return {
            error: "github_identity_not_allowed",
            errorDescription: "This GitHub identity is not allowed.",
          };
        }
      },
    },
    hooks: {
      // OAuth callbacks are still constrained to one provider and one local
      // destination. Client-supplied callback/error URLs are not trusted.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-in/social") return;

        const body = (ctx.body ?? {}) as Record<string, unknown>;
        if (body.provider !== GITHUB_PROVIDER_ID) {
          throw new APIError("BAD_REQUEST", {
            message: "Only GitHub sign-in is available.",
          });
        }

        return {
          context: {
            ...ctx,
            body: {
              ...body,
              provider: GITHUB_PROVIDER_ID,
              callbackURL: FIXED_DASHBOARD_REDIRECT,
              newUserCallbackURL: FIXED_DASHBOARD_REDIRECT,
              errorCallbackURL: FIXED_DASHBOARD_REDIRECT,
            },
          },
        };
      }),
    },
    advanced: {
      // Derive this from the canonical trusted origin, never NODE_ENV or an
      // internal request URL. SameSite=None is intentional for embedding.
      useSecureCookies: frontendIsHttps,
      disableCSRFCheck: false,
      disableOriginCheck: false,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "none",
        secure: frontendIsHttps,
      },
    },
  });
}

type AuthInstance = NonNullable<ReturnType<typeof createAuth>>;

type AuthGlobals = typeof globalThis & {
  __seifBetterAuth?: AuthInstance;
};

const authGlobals = globalThis as AuthGlobals;

/**
 * Return the configured auth instance, or null while runtime configuration is
 * incomplete. No fallback secret or fabricated in-memory account is allowed.
 */
export function getAuth(): AuthInstance | null {
  if (!getAuthConfigReadiness().ready) return null;
  if (authGlobals.__seifBetterAuth) return authGlobals.__seifBetterAuth;

  const auth = createAuth();
  if (!auth) return null;

  authGlobals.__seifBetterAuth = auth;
  return auth;
}

export type AuthErrorCode =
  | "AUTH_NOT_CONFIGURED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN";

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly status: 401 | 403 | 503;

  constructor(code: AuthErrorCode, status: 401 | 403 | 503, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

export function authErrorResponse(error: unknown): Response {
  if (error instanceof AuthError) {
    return Response.json(
      { error: error.code },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { error: "AUTH_UNAVAILABLE" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

type SessionWithUser = NonNullable<
  Awaited<ReturnType<AuthInstance["api"]["getSession"]>>
>;

export type AdminPrincipal = {
  session: SessionWithUser;
  account: typeof authAccount.$inferSelect;
};

/**
 * Independently authorize a protected server operation.
 *
 * This validates the Better Auth session and then requires the durable account
 * row to match the exact GitHub provider/account pair. A session cookie alone,
 * user email, username, or a UI redirect is never sufficient.
 */
export async function requireAdmin(request?: Request): Promise<AdminPrincipal> {
  const auth = getAuth();
  if (!auth) {
    throw new AuthError(
      "AUTH_NOT_CONFIGURED",
      503,
      "Authentication is not configured.",
    );
  }

  const requestHeaders = request?.headers ?? (await nextHeaders());
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) {
    throw new AuthError("UNAUTHENTICATED", 401, "Authentication is required.");
  }

  const database = getDb();
  if (!database) {
    throw new AuthError(
      "AUTH_NOT_CONFIGURED",
      503,
      "Authentication is not configured.",
    );
  }

  const [storedAccount] = await database
    .select()
    .from(authAccount)
    .where(
      and(
        eq(authAccount.userId, session.user.id),
        eq(authAccount.providerId, GITHUB_PROVIDER_ID),
        eq(authAccount.accountId, OWNER_GITHUB_ACCOUNT_ID),
      ),
    )
    .limit(1);

  if (!storedAccount) {
    throw new AuthError("FORBIDDEN", 403, "This account is not authorized.");
  }

  return { session, account: storedAccount };
}

export { GITHUB_PROVIDER_ID, OWNER_GITHUB_ACCOUNT_ID };
