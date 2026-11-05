import { z } from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { contactMessages, notificationOutbox } from "@/lib/db/schema";
import { adminError, adminRequest, ok, readJson } from "@/lib/cms/http";
import { CmsError } from "@/lib/cms/repository";
import {
  getAllChannelReadiness,
  getNotificationSettings,
  isChannelEnabledInSettings,
  processRetryableOutboxItems,
  resolveUiDeliveryStatus,
} from "@/lib/notifications/outbox";
import {
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
  type NotificationUiStatus,
} from "@/lib/notifications/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function db() {
  const result = getDb();
  if (!result)
    throw new CmsError(
      "DATABASE_NOT_CONFIGURED",
      503,
      "Inbox storage is not configured.",
    );
  return result;
}

export async function GET(request: Request) {
  try {
    await adminRequest(request);
    const database = db();

    // Opportunistically drain up to 5 due retryable outbox items synchronously
    // when the owner opens or refreshes the Inbox.
    try {
      await processRetryableOutboxItems(database, 5);
    } catch {
      // Never fail Inbox loading if retry sweep encounters an issue
    }

    const rows = await database
      .select({
        id: contactMessages.id,
        name: contactMessages.name,
        email: contactMessages.email,
        subject: contactMessages.subject,
        message: contactMessages.message,
        status: contactMessages.status,
        createdAt: contactMessages.createdAt,
        readAt: contactMessages.readAt,
        notificationStatus: contactMessages.notificationStatus,
      })
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(200);

    const messageIds = rows.map((r) => r.id);
    const outboxRows =
      messageIds.length > 0
        ? await database
            .select()
            .from(notificationOutbox)
            .where(inArray(notificationOutbox.contactMessageId, messageIds))
        : [];

    const settings = await getNotificationSettings(database);
    const readiness = await getAllChannelReadiness(database);

    const outboxByMessage = new Map<string, typeof outboxRows>();
    for (const row of outboxRows) {
      if (!row.contactMessageId) continue;
      const list = outboxByMessage.get(row.contactMessageId) ?? [];
      list.push(row);
      outboxByMessage.set(row.contactMessageId, list);
    }

    const items = rows.map((msg) => {
      const msgOutbox = outboxByMessage.get(msg.id) ?? [];
      const deliveries = NOTIFICATION_CHANNELS.map((channel) => {
        const match = msgOutbox.find((o) => o.channel === channel);
        if (match) {
          return {
            outboxId: match.id,
            channel,
            status: resolveUiDeliveryStatus(match),
            attempts: match.attempts,
            maxAttempts: match.maxAttempts,
            sentAt: match.sentAt ? match.sentAt.toISOString() : null,
            lastAttemptAt: match.lastAttemptAt
              ? match.lastAttemptAt.toISOString()
              : null,
            nextRetryAt: match.nextRetryAt
              ? match.nextRetryAt.toISOString()
              : null,
            providerMessageId: match.providerMessageId,
            providerStatus: match.providerStatus,
            lastErrorCode: match.lastErrorCode,
            lastErrorMessage: match.lastErrorMessage,
          };
        }

        // For historical messages saved before notification_outbox existed
        let fallbackStatus: NotificationUiStatus = "not_configured";
        if (channel === "instagram") {
          fallbackStatus = "unavailable";
        } else if (channel === "email") {
          if (msg.notificationStatus === "sent") fallbackStatus = "sent";
          else if (msg.notificationStatus === "failed")
            fallbackStatus = "failed";
          else
            fallbackStatus = readiness.email.configured
              ? "skipped"
              : "not_configured";
        } else {
          if (!isChannelEnabledInSettings(settings, channel)) {
            fallbackStatus = "skipped";
          } else if (!readiness[channel].configured) {
            fallbackStatus = "not_configured";
          } else {
            fallbackStatus = "skipped";
          }
        }

        return {
          outboxId: null,
          channel: channel as NotificationChannel,
          status: fallbackStatus,
          attempts: 0,
          maxAttempts: 5,
          sentAt: null,
          lastAttemptAt: null,
          nextRetryAt: null,
          providerMessageId: null,
          providerStatus: null,
          lastErrorCode: null,
          lastErrorMessage: null,
        };
      });

      return {
        ...msg,
        deliveries,
      };
    });

    return ok({ items });
  } catch (error) {
    return adminError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await adminRequest(request, true);
    const { id, status } = z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "read", "archived"]),
      })
      .strict()
      .parse(await readJson(request));
    const rows = await db()
      .update(contactMessages)
      .set({ status, readAt: status === "new" ? null : new Date() })
      .where(eq(contactMessages.id, id))
      .returning({
        id: contactMessages.id,
        status: contactMessages.status,
        readAt: contactMessages.readAt,
      });
    if (!rows.length)
      throw new CmsError("NOT_FOUND", 404, "Message not found.");
    return ok({
      id: rows[0].id,
      status: rows[0].status,
      readAt: rows[0].readAt ? rows[0].readAt.toISOString() : null,
    });
  } catch (error) {
    return adminError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await adminRequest(request, true);
    const { id } = z
      .object({ id: z.string().uuid() })
      .strict()
      .parse(await readJson(request));
    const rows = await db()
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning({ id: contactMessages.id });
    if (!rows.length)
      throw new CmsError("NOT_FOUND", 404, "Message not found.");
    return ok({ id });
  } catch (error) {
    return adminError(error);
  }
}
