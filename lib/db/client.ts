import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema";

type ContactDb = NodePgDatabase<typeof schema>;

type DbGlobals = typeof globalThis & {
  __contactPool?: Pool;
  __contactPoolUrl?: string;
  __contactDb?: ContactDb;
};

const globals = globalThis as DbGlobals;

export function getDb(): ContactDb | null {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) return null;

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
