import { Pool } from "pg";
import { POST } from "@/app/api/contact/route";
import { closeDb } from "@/lib/db/client";
import { resetRateLimitForTests } from "@/lib/contact/rate-limit";

type Check = { name: string; passed: boolean; detail: string };
type JsonRecord = Record<string, unknown>;

const localUrl = "postgres://portfolio:portfolio_local@127.0.0.1:5432/portfolio_test";
const checks: Check[] = [];
const originalEnv = { ...process.env };
const localPool = new Pool({ connectionString: localUrl, max: 1, connectionTimeoutMillis: 5_000 });

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

async function request(body: unknown, ip: string): Promise<{ status: number; body: unknown }> {
  const response = await POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }),
  );
  let responseBody: unknown = null;
  try {
    responseBody = await response.json();
  } catch {
    // Keep the status assertion useful even for an unexpected empty response.
  }
  return { status: response.status, body: responseBody };
}

function validBody(overrides: Record<string, unknown> = {}): JsonRecord {
  return {
    name: "Test Sender",
    email: "test@example.com",
    message: "This is a sufficiently long local integration test message.",
    company: "",
    startedAt: Date.now() - 4_000,
    ...overrides,
  };
}

function assertCheck(name: string, passed: boolean, detail: string): void {
  checks.push({ name, passed, detail });
}

async function countRows(email: string): Promise<JsonRecord | undefined> {
  const result = await localPool.query<JsonRecord>(
    "SELECT id, notification_status, notification_error FROM contact_messages WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
    [email],
  );
  return result.rows[0];
}

async function run(): Promise<void> {
  try {
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_URL_UNPOOLED;
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.CONTACT_FROM_EMAIL;
    delete process.env.CONTACT_HASH_SECRET;
    resetRateLimitForTests();

    const unavailable = await request(validBody(), "198.51.100.1");
    assertCheck(
      "DATABASE_URL unset → 503 not_configured",
      unavailable.status === 503 && isRecord(unavailable.body) && unavailable.body.status === "not_configured",
      JSON.stringify(unavailable.body),
    );

    const invalid = await request(
      validBody({ name: "x", email: "invalid", message: "short" }),
      "198.51.100.2",
    );
    const invalidFields = isRecord(invalid.body) && isRecord(invalid.body.fieldErrors) ? invalid.body.fieldErrors : null;
    assertCheck(
      "invalid fields → 400 with fieldErrors",
      invalid.status === 400 && isRecord(invalid.body) && invalid.body.status === "invalid" && invalidFields !== null,
      JSON.stringify(invalid.body),
    );

    const honeypot = await request(validBody({ company: "bot" }), "198.51.100.3");
    assertCheck(
      "honeypot filled → 400 rejected",
      honeypot.status === 400 && isRecord(honeypot.body) && honeypot.body.status === "rejected",
      JSON.stringify(honeypot.body),
    );

    const tooFast = await request(validBody({ startedAt: Date.now() }), "198.51.100.4");
    assertCheck(
      "too-fast startedAt → 400 rejected",
      tooFast.status === 400 && isRecord(tooFast.body) && tooFast.body.status === "rejected",
      JSON.stringify(tooFast.body),
    );

    process.env.DATABASE_URL = localUrl;
    process.env.CONTACT_HASH_SECRET = "local-contact-test-secret";
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.CONTACT_FROM_EMAIL;
    resetRateLimitForTests();

    const notConfigured = await request(
      validBody({ email: "not-configured@example.com" }),
      "203.0.113.10",
    );
    const notConfiguredRow = await countRows("not-configured@example.com");
    assertCheck(
      "local DB + no Resend → 201 saved/not_configured",
      notConfigured.status === 201 &&
        isRecord(notConfigured.body) &&
        notConfigured.body.status === "saved" &&
        notConfigured.body.notification === "not_configured" &&
        typeof notConfiguredRow?.notification_status === "string" &&
        notConfiguredRow.notification_status === "not_configured",
      JSON.stringify({ response: notConfigured.body, row: notConfiguredRow }),
    );

    process.env.RESEND_API_KEY = "re_invalid_test_key";
    process.env.CONTACT_TO_EMAIL = "owner@example.com";
    process.env.CONTACT_FROM_EMAIL = "Portfolio <no-reply@example.com>";
    const resendFailure = await request(
      validBody({ email: "resend-failure@example.com" }),
      "203.0.113.11",
    );
    const resendFailureRow = await countRows("resend-failure@example.com");
    const notificationError = resendFailureRow?.notification_error;
    assertCheck(
      "invalid Resend key → 201 saved/failed and row preserved",
      resendFailure.status === 201 &&
        isRecord(resendFailure.body) &&
        resendFailure.body.status === "saved" &&
        resendFailure.body.notification === "failed" &&
        resendFailureRow?.notification_status === "failed" &&
        typeof notificationError === "string" &&
        !notificationError.includes("re_invalid_test_key"),
      JSON.stringify({ response: resendFailure.body, row: resendFailureRow }),
    );

    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.CONTACT_FROM_EMAIL;
    resetRateLimitForTests();
    const rateLimitIp = "203.0.113.12";
    const rateResults: number[] = [];
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const result = await request(validBody({ email: `rate-${attempt}@example.com` }), rateLimitIp);
      rateResults.push(result.status);
    }
    assertCheck(
      "same IP → 429 after repeated sends",
      rateResults[0] === 201 && rateResults[1] === 201 && rateResults[2] === 201 && rateResults[3] === 429,
      rateResults.join(", "),
    );
  } finally {
    await localPool.query("DELETE FROM contact_messages");
    await localPool.end();
    await closeDb();
    resetRateLimitForTests();
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function main(): Promise<void> {
  await run();

  console.log("\nContact API checks");
  console.log("------------------");
  for (const check of checks) {
    console.log(`${check.passed ? "PASS" : "FAIL"}  ${check.name}  ${check.detail}`);
  }

  if (checks.some((check) => !check.passed)) process.exitCode = 1;
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
