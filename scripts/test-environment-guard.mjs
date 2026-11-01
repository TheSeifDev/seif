import assert from "node:assert/strict";
import {
  assertDatabaseIsolation,
  assertSiteOriginIsolation,
  assertBlobStoreIsolation,
  assertNotificationIsolation,
  EnvironmentIsolationError,
  DEFAULT_PRODUCTION_ORIGIN,
} from "../lib/config/environment-guard.js";

console.log("Running Dynamic Environment Isolation Tests...");

// 1. Valid PostgreSQL URLs pass validation
assert.doesNotThrow(() => {
  assertDatabaseIsolation("postgresql://user:pass@ep-custom-neon.us-east-2.aws.neon.tech/neondb");
  assertDatabaseIsolation("postgres://user:pass@ep-custom-neon.us-east-2.aws.neon.tech/neondb");
}, "Valid postgres URLs must pass");

// 2. Invalid connection URL formats throw EnvironmentIsolationError
assert.throws(
  () => {
    assertDatabaseIsolation("not-a-valid-url");
  },
  EnvironmentIsolationError,
  "Invalid URL string must throw",
);

assert.throws(
  () => {
    assertDatabaseIsolation("mysql://user:pass@db.example.com/mydb");
  },
  EnvironmentIsolationError,
  "Non-postgres protocol must throw",
);

// 3. EXPECTED_DATABASE_HOST enforcement
process.env.EXPECTED_DATABASE_HOST = "ep-expected-host.neon.tech";
assert.doesNotThrow(() => {
  assertDatabaseIsolation("postgresql://user:pass@ep-expected-host.neon.tech/neondb");
});
assert.throws(
  () => {
    assertDatabaseIsolation("postgresql://user:pass@ep-other-host.neon.tech/neondb");
  },
  EnvironmentIsolationError,
  "Host not matching EXPECTED_DATABASE_HOST must throw",
);
delete process.env.EXPECTED_DATABASE_HOST;

// 4. Preview environment guards
// - Rejects localhost
assert.throws(
  () => {
    assertDatabaseIsolation("postgresql://user:pass@localhost:5432/neondb", "preview");
  },
  EnvironmentIsolationError,
  "Preview must reject localhost",
);

// - Rejects PRODUCTION_DATABASE_HOST if configured
process.env.PRODUCTION_DATABASE_HOST = "ep-prod-cluster.neon.tech";
assert.throws(
  () => {
    assertDatabaseIsolation("postgresql://user:pass@ep-prod-cluster.neon.tech/neondb", "preview");
  },
  EnvironmentIsolationError,
  "Preview must reject PRODUCTION_DATABASE_HOST",
);
assert.doesNotThrow(() => {
  assertDatabaseIsolation("postgresql://user:pass@ep-preview-cluster.neon.tech/neondb", "preview");
});
delete process.env.PRODUCTION_DATABASE_HOST;

// 5. Production environment guards
// - Rejects localhost
assert.throws(
  () => {
    assertDatabaseIsolation("postgresql://user:pass@127.0.0.1:5432/neondb", "production");
  },
  EnvironmentIsolationError,
  "Production must reject localhost",
);

// - Rejects PREVIEW_DATABASE_HOST if configured
process.env.PREVIEW_DATABASE_HOST = "ep-preview-branch.neon.tech";
assert.throws(
  () => {
    assertDatabaseIsolation("postgresql://user:pass@ep-preview-branch.neon.tech/neondb", "production");
  },
  EnvironmentIsolationError,
  "Production must reject PREVIEW_DATABASE_HOST",
);
assert.doesNotThrow(() => {
  assertDatabaseIsolation("postgresql://user:pass@ep-any-production-cluster.neon.tech/neondb", "production");
});
delete process.env.PREVIEW_DATABASE_HOST;

// 6. Local environment allows localhost and local testing databases
assert.doesNotThrow(() => {
  assertDatabaseIsolation("postgresql://user:pass@localhost:5432/testdb", undefined);
  assertDatabaseIsolation("postgresql://user:pass@127.0.0.1:5432/testdb", "development");
});

// 7. Site Origin Isolation
// - Preview rejects canonical production origin
assert.throws(
  () => {
    assertSiteOriginIsolation(DEFAULT_PRODUCTION_ORIGIN, "preview");
  },
  EnvironmentIsolationError,
  "Preview must reject canonical production origin",
);

// - Preview rejects insecure HTTP
assert.throws(
  () => {
    assertSiteOriginIsolation("http://preview.theseif.dev", "preview");
  },
  EnvironmentIsolationError,
  "Preview must reject insecure HTTP",
);

// - Preview accepts valid HTTPS preview origin
assert.doesNotThrow(() => {
  assertSiteOriginIsolation("https://preview.theseif.dev", "preview");
  assertSiteOriginIsolation("https://prof-git-preview-s3fpls-projects.vercel.app", "preview");
});

// - Production requires HTTPS
assert.throws(
  () => {
    assertSiteOriginIsolation("http://theseif.vercel.app", "production");
  },
  EnvironmentIsolationError,
  "Production must reject HTTP",
);

assert.doesNotThrow(() => {
  assertSiteOriginIsolation("https://theseif.vercel.app", "production");
});

// 8. Blob Storage token check
assert.throws(
  () => {
    assertBlobStoreIsolation("");
  },
  EnvironmentIsolationError,
  "Missing Blob token must throw",
);

assert.doesNotThrow(() => {
  assertBlobStoreIsolation("vercel_blob_rw_12345_token");
});

// 9. Notification Isolation
process.env.PRODUCTION_NOTIFICATION_EMAIL = "owner@realdomain.com";
assert.throws(
  () => {
    assertNotificationIsolation("owner@realdomain.com", "preview");
  },
  EnvironmentIsolationError,
  "Preview must reject production notification email",
);

assert.doesNotThrow(() => {
  assertNotificationIsolation("delivered@resend.dev", "preview");
  assertNotificationIsolation("test@example.invalid", "preview");
});
delete process.env.PRODUCTION_NOTIFICATION_EMAIL;

console.log("ALL 16 DYNAMIC ENVIRONMENT ISOLATION CHECKS PASSED");
