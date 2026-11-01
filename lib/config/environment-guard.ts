/**
 * Environment isolation guards.
 *
 * Enforces dynamic, environment-based validation to ensure deployment boundaries
 * without hardcoding ephemeral infrastructure hostnames into the repository code.
 */

export const DEFAULT_PRODUCTION_ORIGIN = "https://theseif.vercel.app";

export class EnvironmentIsolationError extends Error {
  constructor(message: string) {
    super(`[ENVIRONMENT_ISOLATION_FAILURE] ${message}`);
    this.name = "EnvironmentIsolationError";
  }
}

/**
 * Validates database connection string dynamically based on environment configuration.
 * Does NOT hardcode specific infrastructure hostnames into the application source code.
 */
export function assertDatabaseIsolation(
  connectionString: string,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): void {
  if (!connectionString) return;

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new EnvironmentIsolationError(
      "Database connection string is not a valid URL format.",
    );
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new EnvironmentIsolationError(
      `Database connection protocol must be postgres: or postgresql:, got "${url.protocol}".`,
    );
  }

  const hostname = url.hostname.toLowerCase();

  // If an expected database host or substring is explicitly configured via environment, enforce it:
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  if (expectedHost && !hostname.includes(expectedHost)) {
    throw new EnvironmentIsolationError(
      `Database host "${hostname}" does not match the configured EXPECTED_DATABASE_HOST "${expectedHost}".`,
    );
  }

  // Guard against Preview connecting to a designated Production database host
  if (vercelEnv === "preview") {
    const prodHost = process.env.PRODUCTION_DATABASE_HOST?.trim().toLowerCase();
    if (prodHost && hostname.includes(prodHost)) {
      throw new EnvironmentIsolationError(
        `Vercel Preview environment is forbidden from connecting to Production database host "${prodHost}".`,
      );
    }

    // In deployed Vercel preview environments, loopback addresses are invalid
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
      throw new EnvironmentIsolationError(
        "Vercel Preview deployment cannot connect to a localhost database.",
      );
    }
  }

  // In deployed Vercel production environments, loopback addresses are invalid
  if (vercelEnv === "production") {
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
      throw new EnvironmentIsolationError(
        "Production deployment cannot connect to a localhost database.",
      );
    }

    const previewHost = process.env.PREVIEW_DATABASE_HOST?.trim().toLowerCase();
    if (previewHost && hostname.includes(previewHost)) {
      throw new EnvironmentIsolationError(
        `Production deployment is forbidden from connecting to Preview database host "${previewHost}".`,
      );
    }
  }
}

/**
 * Validates that OAuth callback origins match the environment policy.
 * Prevents Preview deployments from falling back to production canonical URLs.
 */
export function assertSiteOriginIsolation(
  origin: string,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): void {
  if (!origin) return;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new EnvironmentIsolationError(`Origin "${origin}" is not a valid URL.`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new EnvironmentIsolationError(
      `Origin protocol must be HTTP or HTTPS, got "${url.protocol}".`,
    );
  }

  // In Vercel deployments, HTTPS is required
  if ((vercelEnv === "production" || vercelEnv === "preview") && url.protocol !== "https:") {
    throw new EnvironmentIsolationError(
      `Vercel ${vercelEnv} environment must use a secure HTTPS origin, got "${origin}".`,
    );
  }

  // In preview, guard against accidentally issuing callbacks to production
  if (vercelEnv === "preview") {
    const canonicalProduction = (
      process.env.PRODUCTION_SITE_URL || DEFAULT_PRODUCTION_ORIGIN
    ).toLowerCase();

    if (origin.toLowerCase() === canonicalProduction) {
      throw new EnvironmentIsolationError(
        `Vercel Preview environment cannot use the canonical production origin (${canonicalProduction}) for OAuth callbacks. An explicit preview origin is required.`,
      );
    }
  }
}

/**
 * Validates that Vercel Blob store token is configured.
 */
export function assertBlobStoreIsolation(token: string | undefined): void {
  if (!token?.trim()) {
    throw new EnvironmentIsolationError(
      "Blob storage token is missing. File operations cannot proceed.",
    );
  }
}

/**
 * Validates that email notification recipients are isolated in preview.
 */
export function assertNotificationIsolation(
  toEmail: string,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): void {
  if (!toEmail?.trim()) return;

  if (vercelEnv === "preview") {
    const prodRecipient = process.env.PRODUCTION_NOTIFICATION_EMAIL?.trim().toLowerCase();
    if (prodRecipient && toEmail.toLowerCase() === prodRecipient) {
      throw new EnvironmentIsolationError(
        `Vercel Preview notification recipient must not be the production recipient "${toEmail}".`,
      );
    }
  }
}
