import assert from "node:assert/strict";
import {
  assertDatabaseIsolation,
  assertSiteOriginIsolation,
  assertBlobStoreIsolation,
  assertNotificationIsolation,
  EnvironmentIsolationError,
  APPROVED_PRODUCTION_NEON_ENDPOINT,
  APPROVED_PREVIEW_NEON_ENDPOINT,
  CANONICAL_PRODUCTION_ORIGIN,
  SYNTHETIC_TEST_EMAIL,
} from "../lib/config/environment-guard.js";

console.log("Running Strict Allowlist Environment Isolation Tests...");

// 1. Preview environment: ONLY approved preview Neon endpoint is accepted
assert.doesNotThrow(() => {
  assertDatabaseIsolation(
    `postgresql://user:pass@${APPROVED_PREVIEW_NEON_ENDPOINT}.c-7.us-east-2.aws.neon.tech/neondb`,
    "preview",
  );
}, "Preview must accept approved preview Neon endpoint");

// 2. Preview environment: production endpoint is rejected
assert.throws(
  () => {
    assertDatabaseIsolation(
      `postgresql://user:pass@${APPROVED_PRODUCTION_NEON_ENDPOINT}.c-7.us-east-2.aws.neon.tech/neondb`,
      "preview",
    );
  },
  EnvironmentIsolationError,
  "Preview must reject production Neon endpoint",
);

// 3. Preview environment: unknown/foreign endpoint is rejected (strict allowlist)
assert.throws(
  () => {
    assertDatabaseIsolation(
      "postgresql://user:pass@ep-random-foreign-12345.c-7.us-east-2.aws.neon.tech/neondb",
      "preview",
    );
  },
  EnvironmentIsolationError,
  "Preview must reject unknown endpoints under strict allowlist",
);

// 4. Production environment: ONLY approved production Neon endpoint is accepted
assert.doesNotThrow(() => {
  assertDatabaseIsolation(
    `postgresql://user:pass@${APPROVED_PRODUCTION_NEON_ENDPOINT}.c-7.us-east-2.aws.neon.tech/neondb`,
    "production",
  );
}, "Production must accept approved production Neon endpoint");

// 5. Production environment: preview endpoint is rejected
assert.throws(
  () => {
    assertDatabaseIsolation(
      `postgresql://user:pass@${APPROVED_PREVIEW_NEON_ENDPOINT}.c-7.us-east-2.aws.neon.tech/neondb`,
      "production",
    );
  },
  EnvironmentIsolationError,
  "Production must reject preview Neon endpoint",
);

// 6. Production environment: unknown/foreign endpoint is rejected
assert.throws(
  () => {
    assertDatabaseIsolation(
      "postgresql://user:pass@ep-random-foreign-12345.c-7.us-east-2.aws.neon.tech/neondb",
      "production",
    );
  },
  EnvironmentIsolationError,
  "Production must reject unknown endpoints under strict allowlist",
);

// 7. Unknown deployment environment fails closed
assert.throws(
  () => {
    assertDatabaseIsolation("postgresql://user:pass@localhost:5432/db", "staging");
  },
  EnvironmentIsolationError,
  "Unknown deployment environments must fail closed",
);

// 8. Local environment: connecting to production endpoint without approval is rejected
assert.throws(
  () => {
    assertDatabaseIsolation(
      `postgresql://user:pass@${APPROVED_PRODUCTION_NEON_ENDPOINT}.c-7.us-east-2.aws.neon.tech/neondb`,
      undefined,
    );
  },
  EnvironmentIsolationError,
  "Local dev cannot touch production endpoint without explicit override",
);

// 9. Local environment: localhost and in-memory PGlite are allowed
assert.doesNotThrow(() => {
  assertDatabaseIsolation("postgresql://user:pass@localhost:5432/testdb", undefined);
  assertDatabaseIsolation("postgresql://user:pass@127.0.0.1:5432/testdb", "development");
});

// 10. Preview OAuth origin: canonical production origin is rejected
assert.throws(
  () => {
    assertSiteOriginIsolation(CANONICAL_PRODUCTION_ORIGIN, "preview");
  },
  EnvironmentIsolationError,
  "Preview must reject canonical production origin",
);

// 11. Preview OAuth origin: insecure HTTP is rejected
assert.throws(
  () => {
    assertSiteOriginIsolation("http://insecure-preview.vercel.app", "preview");
  },
  EnvironmentIsolationError,
  "Preview must reject insecure HTTP origin",
);

// 12. Preview OAuth origin: approved preview HTTPS origin is accepted
assert.doesNotThrow(() => {
  assertSiteOriginIsolation("https://preview.theseif.dev", "preview");
  assertSiteOriginIsolation("https://seif-git-preview-the-seif-devs-projects.vercel.app", "preview");
});

// 13. Production OAuth origin: non-canonical origin is rejected
assert.throws(
  () => {
    assertSiteOriginIsolation("https://attacker.invalid", "production");
  },
  EnvironmentIsolationError,
  "Production must reject non-canonical origin",
);

// 14. Production OAuth origin: canonical origin is accepted
assert.doesNotThrow(() => {
  assertSiteOriginIsolation(CANONICAL_PRODUCTION_ORIGIN, "production");
});

// 15. Private Blob storage: missing token fails closed
assert.throws(
  () => {
    assertBlobStoreIsolation("", "preview");
  },
  EnvironmentIsolationError,
  "Missing Blob token must fail closed",
);

// 16. Private Blob storage: preview cannot use production-declared token
assert.throws(
  () => {
    assertBlobStoreIsolation("vercel_blob_rw_production_xyz123", "preview");
  },
  EnvironmentIsolationError,
  "Preview cannot use production-scoped Blob token",
);

// 17. Private Blob storage: valid preview token is accepted
assert.doesNotThrow(() => {
  assertBlobStoreIsolation("vercel_blob_rw_preview_xyz123", "preview");
});

// 18. Notification recipient: preview cannot send to real visitor or production addresses
assert.throws(
  () => {
    assertNotificationIsolation("seif@realclient.com", "preview");
  },
  EnvironmentIsolationError,
  "Preview cannot notify real email recipients",
);

// 19. Notification recipient: preview accepts synthetic recipient
assert.doesNotThrow(() => {
  assertNotificationIsolation(SYNTHETIC_TEST_EMAIL, "preview");
  assertNotificationIsolation("dev+test@resend.dev", "preview");
  assertNotificationIsolation("tester@example.invalid", "preview");
});

console.log("ALL 19 STRICT ALLOWLIST ENVIRONMENT ISOLATION CHECKS PASSED");
