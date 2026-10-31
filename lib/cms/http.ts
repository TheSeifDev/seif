import { requireAdmin, AuthError } from "@/lib/auth/server";
import { CmsError } from "@/lib/cms/repository";
import { getSiteOrigin } from "@/lib/seo/metadata";
import { ZodError } from "zod";

const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1"]);

/**
 * Validate state-changing admin requests.
 * - Rejects cross-site Fetch Metadata (`Sec-Fetch-Site: cross-site`) and missing/malformed `Origin`.
 * - Always accepts the verified canonical site origin (`getSiteOrigin()`).
 * - Outside production (`NODE_ENV !== "production"`), also accepts an exact same-origin
 *   `http://localhost(:port)` or `http://127.0.0.1(:port)` request matching the target request URL,
 *   without weakening production origin checks or altering public metadata / OAuth callback URLs.
 */
export function isAllowedAdminMutationOrigin(
  request: Request,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin")?.trim();
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    if (originUrl.origin !== origin) return false;
    if (originUrl.origin === getSiteOrigin()) return true;

    if (nodeEnv && nodeEnv !== "production") {
      const requestUrl = new URL(request.url);
      const isLocalOrigin =
        originUrl.protocol === "http:" &&
        LOCAL_DEV_HOSTS.has(originUrl.hostname) &&
        !originUrl.username &&
        !originUrl.password;
      const isSameLocalTarget =
        requestUrl.protocol === "http:" &&
        LOCAL_DEV_HOSTS.has(requestUrl.hostname) &&
        originUrl.origin === requestUrl.origin;

      return isLocalOrigin && isSameLocalTarget;
    }

    return false;
  } catch {
    return false;
  }
}

export async function adminRequest(request: Request, mutation = false) {
  const principal = await requireAdmin(request);
  if (mutation && !isAllowedAdminMutationOrigin(request)) {
    throw new AuthError(
      "FORBIDDEN",
      403,
      "This request origin is not allowed.",
    );
  }
  return principal;
}
async function readBody(request: Request, maxBytes: number) {
  if (!request.body)
    throw new CmsError("INVALID_BODY", 400, "A request body is required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new CmsError("PAYLOAD_TOO_LARGE", 413, "The request is too large.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function readJson(
  request: Request,
  maxBytes = 1_500_000,
): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new CmsError(
      "INVALID_CONTENT_TYPE",
      415,
      "Use an application/json request.",
    );
  const body = await readBody(request, maxBytes);
  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    throw new CmsError(
      "INVALID_JSON",
      400,
      "The request body is not valid JSON.",
    );
  }
}
export async function readMultipart(request: Request, maxBytes: number) {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data"))
    throw new CmsError(
      "INVALID_CONTENT_TYPE",
      415,
      "Use a multipart file upload.",
    );
  const body = await readBody(request, maxBytes);
  try {
    return await new Response(new Uint8Array(body), {
      headers: { "Content-Type": contentType },
    }).formData();
  } catch {
    throw new CmsError("INVALID_FILE", 400, "The upload could not be read.");
  }
}
export function ok(value: object) {
  return Response.json(
    { ok: true, ...value },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
export function adminError(error: unknown) {
  if (error instanceof ZodError)
    return Response.json(
      {
        ok: false,
        error: "INVALID_CONTENT",
        issues: error.issues.map(({ path, message }) => ({ path, message })),
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  if (error instanceof AuthError || error instanceof CmsError)
    return Response.json(
      { ok: false, error: error.code, message: error.message },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  console.error("CMS operation failed; no content change was confirmed.");
  return Response.json(
    {
      ok: false,
      error: "SERVICE_UNAVAILABLE",
      message:
        "The operation could not be confirmed. Retry after checking service configuration.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
