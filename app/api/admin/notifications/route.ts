import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { notificationOutbox } from "@/lib/db/schema";
import { adminError, adminRequest, ok, readJson } from "@/lib/cms/http";
import { CmsError } from "@/lib/cms/repository";
import {
  dispatchOutboxItem,
  getNotificationsOverview,
  processRetryableOutboxItems,
  resolveUiDeliveryStatus,
  retryOutboxItemById,
  sendTestChannelNotification,
  updateNotificationSettings,
} from "@/lib/notifications/outbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function db() {
  const result = getDb();
  if (!result) {
    throw new CmsError(
      "DATABASE_NOT_CONFIGURED",
      503,
      "Notification storage is not configured.",
    );
  }
  return result;
}

export async function GET(request: Request) {
  try {
    await adminRequest(request);
    const overview = await getNotificationsOverview(db());
    return ok(overview);
  } catch (error) {
    return adminError(error);
  }
}

const patchSettingsSchema = z
  .object({
    emailEnabled: z.boolean().optional(),
    whatsappEnabled: z.boolean().optional(),
    webPushEnabled: z.boolean().optional(),
    instagramEnabled: z.boolean().optional(),
  })
  .strict();

export async function PATCH(request: Request) {
  try {
    const principal = await adminRequest(request, true);
    const patch = patchSettingsSchema.parse(await readJson(request));
    if (patch.instagramEnabled) {
      throw new CmsError(
        "CHANNEL_UNAVAILABLE",
        400,
        "Instagram automated outbound notifications are unavailable due to Meta platform restrictions.",
      );
    }
    const settings = await updateNotificationSettings(
      db(),
      patch,
      principal.session.user.email || principal.session.user.id,
    );
    return ok({ settings });
  } catch (error) {
    return adminError(error);
  }
}

const postActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("test"),
    channel: z.enum(["email", "web_push", "whatsapp", "instagram"]),
  }),
  z.object({
    action: z.literal("retry"),
    outboxId: z.string().uuid().optional(),
    contactMessageId: z.string().uuid().optional(),
    channel: z.enum(["email", "web_push", "whatsapp", "instagram"]).optional(),
  }),
  z.object({
    action: z.literal("process_due"),
  }),
]);

export async function POST(request: Request) {
  try {
    await adminRequest(request, true);
    const body = postActionSchema.parse(await readJson(request));
    const database = db();

    if (body.action === "test") {
      if (body.channel === "instagram") {
        throw new CmsError(
          "CHANNEL_UNAVAILABLE",
          400,
          "Instagram automated outbound notifications are unavailable due to Meta platform restrictions.",
        );
      }
      const result = await sendTestChannelNotification(database, body.channel);
      return ok({
        item: {
          ...result,
          uiStatus: resolveUiDeliveryStatus(result),
        },
      });
    }

    if (body.action === "retry") {
      if (body.channel === "instagram") {
        throw new CmsError(
          "CHANNEL_UNAVAILABLE",
          400,
          "Instagram automated outbound notifications are unavailable due to Meta platform restrictions.",
        );
      }

      if (body.outboxId) {
        const [target] = await database
          .select()
          .from(notificationOutbox)
          .where(eq(notificationOutbox.id, body.outboxId))
          .limit(1);
        if (!target) {
          throw new CmsError("NOT_FOUND", 404, "Outbox record not found.");
        }
        if (target.channel === "instagram") {
          throw new CmsError(
            "CHANNEL_UNAVAILABLE",
            400,
            "Instagram automated outbound notifications are unavailable due to Meta platform restrictions.",
          );
        }
        const retried = await retryOutboxItemById(database, body.outboxId);
        if (!retried) {
          throw new CmsError("NOT_FOUND", 404, "Outbox record not found.");
        }
        return ok({
          item: {
            ...retried,
            uiStatus: resolveUiDeliveryStatus(retried),
          },
        });
      }

      if (body.contactMessageId && body.channel) {
        const [existing] = await database
          .select()
          .from(notificationOutbox)
          .where(
            and(
              eq(notificationOutbox.contactMessageId, body.contactMessageId),
              eq(notificationOutbox.channel, body.channel),
            ),
          )
          .limit(1);

        if (existing) {
          const retried = await retryOutboxItemById(database, existing.id);
          return ok({
            item: retried
              ? { ...retried, uiStatus: resolveUiDeliveryStatus(retried) }
              : null,
          });
        }

        const now = new Date();
        const [created] = await database
          .insert(notificationOutbox)
          .values({
            contactMessageId: body.contactMessageId,
            channel: body.channel,
            status: "pending",
            attempts: 0,
            maxAttempts: 5,
            nextRetryAt: now,
            dedupeKey: `contact:${body.contactMessageId}:${body.channel}`,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        const dispatched = await dispatchOutboxItem(database, created.id, {
          forceManualRetry: true,
        });
        return ok({
          item: dispatched
            ? { ...dispatched, uiStatus: resolveUiDeliveryStatus(dispatched) }
            : null,
        });
      }

      throw new CmsError(
        "INVALID_RETRY_PARAMS",
        400,
        "Provide either outboxId or contactMessageId + channel.",
      );
    }

    const processed = await processRetryableOutboxItems(database);
    return ok({
      processedCount: processed.length,
    });
  } catch (error) {
    return adminError(error);
  }
}
