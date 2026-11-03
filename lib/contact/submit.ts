import { getDb } from "@/lib/db/client";
import { contactMessages } from "@/lib/db/schema";
import {
  fieldErrorsFromZod,
  contactSchema,
  type ContactFieldErrors,
} from "@/lib/contact/schema";
import {
  checkRateLimit,
  clientIpFromHeaders,
  hashClientIp,
} from "@/lib/contact/rate-limit";
import { processContactMessageOutbox } from "@/lib/notifications/outbox";

export type ContactResult =
  | {
      status: "saved";
      notification: "sent" | "failed" | "not_configured";
      id: string;
    }
  | { status: "invalid"; fieldErrors: ContactFieldErrors }
  | { status: "rejected" }
  | { status: "rate_limited"; retryAfterSeconds: number }
  | { status: "not_configured" }
  | { status: "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function submitContact(
  input: unknown,
  headers: Headers
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
    parsed.data.startedAt > now ||
    now - parsed.data.startedAt < 3_000
  ) {
    return { status: "rejected" };
  }

  const db = getDb();
  const ip = clientIpFromHeaders(headers);
  const ipHash = hashClientIp(ip);

  try {
    const limit = await checkRateLimit(db, ip, ipHash, now);
    if (limit.limited) {
      return {
        status: "rate_limited",
        retryAfterSeconds: limit.retryAfterSeconds,
      };
    }

    if (!db) return { status: "not_configured" };

    // Step 1: Always persist the contact message first
    const [saved] = await db
      .insert(contactMessages)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject?.trim() || null,
        message: parsed.data.message,
        ipHash,
      })
      .returning({ id: contactMessages.id });

    if (!saved) return { status: "error" };

    // Step 2: Enqueue and dispatch omnichannel notifications independently.
    // A failure in outbox or notification dispatch MUST NOT fail the saved contact message.
    try {
      const summary = await processContactMessageOutbox(db, saved.id);
      return {
        status: "saved",
        notification: summary.notificationStatus,
        id: saved.id,
      };
    } catch {
      return {
        status: "saved",
        notification: "failed",
        id: saved.id,
      };
    }
  } catch {
    return { status: "error" };
  }
}
