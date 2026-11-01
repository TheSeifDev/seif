import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema";
import { assertDatabaseIsolation } from "@/lib/config/environment-guard";

type ContactDb = NodePgDatabase<typeof schema>;

type DbGlobals = typeof globalThis & {
  __contactPool?: Pool;
  __contactPoolUrl?: string;
  __contactDb?: ContactDb;
};

const globals = globalThis as DbGlobals;

/**
 * Normalizes deprecated/aliased sslmode values ('require', 'prefer', 'verify-ca')
 * to 'verify-full' for managed PostgreSQL endpoints (e.g. Neon) to eliminate
 * the node-postgres security warning:
 * "SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'."
 */
export function normalizeDatabaseSslMode(url: string): string {
  try {
    const parsed = new URL(url);
    const sslmode = parsed.searchParams.get("sslmode");
    if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }
    return url;
  } catch {
    return url.replace(/([?&]sslmode=)(require|prefer|verify-ca)(?=&|$)/, "$1verify-full");
  }
}

export function getDb(): ContactDb | null {
  const rawConnectionString = (
    process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED
  )?.trim();
  if (!rawConnectionString) return null;

  assertDatabaseIsolation(rawConnectionString);

  const connectionString = normalizeDatabaseSslMode(rawConnectionString);

  if (globals.__contactDb && globals.__contactPoolUrl === connectionString) {
    return globals.__contactDb;
  }

  if (globals.__contactPool && globals.__contactPoolUrl !== connectionString) {
    void globals.__contactPool.end();
    globals.__contactPool = undefined;
    globals.__contactDb = undefined;
  }

  const pool =
    globals.__contactPool ??
    new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 5_000,
    });
  const db = drizzle(pool, { schema });

  globals.__contactPool = pool;
  globals.__contactPoolUrl = connectionString;
  globals.__contactDb = db;
  return db;
}

/** Used by local integration tests and graceful process shutdowns. */
export async function closeDb(): Promise<void> {
  if (globals.__contactPool) await globals.__contactPool.end();
  globals.__contactPool = undefined;
  globals.__contactPoolUrl = undefined;
  globals.__contactDb = undefined;
}

export type { ContactDb };
