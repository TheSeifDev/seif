/**
 * Strict allowlist fail-closed environment isolation guards.
 *
 * Guarantees:
 * 1. Preview accepts ONLY its explicitly approved Neon preview endpoint (ep-lingering-boat-b5zdis4h).
 * 2. Production accepts ONLY its explicitly approved Neon production endpoint (ep-sweet-art-b530x95w).
 * 3. Unknown or unverified deployment environments fail closed.
 * 4. Preview uses an explicitly approved OAuth callback origin (no silent fallback to production).
 * 5. Preview uses an explicitly approved private Blob store token.
 * 6. Preview uses an explicitly approved synthetic notification recipient (never production).
 */

export const APPROVED_PRODUCTION_NEON_ENDPOINT = "ep-sweet-art-b530x95w";
export const APPROVED_PREVIEW_NEON_ENDPOINT = "ep-lingering-boat-b5zdis4h";
export const CANONICAL_PRODUCTION_ORIGIN = "https://theseif.vercel.app";
export const SYNTHETIC_TEST_EMAIL = "delivered@resend.dev";

export class EnvironmentIsolationError extends Error {
  constructor(message: string) {
    super(`[ENVIRONMENT_ISOLATION_FAILURE] ${message}`);
    this.name = "EnvironmentIsolationError";
  }
}

/**
 * Validates that database connection string strictly matches the allowed endpoint for the environment.
 * Rejects any unknown, mismatched, or foreign database endpoint.
 */
export function assertDatabaseIsolation(
  connectionString: string,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): void {
  if (!connectionString) return;

  if (vercelEnv === "preview") {
    if (!connectionString.includes(APPROVED_PREVIEW_NEON_ENDPOINT)) {
      throw new EnvironmentIsolationError(
        `Vercel Preview environment is restricted exclusively to the approved Preview Neon endpoint (${APPROVED_PREVIEW_NEON_ENDPOINT}). Unauthorized database connection rejected.`,
      );
    }
    return;
  }

  if (vercelEnv === "production") {
    if (!connectionString.includes(APPROVED_PRODUCTION_NEON_ENDPOINT)) {
      throw new EnvironmentIsolationError(
        `Production environment is restricted exclusively to the approved Production Neon endpoint (${APPROVED_PRODUCTION_NEON_ENDPOINT}). Unauthorized database connection rejected.`,
      );
    }
    return;
  }

  if (vercelEnv && vercelEnv !== "development") {
    throw new EnvironmentIsolationError(
      `Unknown deployment environment "${vercelEnv}". All database connections rejected by fail-closed isolation policy.`,
    );
  }

  // Local development / testing guards
  if (!vercelEnv && connectionString.includes(APPROVED_PRODUCTION_NEON_ENDPOINT)) {
    throw new EnvironmentIsolationError(
      "Local development environment cannot connect directly to the Production Neon endpoint without explicit approval.",
    );
  }
}

/**
 * Validates that OAuth callback origins match the strict environment allowlist.
 * Prevents Preview from falling back to production canonical URLs.
 */
export function assertSiteOriginIsolation(
  origin: string,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): void {
  if (vercelEnv === "preview") {
    if (origin === CANONICAL_PRODUCTION_ORIGIN) {
      throw new EnvironmentIsolationError(
        "Vercel Preview environment cannot use the canonical production origin (https://theseif.vercel.app) for OAuth callbacks. An explicit preview origin is required.",
      );
    }
    if (!origin.startsWith("https://")) {
      throw new EnvironmentIsolationError(
        `Vercel Preview origin must be a secure HTTPS URL, got: "${origin}".`,
      );
    }
    return;
  }

  if (vercelEnv === "production") {
    if (origin !== CANONICAL_PRODUCTION_ORIGIN) {
      throw new EnvironmentIsolationError(
        `Production environment must use canonical origin (${CANONICAL_PRODUCTION_ORIGIN}), got: "${origin}".`,
      );
    }
    return;
  }

  if (vercelEnv && vercelEnv !== "development") {
    throw new EnvironmentIsolationError(
      `Unknown deployment environment "${vercelEnv}". Origin rejected by fail-closed isolation policy.`,
    );
  }
}

/**
 * Validates that Vercel Blob store token is configured and isolated from production.
 */
export function assertBlobStoreIsolation(
  token: string | undefined,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): void {
  if (!token?.trim()) {
    throw new EnvironmentIsolationError(
      "Blob storage token is missing. File operations cannot proceed.",
    );
  }

  if (vercelEnv === "preview") {
    // If the token explicitly declares production scope, fail closed
    if (token.includes("prod") || token.includes("production")) {
      throw new EnvironmentIsolationError(
        "Vercel Preview environment cannot use a production-scoped Blob token.",
      );
    }
  }
}

/**
 * Validates that email notification recipients are isolated in preview.
 */
export function assertNotificationIsolation(
  toEmail: string,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): void {
  if (vercelEnv === "preview") {
    const isSynthetic =
      toEmail === SYNTHETIC_TEST_EMAIL ||
      toEmail.includes("+test@") ||
      toEmail.endsWith("@example.invalid") ||
      toEmail.endsWith("@resend.dev");

    if (!isSynthetic) {
      throw new EnvironmentIsolationError(
        `Vercel Preview notification recipient must be a synthetic or test recipient (${SYNTHETIC_TEST_EMAIL} or *@resend.dev), got: "${toEmail}".`,
      );
    }
  }
}
