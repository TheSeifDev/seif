import { Pool } from "pg";
import { randomBytes, createHmac } from "node:crypto";
import fs from "node:fs/promises";
const url = process.env.CMS_TEST_DATABASE_URL;
if (!url)
  throw new Error("Set CMS_TEST_DATABASE_URL for an isolated local database.");
const parsed = new URL(url);
if (
  !["127.0.0.1", "localhost"].includes(parsed.hostname) ||
  !parsed.pathname.endsWith("_test")
)
  throw new Error("Only a localhost database ending in _test is permitted.");
const secret = randomBytes(48).toString("hex");
const pool = new Pool({ connectionString: url });
const now = new Date();
const expires = new Date(Date.now() + 3600000);
const credentials = [];
for (const [id, github] of [
  ["local-owner-fixture", "167328383"],
  ["local-outsider-fixture", "999999999999"],
]) {
  await pool.query('DELETE FROM "user" WHERE id=$1', [id]);
  await pool.query(
    'INSERT INTO "user" (id,name,email,email_verified,created_at,updated_at) VALUES($1,$2,$3,true,$4,$4)',
    [
      id,
      id === "local-owner-fixture"
        ? "Local test owner"
        : "Unauthorized local fixture",
      `${id}@example.invalid`,
      now,
    ],
  );
  await pool.query(
    "INSERT INTO account (id,account_id,provider_id,user_id,created_at,updated_at) VALUES($1,$2,'github',$3,$4,$4)",
    [`${id}-account`, github, id, now],
  );
  const token = randomBytes(32).toString("hex");
  await pool.query(
    "INSERT INTO session(id,token,user_id,expires_at,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$5)",
    [`${id}-session`, token, id, expires, now],
  );
  const signature = createHmac("sha256", secret).update(token).digest("base64");
  credentials.push({
    id,
    cookie: `__Secure-better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`,
  });
}
await fs.writeFile(
  "/tmp/seif-cms-auth-fixture.json",
  JSON.stringify({
    credentials,
    expiresAt: expires.toISOString(),
    messageId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  }),
  { mode: 0o600 },
);
await fs.writeFile(
  "/tmp/seif-cms-test-env.sh",
  `export DATABASE_URL='${url}'\nexport BETTER_AUTH_SECRET='${secret}'\nexport GITHUB_CLIENT_ID='isolated-local-test-client'\nexport GITHUB_CLIENT_SECRET='isolated-local-test-secret'\nexport CMS_ENABLED=true\n`,
  { mode: 0o600 },
);
await pool.query("DELETE FROM contact_messages WHERE id=$1", [
  "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
]);
await pool.query(
  "INSERT INTO contact_messages(id,name,email,message) VALUES($1,$2,$3,$4)",
  [
    "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "Local test sender",
    "local-fixture@example.invalid",
    "Local integration message, never sent to production.",
  ],
);
await pool.end();
console.log(
  "Created two signed local PostgreSQL session fixtures. No production account/provider was contacted; no app auth bypass exists.",
);
