import { and, desc, eq, inArray, isNull, lte, or } from "drizzle-orm";
import type { ContactDb } from "@/lib/db/client";
import {
  contactMessages,
  notificationOutbox,
  notificationSettings,
  pushSubscriptions,
} from "@/lib/db/schema";
import {
  NOTIFICATION_CHANNELS,
  type ChannelDispatchResult,
  type ChannelReadiness,
  type NotificationAlertPayload,
  type NotificationChannel,
  type NotificationOutboxStatus,
  type NotificationUiStatus,
} from "./types";
import {
  getEmailConfigReadiness,
  sanitizeExcerpt,
  sendEmailNotification,
} from "./email";
import {
  getVapidConfig,
  getWebPushConfigReadiness,
  sendWebPushNotification,
} from "./web-push";
import { getWhatsAppConfigReadiness, whatsappAdapter } from "./whatsapp";

const SETTINGS_ID = "default";
const DEFAULT_MAX_ATTEMPTS = 5;
const STALE_PROCESSING_MS = 2 * 60 * 1000; // 2 minutes

export interface NotificationSettingsState {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  webPushEnabled: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

export function getSiteBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : "");
  return (explicit || "http://localhost:3000").replace(/\/+$/, "");
}

export function computeNextRetryAt(
  attempts: number,
  maxAttempts: number,
  now = new Date(),
): Date | null {
  if (attempts >= maxAttempts) {
    return null;
  }
  // Bounded exponential backoff: 30s, 120s, 480s, 1800s
  const delaySeconds = Math.min(
    30 * Math.pow(4, Math.max(0, attempts - 1)),
    1800,
  );
  return new Date(now.getTime() + delaySeconds * 1000);
}

export async function getNotificationSettings(
  db: ContactDb,
): Promise<NotificationSettingsState> {
  try {
    const [row] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.id, SETTINGS_ID))
      .limit(1);

    if (row) {
      return {
        emailEnabled: row.emailEnabled,
        whatsappEnabled: row.whatsappEnabled,
        webPushEnabled: row.webPushEnabled,
        updatedAt: row.updatedAt.toISOString(),
        updatedBy: row.updatedBy ?? null,
      };
    }

    const [created] = await db
      .insert(notificationSettings)
      .values({
        id: SETTINGS_ID,
        emailEnabled: true,
        whatsappEnabled: false,
        webPushEnabled: true,
      })
      .onConflictDoNothing()
      .returning();

    if (created) {
      return {
        emailEnabled: created.emailEnabled,
        whatsappEnabled: created.whatsappEnabled,
        webPushEnabled: created.webPushEnabled,
        updatedAt: created.updatedAt.toISOString(),
        updatedBy: created.updatedBy ?? null,
      };
    }
  } catch {
    // Fallback if table is not yet reachable
  }

  return {
    emailEnabled: true,
    whatsappEnabled: false,
    webPushEnabled: true,
    updatedAt: new Date().toISOString(),
    updatedBy: null,
  };
}

export async function updateNotificationSettings(
  db: ContactDb,
  patch: Partial<
    Pick<
      NotificationSettingsState,
      "emailEnabled" | "whatsappEnabled" | "webPushEnabled"
    >
  >,
  actorId = "owner",
): Promise<NotificationSettingsState> {
  const current = await getNotificationSettings(db);
  const nextValues = {
    emailEnabled: patch.emailEnabled ?? current.emailEnabled,
    whatsappEnabled: patch.whatsappEnabled ?? current.whatsappEnabled,
    webPushEnabled: patch.webPushEnabled ?? current.webPushEnabled,
    updatedAt: new Date(),
    updatedBy: actorId,
  };

  const [updated] = await db
    .insert(notificationSettings)
    .values({
      id: SETTINGS_ID,
      ...nextValues,
    })
    .onConflictDoUpdate({
      target: notificationSettings.id,
      set: nextValues,
    })
    .returning();

  return {
    emailEnabled: updated.emailEnabled,
    whatsappEnabled: updated.whatsappEnabled,
    webPushEnabled: updated.webPushEnabled,
    updatedAt: updated.updatedAt.toISOString(),
    updatedBy: updated.updatedBy ?? null,
  };
}

export function isChannelEnabledInSettings(
  settings: NotificationSettingsState,
  channel: NotificationChannel,
): boolean {
  switch (channel) {
    case "email":
      return settings.emailEnabled;
    case "web_push":
      return settings.webPushEnabled;
    case "whatsapp":
      return settings.whatsappEnabled;
  }
}

export async function getAllChannelReadiness(
  db: ContactDb,
): Promise<Record<NotificationChannel, ChannelReadiness>> {
  let activeSubCount = 0;
  try {
    const subs = await db
      .select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(isNull(pushSubscriptions.revokedAt));
    activeSubCount = subs.length;
  } catch {
    activeSubCount = 0;
  }

  const settings = await getNotificationSettings(db);

  const lastSentMap: Record<NotificationChannel, string | null> = {
    email: null,
    web_push: null,
    whatsapp: null,
  };

  try {
    for (const ch of NOTIFICATION_CHANNELS) {
      const [latestSent] = await db
        .select({ sentAt: notificationOutbox.sentAt })
        .from(notificationOutbox)
        .where(
          and(
            eq(notificationOutbox.channel, ch),
            eq(notificationOutbox.status, "sent"),
          ),
        )
        .orderBy(desc(notificationOutbox.sentAt))
        .limit(1);
      if (latestSent?.sentAt) {
        lastSentMap[ch] = latestSent.sentAt.toISOString();
      }
    }
  } catch {
    // Ignore if outbox query fails
  }

  return {
    email: getEmailConfigReadiness(settings.emailEnabled, lastSentMap.email),
    web_push: getWebPushConfigReadiness(
      activeSubCount,
      settings.webPushEnabled,
      lastSentMap.web_push,
    ),
    whatsapp: getWhatsAppConfigReadiness(
      settings.whatsappEnabled,
      lastSentMap.whatsapp,
    ),
  };
}

export function resolveUiDeliveryStatus(item: {
  status: string;
  lastErrorCode?: string | null;
  providerStatus?: string | null;
}): NotificationUiStatus {
  if (
    item.lastErrorCode === "NOT_CONFIGURED" ||
    item.lastErrorCode === "VAPID_NOT_CONFIGURED" ||
    item.lastErrorCode === "WHATSAPP_NOT_CONFIGURED" ||
    item.providerStatus === "not_configured"
  ) {
    return "not_configured";
  }
  const s = item.status as NotificationOutboxStatus;
  if (
    s === "pending" ||
    s === "processing" ||
    s === "sent" ||
    s === "failed" ||
    s === "skipped"
  ) {
    return s;
  }
  return "pending";
}

export async function enqueueContactNotifications(
  db: ContactDb,
  contactMessageId: string,
) {
  const settings = await getNotificationSettings(db);
  const readiness = await getAllChannelReadiness(db);
  const now = new Date();

  const values = NOTIFICATION_CHANNELS.map((channel: NotificationChannel) => {
    const enabled = isChannelEnabledInSettings(settings, channel);
    const channelReady = readiness[channel].configured;
    const dedupeKey = `contact:${contactMessageId}:${channel}`;

    if (!enabled) {
      return {
        contactMessageId,
        channel,
        status: "skipped" as const,
        attempts: 0,
        maxAttempts: DEFAULT_MAX_ATTEMPTS,
        providerStatus: "channel_disabled",
        lastErrorCode: "CHANNEL_DISABLED",
        lastErrorMessage: `${channel} notifications are disabled in Notification Settings.`,
        dedupeKey,
        createdAt: now,
        updatedAt: now,
      };
    }

    if (!channelReady) {
      return {
        contactMessageId,
        channel,
        status: "skipped" as const,
        attempts: 0,
        maxAttempts: DEFAULT_MAX_ATTEMPTS,
        providerStatus: "not_configured",
        lastErrorCode: "NOT_CONFIGURED",
        lastErrorMessage: readiness[channel].details,
        dedupeKey,
        createdAt: now,
        updatedAt: now,
      };
    }

    return {
      contactMessageId,
      channel,
      status: "pending" as const,
      attempts: 0,
      maxAttempts: DEFAULT_MAX_ATTEMPTS,
      nextRetryAt: now,
      dedupeKey,
      createdAt: now,
      updatedAt: now,
    };
  });

  await db
    .insert(notificationOutbox)
    .values(values)
    .onConflictDoNothing({ target: notificationOutbox.dedupeKey });

  return db
    .select()
    .from(notificationOutbox)
    .where(eq(notificationOutbox.contactMessageId, contactMessageId));
}

async function executeChannelAdapter(
  db: ContactDb,
  channel: NotificationChannel,
  payload: NotificationAlertPayload,
): Promise<ChannelDispatchResult> {
  switch (channel) {
    case "email":
      return sendEmailNotification(payload);
    case "web_push":
      return sendWebPushNotification(db, payload);
    case "whatsapp":
      return whatsappAdapter.send(payload);
  }
}

export async function dispatchOutboxItem(
  db: ContactDb,
  outboxId: string,
  options?: { forceManualRetry?: boolean },
) {
  const now = new Date();
  const staleCutoff = new Date(now.getTime() - STALE_PROCESSING_MS);

  const [existing] = await db
    .select()
    .from(notificationOutbox)
    .where(eq(notificationOutbox.id, outboxId))
    .limit(1);

  if (!existing) {
    return null;
  }

  // Idempotency guard: never re-send an already sent notification
  if (existing.status === "sent") {
    return existing;
  }

  // Concurrency guard: if currently processing and not stale, skip
  if (
    existing.status === "processing" &&
    existing.lastAttemptAt &&
    existing.lastAttemptAt > staleCutoff &&
    !options?.forceManualRetry
  ) {
    return existing;
  }

  const channel = existing.channel as NotificationChannel;
  const settings = await getNotificationSettings(db);
  if (
    !isChannelEnabledInSettings(settings, channel) &&
    !options?.forceManualRetry
  ) {
    const [skippedRow] = await db
      .update(notificationOutbox)
      .set({
        status: "skipped",
        providerStatus: "channel_disabled",
        lastErrorCode: "CHANNEL_DISABLED",
        lastErrorMessage: `${channel} channel is disabled in Notification Settings.`,
        nextRetryAt: null,
        updatedAt: now,
      })
      .where(eq(notificationOutbox.id, outboxId))
      .returning();
    return skippedRow ?? existing;
  }

  const nextAttempts = existing.attempts + 1;

  // Claim item as processing
  const [claimed] = await db
    .update(notificationOutbox)
    .set({
      status: "processing",
      attempts: nextAttempts,
      lastAttemptAt: now,
      updatedAt: now,
    })
    .where(eq(notificationOutbox.id, outboxId))
    .returning();

  if (!claimed) {
    return existing;
  }

  // Load associated contact message if present
  let payload: NotificationAlertPayload;
  const baseUrl = getSiteBaseUrl();

  if (claimed.contactMessageId) {
    const [msg] = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, claimed.contactMessageId))
      .limit(1);

    if (!msg) {
      const [failedNoMsg] = await db
        .update(notificationOutbox)
        .set({
          status: "skipped",
          lastErrorCode: "MESSAGE_NOT_FOUND",
          lastErrorMessage: "Associated contact message no longer exists.",
          nextRetryAt: null,
          updatedAt: new Date(),
        })
        .where(eq(notificationOutbox.id, outboxId))
        .returning();
      return failedNoMsg ?? claimed;
    }

    const inboxPath = `/dashboard/inbox?messageId=${encodeURIComponent(msg.id)}`;
    payload = {
      contactMessageId: msg.id,
      dedupeKey: claimed.dedupeKey,
      senderName: msg.name,
      senderEmail: msg.email,
      subject: msg.subject || "Portfolio contact inquiry",
      messageExcerpt: sanitizeExcerpt(msg.message, 500),
      fullMessage: msg.message,
      receivedAtIso: msg.createdAt.toISOString(),
      inboxUrl: `${baseUrl}${inboxPath}`,
      inboxPath,
    };
  } else {
    const inboxPath = "/dashboard/inbox";
    payload = {
      contactMessageId: null,
      dedupeKey: claimed.dedupeKey,
      senderName: "Seif Portfolio Admin",
      senderEmail: "owner@portfolio.local",
      subject: `Test ${channel} notification`,
      messageExcerpt: `This is an owner-triggered test notification for the ${channel} channel.`,
      fullMessage: `This is an owner-triggered test notification for the ${channel} channel.`,
      receivedAtIso: now.toISOString(),
      inboxUrl: `${baseUrl}${inboxPath}`,
      inboxPath,
      isTest: true,
    };
  }

  const result = await executeChannelAdapter(db, channel, payload);
  const completedAt = new Date();

  if (result.status === "sent") {
    const [sentRow] = await db
      .update(notificationOutbox)
      .set({
        status: "sent",
        sentAt: completedAt,
        providerMessageId: result.providerMessageId ?? null,
        providerStatus: result.providerStatus ?? "sent",
        lastErrorCode: null,
        lastErrorMessage: result.errorMessage ?? null,
        nextRetryAt: null,
        updatedAt: completedAt,
      })
      .where(eq(notificationOutbox.id, outboxId))
      .returning();

    if (claimed.contactMessageId) {
      await syncContactMessageNotificationSummary(db, claimed.contactMessageId);
    }
    return sentRow ?? claimed;
  }

  if (result.status === "not_configured" || result.status === "skipped") {
    const [skippedRow] = await db
      .update(notificationOutbox)
      .set({
        status: "skipped",
        providerStatus:
          result.status === "not_configured"
            ? "not_configured"
            : (result.providerStatus ?? "skipped"),
        lastErrorCode:
          result.errorCode ??
          (result.status === "not_configured" ? "NOT_CONFIGURED" : "SKIPPED"),
        lastErrorMessage: result.errorMessage ?? null,
        nextRetryAt: null,
        updatedAt: completedAt,
      })
      .where(eq(notificationOutbox.id, outboxId))
      .returning();

    if (claimed.contactMessageId) {
      await syncContactMessageNotificationSummary(db, claimed.contactMessageId);
    }
    return skippedRow ?? claimed;
  }

  // Failed delivery: schedule bounded retry if retryable and attempts < maxAttempts
  const nextRetryAt = result.retryable
    ? computeNextRetryAt(nextAttempts, claimed.maxAttempts, completedAt)
    : null;

  const [failedRow] = await db
    .update(notificationOutbox)
    .set({
      status: "failed",
      providerStatus: result.providerStatus ?? "failed",
      lastErrorCode: result.errorCode ?? "DELIVERY_FAILED",
      lastErrorMessage: result.errorMessage ?? "Channel delivery failed.",
      nextRetryAt,
      updatedAt: completedAt,
    })
    .where(eq(notificationOutbox.id, outboxId))
    .returning();

  if (claimed.contactMessageId) {
    await syncContactMessageNotificationSummary(db, claimed.contactMessageId);
  }
  return failedRow ?? claimed;
}

export async function syncContactMessageNotificationSummary(
  db: ContactDb,
  contactMessageId: string,
): Promise<{
  notificationStatus: "sent" | "failed" | "not_configured";
  notificationError: string | null;
}> {
  const rows = await db
    .select()
    .from(notificationOutbox)
    .where(eq(notificationOutbox.contactMessageId, contactMessageId));

  const emailRow = rows.find((r) => r.channel === "email");
  const anySent = rows.some((r) => r.status === "sent");
  const anyFailed = rows.some((r) => r.status === "failed");

  let summaryStatus: "sent" | "failed" | "not_configured" = "not_configured";
  let summaryError: string | null = null;

  if (emailRow?.status === "sent" || anySent) {
    summaryStatus = "sent";
    summaryError = null;
  } else if (emailRow?.status === "failed" || anyFailed) {
    summaryStatus = "failed";
    summaryError =
      emailRow?.lastErrorMessage ||
      rows.find((r) => r.status === "failed")?.lastErrorMessage ||
      "Notification delivery failed.";
  } else {
    summaryStatus = "not_configured";
    summaryError = null;
  }

  await db
    .update(contactMessages)
    .set({
      notificationStatus: summaryStatus,
      notificationError: summaryError,
    })
    .where(eq(contactMessages.id, contactMessageId));

  return {
    notificationStatus: summaryStatus,
    notificationError: summaryError,
  };
}

export async function processContactMessageOutbox(
  db: ContactDb,
  contactMessageId: string,
): Promise<{
  notificationStatus: "sent" | "failed" | "not_configured";
  notificationError: string | null;
}> {
  const items = await enqueueContactNotifications(db, contactMessageId);
  const actionable = items.filter((item) => item.status === "pending");

  if (actionable.length > 0) {
    await Promise.allSettled(
      actionable.map((item) => dispatchOutboxItem(db, item.id)),
    );
  }

  return syncContactMessageNotificationSummary(db, contactMessageId);
}

export async function processRetryableOutboxItems(
  db: ContactDb,
  limit = 15,
) {
  const now = new Date();
  const staleCutoff = new Date(now.getTime() - STALE_PROCESSING_MS);

  const dueItems = await db
    .select()
    .from(notificationOutbox)
    .where(
      or(
        and(
          inArray(notificationOutbox.status, ["pending", "failed"]),
          or(
            isNull(notificationOutbox.nextRetryAt),
            lte(notificationOutbox.nextRetryAt, now),
          ),
        ),
        and(
          eq(notificationOutbox.status, "processing"),
          lte(notificationOutbox.lastAttemptAt, staleCutoff),
        ),
      ),
    )
    .orderBy(desc(notificationOutbox.createdAt))
    .limit(limit);

  const eligible = dueItems.filter((item) => item.attempts < item.maxAttempts);
  const results = [];
  for (const item of eligible) {
    const updated = await dispatchOutboxItem(db, item.id);
    if (updated) {
      results.push(updated);
    }
  }
  return results;
}

export async function retryOutboxItemById(db: ContactDb, outboxId: string) {
  const [existing] = await db
    .select()
    .from(notificationOutbox)
    .where(eq(notificationOutbox.id, outboxId))
    .limit(1);

  if (!existing) {
    return null;
  }

  if (existing.status === "sent") {
    return existing;
  }

  // If manual retry is requested and attempts reached maxAttempts, bump maxAttempts by 1
  if (existing.attempts >= existing.maxAttempts) {
    await db
      .update(notificationOutbox)
      .set({
        maxAttempts: existing.attempts + 1,
        status: "pending",
        nextRetryAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notificationOutbox.id, outboxId));
  }

  return dispatchOutboxItem(db, outboxId, { forceManualRetry: true });
}

export async function sendTestChannelNotification(
  db: ContactDb,
  channel: NotificationChannel,
) {
  const now = new Date();
  const dedupeKey = `test:${channel}:${now.getTime()}`;

  const [created] = await db
    .insert(notificationOutbox)
    .values({
      contactMessageId: null,
      channel,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
      nextRetryAt: now,
      dedupeKey,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const updated = await dispatchOutboxItem(db, created.id, {
    forceManualRetry: true,
  });
  return updated ?? created;
}

export async function getNotificationsOverview(db: ContactDb) {
  const settings = await getNotificationSettings(db);
  const readiness = await getAllChannelReadiness(db);
  const vapid = getVapidConfig();

  const subscriptions = await db
    .select({
      id: pushSubscriptions.id,
      ownerUserId: pushSubscriptions.ownerUserId,
      endpoint: pushSubscriptions.endpoint,
      userAgent: pushSubscriptions.userAgent,
      deviceLabel: pushSubscriptions.deviceLabel,
      createdAt: pushSubscriptions.createdAt,
      lastUsedAt: pushSubscriptions.lastUsedAt,
      revokedAt: pushSubscriptions.revokedAt,
    })
    .from(pushSubscriptions)
    .orderBy(desc(pushSubscriptions.createdAt))
    .limit(50);

  const historyRows = await db
    .select({
      id: notificationOutbox.id,
      contactMessageId: notificationOutbox.contactMessageId,
      channel: notificationOutbox.channel,
      status: notificationOutbox.status,
      attempts: notificationOutbox.attempts,
      maxAttempts: notificationOutbox.maxAttempts,
      nextRetryAt: notificationOutbox.nextRetryAt,
      lastAttemptAt: notificationOutbox.lastAttemptAt,
      sentAt: notificationOutbox.sentAt,
      providerMessageId: notificationOutbox.providerMessageId,
      providerStatus: notificationOutbox.providerStatus,
      lastErrorCode: notificationOutbox.lastErrorCode,
      lastErrorMessage: notificationOutbox.lastErrorMessage,
      dedupeKey: notificationOutbox.dedupeKey,
      createdAt: notificationOutbox.createdAt,
      updatedAt: notificationOutbox.updatedAt,
    })
    .from(notificationOutbox)
    .orderBy(desc(notificationOutbox.createdAt))
    .limit(60);

  return {
    settings,
    readiness,
    vapidPublicKey:
      vapid?.publicKey ||
      process.env.VAPID_PUBLIC_KEY?.trim() ||
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ||
      null,
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      ownerUserId: s.ownerUserId,
      endpointPreview: `${s.endpoint.slice(0, 42)}...`,
      endpoint: s.endpoint,
      userAgent: s.userAgent,
      deviceLabel: s.deviceLabel || "Chrome Device",
      createdAt: s.createdAt.toISOString(),
      lastUsedAt: s.lastUsedAt ? s.lastUsedAt.toISOString() : null,
      revokedAt: s.revokedAt ? s.revokedAt.toISOString() : null,
      active: !s.revokedAt,
    })),
    history: historyRows.map((h) => ({
      id: h.id,
      contactMessageId: h.contactMessageId,
      channel: h.channel as NotificationChannel,
      status: h.status as NotificationOutboxStatus,
      uiStatus: resolveUiDeliveryStatus(h),
      attempts: h.attempts,
      maxAttempts: h.maxAttempts,
      nextRetryAt: h.nextRetryAt ? h.nextRetryAt.toISOString() : null,
      lastAttemptAt: h.lastAttemptAt ? h.lastAttemptAt.toISOString() : null,
      sentAt: h.sentAt ? h.sentAt.toISOString() : null,
      providerMessageId: h.providerMessageId,
      providerStatus: h.providerStatus,
      lastErrorCode: h.lastErrorCode,
      lastErrorMessage: h.lastErrorMessage,
      dedupeKey: h.dedupeKey,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
    })),
  };
}
