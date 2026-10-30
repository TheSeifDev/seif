import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export { user, session, account, verification } from "@/lib/auth/schema";
export { cmsState, cmsRevisions, cmsMedia } from "@/lib/cms/tables";

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
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

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
