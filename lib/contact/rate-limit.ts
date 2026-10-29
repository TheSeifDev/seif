import { createHmac } from "node:crypto";
import { and, count, eq, gte } from "drizzle-orm";
import type { ContactDb } from "@/lib/db/client";
import { contactMessages } from "@/lib/db/schema";

const MEMORY_LIMIT = 5;
const MEMORY_WINDOW_MS = 10 * 60 * 1_000;
const DATABASE_LIMIT = 3;
const DATABASE_WINDOW_MS = 15 * 60 * 1_000;

const memoryWindows = new Map<string, number[]>();

function prune(now: number): void {
  for (const [key, timestamps] of memoryWindows) {
    const recent = timestamps.filter((timestamp) => now - timestamp < MEMORY_WINDOW_MS);
    if (recent.length === 0) memoryWindows.delete(key);
    else memoryWindows.set(key, recent);
  }
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

  const realIp = headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

export function hashClientIp(ip: string): string | null {
  const secret = process.env.CONTACT_HASH_SECRET?.trim();
  if (!secret || ip === "unknown") return null;
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
};

export async function checkRateLimit(
  db: ContactDb | null,
  memoryKey: string,
  ipHash: string | null,
  now = Date.now(),
): Promise<RateLimitResult> {
  prune(now);
  const timestamps = memoryWindows.get(memoryKey) ?? [];
  const recent = timestamps.filter((timestamp) => now - timestamp < MEMORY_WINDOW_MS);

  if (recent.length >= MEMORY_LIMIT) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + MEMORY_WINDOW_MS - now) / 1_000)),
    };
  }

  if (db && ipHash) {
    const cutoff = new Date(now - DATABASE_WINDOW_MS);
    const [row] = await db
      .select({ count: count() })
      .from(contactMessages)
      .where(and(eq(contactMessages.ipHash, ipHash), gte(contactMessages.createdAt, cutoff)));
    const databaseCount = Number(row?.count ?? 0);

    if (databaseCount >= DATABASE_LIMIT) {
      return { limited: true, retryAfterSeconds: Math.ceil(DATABASE_WINDOW_MS / 1_000) };
    }
  }

  recent.push(now);
  memoryWindows.set(memoryKey, recent);
  return { limited: false, retryAfterSeconds: 0 };
}

export function resetRateLimitForTests(): void {
  memoryWindows.clear();
}
