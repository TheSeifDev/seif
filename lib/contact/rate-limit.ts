import { createHmac } from "node:crypto";
import { and, count, eq, gte } from "drizzle-orm";
import type { ContactDb } from "@/lib/db/client";
import { contactMessages } from "@/lib/db/schema";

export const MEMORY_LIMIT = 5;
export const MEMORY_WINDOW_MS = 10 * 60 * 1_000;
export const DATABASE_LIMIT = 3;
export const DATABASE_WINDOW_MS = 15 * 60 * 1_000;

const memoryWindows = new Map<string, number[]>();

function prune(now: number): void {
  for (const [key, timestamps] of memoryWindows) {
    const recent = timestamps.filter(
      (timestamp) => now - timestamp < MEMORY_WINDOW_MS,
    );
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

/**
 * Returns the server-side HMAC secret used to hash client IP addresses.
 * Exact fallback order:
 * 1. `CONTACT_HASH_SECRET`
 * 2. `BETTER_AUTH_SECRET`
 * Never falls back to a hardcoded public string in source code.
 */
export function getIpHashSecret(): string | null {
  const contactSecret = process.env.CONTACT_HASH_SECRET?.trim();
  if (contactSecret) return contactSecret;

  const authSecret = process.env.BETTER_AUTH_SECRET?.trim();
  if (authSecret) return authSecret;

  return null;
}

export function hashClientIp(ip: string): string | null {
  const normalizedIp = ip.trim();
  if (!normalizedIp || normalizedIp === "unknown") return null;

  const secret = getIpHashSecret();
  if (!secret) return null;

  return createHmac("sha256", secret).update(normalizedIp).digest("hex");
}

export type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
};

/**
 * Checks the in-memory sliding window without recording a new attempt yet.
 */
export function peekMemoryRateLimit(
  memoryKey: string,
  now = Date.now(),
): RateLimitResult {
  prune(now);
  const timestamps = memoryWindows.get(memoryKey) ?? [];
  const recent = timestamps.filter(
    (timestamp) => now - timestamp < MEMORY_WINDOW_MS,
  );

  if (recent.length >= MEMORY_LIMIT) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((recent[0] + MEMORY_WINDOW_MS - now) / 1_000),
      ),
    };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

/**
 * Records an allowed attempt in the in-memory sliding window.
 */
export function recordMemoryRateLimitAttempt(
  memoryKey: string,
  now = Date.now(),
): void {
  prune(now);
  const timestamps = memoryWindows.get(memoryKey) ?? [];
  const recent = timestamps.filter(
    (timestamp) => now - timestamp < MEMORY_WINDOW_MS,
  );
  recent.push(now);
  memoryWindows.set(memoryKey, recent);
}

export async function checkRateLimit(
  db: ContactDb | null,
  memoryKey: string,
  ipHash: string | null,
  now = Date.now(),
): Promise<RateLimitResult> {
  const memCheck = peekMemoryRateLimit(memoryKey, now);
  if (memCheck.limited) {
    return memCheck;
  }

  if (db && ipHash) {
    const cutoff = new Date(now - DATABASE_WINDOW_MS);
    const [row] = await db
      .select({ count: count() })
      .from(contactMessages)
      .where(
        and(
          eq(contactMessages.ipHash, ipHash),
          gte(contactMessages.createdAt, cutoff),
        ),
      );
    const databaseCount = Number(row?.count ?? 0);

    if (databaseCount >= DATABASE_LIMIT) {
      return {
        limited: true,
        retryAfterSeconds: Math.ceil(DATABASE_WINDOW_MS / 1_000),
      };
    }
  }

  recordMemoryRateLimitAttempt(memoryKey, now);
  return { limited: false, retryAfterSeconds: 0 };
}

export function resetRateLimitForTests(): void {
  memoryWindows.clear();
}
