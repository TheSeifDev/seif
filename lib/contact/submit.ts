import { createHash } from "node:crypto";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { getDb, type ContactDb } from "@/lib/db/client";
import { contactMessages } from "@/lib/db/schema";
import {
  fieldErrorsFromZod,
  contactSchema,
  type ContactFieldErrors,
  type ContactInput,
} from "@/lib/contact/schema";
import {
  DATABASE_LIMIT,
  DATABASE_WINDOW_MS,
  clientIpFromHeaders,
  getIpHashSecret,
  hashClientIp,
  peekMemoryRateLimit,
  recordMemoryRateLimitAttempt,
} from "@/lib/contact/rate-limit";
import { processContactMessageOutbox } from "@/lib/notifications/outbox";

export type ContactResult =
  | {
      status: "saved";
      notification: "sent" | "failed" | "not_configured";
      id: string;
      deduplicated?: boolean;
    }
  | { status: "invalid"; fieldErrors: ContactFieldErrors }
  | { status: "rejected" }
  | { status: "rate_limited"; retryAfterSeconds: number }
  | { status: "not_configured" }
  | { status: "error" };

const inFlightSubmissions = new Map<string, Promise<ContactResult>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractIdempotencyKey(
  parsedData: ContactInput,
  headers: Headers,
): string | null {
  const headerKey =
    headers.get("idempotency-key")?.trim() ||
    headers.get("x-idempotency-key")?.trim() ||
    "";
  if (headerKey.length >= 8 && headerKey.length <= 128) {
    return headerKey;
  }
  if (parsedData.idempotencyKey && parsedData.idempotencyKey.length >= 8) {
    return parsedData.idempotencyKey;
  }
  return null;
}

/**
 * Deterministically derives a valid RFC 4122 v4-formatted UUID from a canonical seed string.
 * This allows PostgreSQL's `contact_messages.id` primary key to enforce atomic server-side
 * idempotency without altering the table schema.
 */
export function deriveDeterministicSubmissionId(seed: string): string {
  const bytes = Buffer.from(
    createHash("sha256").update(seed, "utf8").digest().subarray(0, 16),
  );
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function buildSubmissionIdentity(
  parsedData: ContactInput,
  ip: string,
  ipHash: string | null,
  explicitKey: string | null,
): { submissionId: string; inFlightKey: string } {
  const normalizedEmail = parsedData.email.trim().toLowerCase();
  const normalizedName = parsedData.name.trim();
  const normalizedSubject = parsedData.subject?.trim() || "";
  const normalizedMessage = parsedData.message.trim();
  const senderScope = ipHash || ip || "unknown";

  if (explicitKey) {
    const seed = `contact:idemp:v1:${normalizedEmail}:${explicitKey}`;
    const submissionId = deriveDeterministicSubmissionId(seed);
    return {
      submissionId,
      inFlightKey: seed,
    };
  }

  const contentFingerprint = `${senderScope}|${normalizedEmail}|${normalizedName}|${normalizedSubject}|${normalizedMessage}`;
  const seed = `contact:form:v1:${contentFingerprint}|${parsedData.startedAt}`;
  return {
    submissionId: deriveDeterministicSubmissionId(seed),
    inFlightKey: `contact:inflight:v1:${contentFingerprint}`,
  };
}

type Executor = Pick<ContactDb, "select" | "insert" | "execute">;

async function findExistingSubmissionResult(
  executor: Executor,
  submissionId: string,
): Promise<ContactResult | null> {
  const [existing] = await executor
    .select({
      id: contactMessages.id,
      notificationStatus: contactMessages.notificationStatus,
    })
    .from(contactMessages)
    .where(eq(contactMessages.id, submissionId))
    .limit(1);

  if (!existing) {
    return null;
  }

  const notification =
    existing.notificationStatus === "sent" ||
    existing.notificationStatus === "failed" ||
    existing.notificationStatus === "not_configured"
      ? existing.notificationStatus
      : "not_configured";

  return {
    status: "saved",
    notification,
    id: existing.id,
    deduplicated: true,
  };
}

export async function submitContact(
  input: unknown,
  headers: Headers,
): Promise<ContactResult> {
  if (!isRecord(input) || !("startedAt" in input)) {
    return { status: "rejected" };
  }
  if (typeof input.company === "string" && input.company.trim() !== "") {
    return { status: "rejected" };
  }

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const now = Date.now();
  if (
    parsed.data.company.trim() !== "" ||
    parsed.data.startedAt > now + 2_000 ||
    now - parsed.data.startedAt < 3_000
  ) {
    return { status: "rejected" };
  }

  const db = getDb();
  const ip = clientIpFromHeaders(headers);
  const ipHashSecret = getIpHashSecret();
  const ipHash = hashClientIp(ip);

  // If database or server-side IP HMAC secret is not configured, check memory rate limit
  // and fail closed with 503 `not_configured` (never persisting raw IPs or using public secrets).
  if (!db || !ipHashSecret) {
    const memLimit = peekMemoryRateLimit(ip, now);
    if (memLimit.limited) {
      return {
        status: "rate_limited",
        retryAfterSeconds: memLimit.retryAfterSeconds,
      };
    }
    recordMemoryRateLimitAttempt(ip, now);
    return { status: "not_configured" };
  }

  const explicitKey = extractIdempotencyKey(parsed.data, headers);
  const { submissionId, inFlightKey } = buildSubmissionIdentity(
    parsed.data,
    ip,
    ipHash,
    explicitKey,
  );

  // 1. Coalesce concurrent identical in-flight submissions on the same runtime instance
  const activePromise = inFlightSubmissions.get(inFlightKey);
  if (activePromise) {
    return activePromise;
  }

  const executionPromise = (async (): Promise<ContactResult> => {
    try {
      const lockScopeKey = ipHash || "unknown-ip";

      // 2. Execute atomic check-and-insert inside a PostgreSQL transaction protected by a
      // transaction-scoped per-IP advisory lock (`pg_advisory_xact_lock`).
      // This serializes concurrent distinct requests from the same IP across all workers/connections
      // so they cannot simultaneously pass the `count < DATABASE_LIMIT` check before inserting.
      const txOutcome = await db.transaction(
        async (
          tx,
        ): Promise<
          | { kind: "existing"; result: ContactResult }
          | { kind: "rate_limited"; retryAfterSeconds: number }
          | { kind: "inserted"; id: string }
          | { kind: "error" }
        > => {
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(hashtext('contact_rate_limit'), hashtext(${lockScopeKey}))`,
          );

          // 2a. Idempotency check BEFORE charging rate-limit quota
          const existingResult = await findExistingSubmissionResult(
            tx,
            submissionId,
          );
          if (existingResult) {
            return { kind: "existing", result: existingResult };
          }

          // 2b. Fast in-memory sliding window check (5 per 10m)
          const memCheck = peekMemoryRateLimit(ip, now);
          if (memCheck.limited) {
            return {
              kind: "rate_limited",
              retryAfterSeconds: memCheck.retryAfterSeconds,
            };
          }

          // 2c. Durable PostgreSQL sliding window check (3 per 15m per ipHash)
          if (ipHash) {
            const cutoff = new Date(now - DATABASE_WINDOW_MS);
            const [row] = await tx
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
                kind: "rate_limited",
                retryAfterSeconds: Math.ceil(DATABASE_WINDOW_MS / 1_000),
              };
            }
          }

          // 2d. Record in-memory attempt and insert row inside the locked transaction
          recordMemoryRateLimitAttempt(ip, now);

          const [saved] = await tx
            .insert(contactMessages)
            .values({
              id: submissionId,
              name: parsed.data.name,
              email: parsed.data.email,
              subject: parsed.data.subject?.trim() || null,
              message: parsed.data.message,
              ipHash,
            })
            .onConflictDoNothing({ target: contactMessages.id })
            .returning({ id: contactMessages.id });

          if (!saved) {
            const concurrentExisting = await findExistingSubmissionResult(
              tx,
              submissionId,
            );
            if (concurrentExisting) {
              return { kind: "existing", result: concurrentExisting };
            }
            return { kind: "error" };
          }

          return { kind: "inserted", id: saved.id };
        },
      );

      if (txOutcome.kind === "existing") {
        return txOutcome.result;
      }
      if (txOutcome.kind === "rate_limited") {
        return {
          status: "rate_limited",
          retryAfterSeconds: txOutcome.retryAfterSeconds,
        };
      }
      if (txOutcome.kind === "error") {
        return { status: "error" };
      }

      // 3. Enqueue and dispatch omnichannel notifications outside the lock transaction.
      // A failure in outbox or notification dispatch MUST NOT fail the saved contact message.
      try {
        const summary = await processContactMessageOutbox(db, txOutcome.id);
        return {
          status: "saved",
          notification: summary.notificationStatus,
          id: txOutcome.id,
        };
      } catch {
        return {
          status: "saved",
          notification: "failed",
          id: txOutcome.id,
        };
      }
    } catch {
      return { status: "error" };
    }
  })();

  inFlightSubmissions.set(inFlightKey, executionPromise);
  try {
    return await executionPromise;
  } finally {
    inFlightSubmissions.delete(inFlightKey);
  }
}
