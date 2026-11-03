import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export { user, session, account, verification } from "@/lib/auth/schema";
export { cmsState, cmsRevisions, cmsMedia } from "@/lib/cms/tables";

export const NOTIFICATION_CHANNELS = ["email", "whatsapp", "web_push"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_OUTBOX_STATUSES = [
  "pending",
  "processing",
  "sent",
  "failed",
  "skipped",
] as const;
export type NotificationOutboxStatus =
  (typeof NOTIFICATION_OUTBOX_STATUSES)[number];

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    status: text("status")
      .$type<"new" | "read" | "archived">()
      .notNull()
      .default("new"),
    notificationStatus: text("notification_status")
      .$type<"pending" | "sent" | "failed" | "not_configured">()
      .notNull()
      .default("pending"),
    notificationError: text("notification_error"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    readAt: timestamp("read_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("contact_messages_ip_hash_created_at_idx").on(
      table.ipHash,
      table.createdAt,
    ),
  ],
);

export const notificationOutbox = pgTable(
  "notification_outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactMessageId: uuid("contact_message_id").references(
      () => contactMessages.id,
      { onDelete: "cascade" },
    ),
    channel: text("channel").$type<NotificationChannel>().notNull(),
    status: text("status")
      .$type<NotificationOutboxStatus>()
      .notNull()
      .default("pending"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextRetryAt: timestamp("next_retry_at", {
      withTimezone: true,
      mode: "date",
    }),
    lastAttemptAt: timestamp("last_attempt_at", {
      withTimezone: true,
      mode: "date",
    }),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" }),
    providerMessageId: text("provider_message_id"),
    providerStatus: text("provider_status"),
    lastErrorCode: text("last_error_code"),
    lastErrorMessage: text("last_error_message"),
    dedupeKey: text("dedupe_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("notification_outbox_dedupe_key_unique").on(table.dedupeKey),
    index("notification_outbox_contact_message_id_idx").on(
      table.contactMessageId,
    ),
    index("notification_outbox_status_next_retry_idx").on(
      table.status,
      table.nextRetryAt,
    ),
    index("notification_outbox_channel_status_idx").on(
      table.channel,
      table.status,
    ),
  ],
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: text("owner_user_id").notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    deviceLabel: text("device_label").notNull().default("Chrome Device"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "date" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("push_subscriptions_endpoint_unique").on(table.endpoint),
    index("push_subscriptions_owner_user_id_idx").on(table.ownerUserId),
  ],
);

export const notificationSettings = pgTable("notification_settings", {
  id: text("id").primaryKey(),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  whatsappEnabled: boolean("whatsapp_enabled").notNull().default(true),
  webPushEnabled: boolean("web_push_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedBy: text("updated_by"),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
export type NotificationOutboxItem = typeof notificationOutbox.$inferSelect;
export type NewNotificationOutboxItem = typeof notificationOutbox.$inferInsert;
export type PushSubscriptionItem = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscriptionItem = typeof pushSubscriptions.$inferInsert;
export type NotificationSettingsRow = typeof notificationSettings.$inferSelect;
