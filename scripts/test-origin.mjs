import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const root = process.cwd();
const outfile = path.join(root, ".origin-test-bundle.cjs");

await build({
  stdin: {
    contents: `
      export { isAllowedAdminMutationOrigin } from "./lib/cms/http";
      export { getSiteOrigin, siteUrl, DEFAULT_SITE_ORIGIN } from "./lib/seo/metadata";
      export { POST as postContact } from "./app/api/contact/route";
      export { resetRateLimitForTests } from "./lib/contact/rate-limit";
    `,
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  packages: "external",
  outfile,
  plugins: [
    {
      name: "test-static-images",
      setup(b) {
        b.onLoad({ filter: /\.(webp|png|jpg|jpeg)$/ }, (args) => ({
          contents: `export default {src:${JSON.stringify("/images/" + path.basename(args.path))},width:1200,height:900};`,
          loader: "js",
        }));
      },
    },
  ],
});

const require = createRequire(import.meta.url);
const mod = require(outfile);
const checks = [];

function check(name, condition) {
  assert.ok(condition, name);
  checks.push({ name, passed: true });
  console.log("PASS", name);
}

function makeReq(url, origin, secFetchSite) {
  const headers = {};
  if (origin !== undefined) headers["origin"] = origin;
  if (secFetchSite !== undefined) headers["sec-fetch-site"] = secFetchSite;
  return new Request(url, { method: "PUT", headers });
}

try {
  // 1. Canonical site origin & OAuth callback preservation
  delete process.env.SITE_URL;
  check(
    "getSiteOrigin defaults to https://theseif.vercel.app",
    mod.getSiteOrigin() === "https://theseif.vercel.app",
  );
  process.env.SITE_URL = "http://localhost:3000";
  check(
    "getSiteOrigin never emits localhost into public metadata or OAuth callbacks",
    mod.getSiteOrigin() === "https://theseif.vercel.app" &&
      mod.siteUrl("/api/auth/callback/github") ===
        "https://theseif.vercel.app/api/auth/callback/github",
  );
  delete process.env.SITE_URL;

  // 2. Development allowed origins
  check(
    "Development allows exact same-origin http://localhost:3000",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://localhost:3000/api/admin/content", "http://localhost:3000"),
      "development",
    ) === true,
  );
  check(
    "Development allows exact same-origin http://127.0.0.1:3000",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://127.0.0.1:3000/api/admin/content", "http://127.0.0.1:3000"),
      "development",
    ) === true,
  );
  check(
    "Development allows canonical origin https://theseif.vercel.app",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://127.0.0.1:3000/api/admin/content", "https://theseif.vercel.app"),
      "development",
    ) === true,
  );

  // 3. Development rejected origins
  check(
    "Development rejects missing Origin header",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://localhost:3000/api/admin/content", undefined),
      "development",
    ) === false,
  );
  check(
    "Development rejects null Origin header",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://localhost:3000/api/admin/content", "null"),
      "development",
    ) === false,
  );
  check(
    "Development rejects foreign origin https://attacker.invalid",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://localhost:3000/api/admin/content", "https://attacker.invalid"),
      "development",
    ) === false,
  );
  check(
    "Development rejects cross-port localhost origin (localhost:8080 -> localhost:3000)",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://localhost:3000/api/admin/content", "http://localhost:8080"),
      "development",
    ) === false,
  );
  check(
    "Development rejects mismatched loopback host (127.0.0.1:3000 -> localhost:3000)",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://localhost:3000/api/admin/content", "http://127.0.0.1:3000"),
      "development",
    ) === false,
  );
  check(
    "Development rejects subdomain *.localhost origin",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://localhost:3000/api/admin/content", "http://evil.localhost:3000"),
      "development",
    ) === false,
  );
  check(
    "Development rejects Sec-Fetch-Site: cross-site even with matching localhost origin",
    mod.isAllowedAdminMutationOrigin(
      makeReq(
        "http://localhost:3000/api/admin/content",
        "http://localhost:3000",
        "cross-site",
      ),
      "development",
    ) === false,
  );

  // 4. Production strict origin enforcement
  check(
    "Production accepts canonical origin https://theseif.vercel.app",
    mod.isAllowedAdminMutationOrigin(
      makeReq("https://theseif.vercel.app/api/admin/content", "https://theseif.vercel.app"),
      "production",
    ) === true,
  );
  check(
    "Production strictly rejects http://localhost:3000 even if request URL is localhost",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://localhost:3000/api/admin/content", "http://localhost:3000"),
      "production",
    ) === false,
  );
  check(
    "Production strictly rejects http://127.0.0.1:3000",
    mod.isAllowedAdminMutationOrigin(
      makeReq("http://127.0.0.1:3000/api/admin/content", "http://127.0.0.1:3000"),
      "production",
    ) === false,
  );
  check(
    "Production strictly rejects Sec-Fetch-Site: cross-site on canonical origin",
    mod.isAllowedAdminMutationOrigin(
      makeReq(
        "https://theseif.vercel.app/api/admin/content",
        "https://theseif.vercel.app",
        "cross-site",
      ),
      "production",
    ) === false,
  );

  // 5. Migration SQL idempotency verification
  const migration0 = await fs.readFile(
    path.join(root, "drizzle/0000_contact_messages.sql"),
    "utf8",
  );
  const migration2 = await fs.readFile(
    path.join(root, "drizzle/0002_mixed_doctor_strange.sql"),
    "utf8",
  );
  check(
    "0000_contact_messages.sql uses CREATE TABLE IF NOT EXISTS",
    migration0.includes('CREATE TABLE IF NOT EXISTS "contact_messages"'),
  );
  check(
    "0000_contact_messages.sql uses CREATE INDEX IF NOT EXISTS for contact_messages_ip_hash_created_at_idx",
    migration0.includes(
      'CREATE INDEX IF NOT EXISTS "contact_messages_ip_hash_created_at_idx" ON "contact_messages" USING btree ("ip_hash","created_at")',
    ),
  );
  check(
    "0002_mixed_doctor_strange.sql uses ADD COLUMN IF NOT EXISTS",
    migration2.includes('ADD COLUMN IF NOT EXISTS "deleted_at"'),
  );

  // 6. Contact form validation without external DB
  delete process.env.DATABASE_URL;
  delete process.env.DATABASE_URL_UNPOOLED;
  mod.resetRateLimitForTests();

  const validPayload = {
    name: "Test Sender",
    email: "test@example.com",
    message: "This is a sufficiently long local validation test message.",
    company: "",
    startedAt: Date.now() - 4000,
  };

  const resUnconfigured = await mod.postContact(
    new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.1" },
      body: JSON.stringify(validPayload),
    }),
  );
  const bodyUnconfigured = await resUnconfigured.json();
  check(
    "Contact API returns 503 not_configured when DATABASE_URL is unset",
    resUnconfigured.status === 503 && bodyUnconfigured.status === "not_configured",
  );

  const resInvalid = await mod.postContact(
    new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.2" },
      body: JSON.stringify({ ...validPayload, name: "x", email: "bad", message: "short" }),
    }),
  );
  const bodyInvalid = await resInvalid.json();
  check(
    "Contact API returns 400 invalid with fieldErrors for invalid input",
    resInvalid.status === 400 &&
      bodyInvalid.status === "invalid" &&
      Boolean(bodyInvalid.fieldErrors),
  );

  const resHoneypot = await mod.postContact(
    new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.3" },
      body: JSON.stringify({ ...validPayload, company: "spam-bot" }),
    }),
  );
  const bodyHoneypot = await resHoneypot.json();
  check(
    "Contact API rejects filled honeypot with 400 rejected",
    resHoneypot.status === 400 && bodyHoneypot.status === "rejected",
  );

  const resFast = await mod.postContact(
    new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.4" },
      body: JSON.stringify({ ...validPayload, startedAt: Date.now() }),
    }),
  );
  const bodyFast = await resFast.json();
  check(
    "Contact API rejects too-fast submission (<3s) with 400 rejected",
    resFast.status === 400 && bodyFast.status === "rejected",
  );
} finally {
  await fs.unlink(outfile).catch(() => {});
}

console.log(`ALL ${checks.length} CHECKS PASSED`);
