import { defineConfig } from "drizzle-kit";

function normalizeDatabaseSslMode(url: string): string {
  try {
    const parsed = new URL(url);
    const sslmode = parsed.searchParams.get("sslmode");
    if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }
    return url;
  } catch {
    return url;
  }
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: normalizeDatabaseSslMode(
      process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
    ),
  },
});
