import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { SiteContent } from "@/lib/cms/schema";

export const cmsState = pgTable("cms_state", {
  id: text("id").primaryKey(),
  draft: jsonb("draft").$type<SiteContent>().notNull(),
  published: jsonb("published").$type<SiteContent>().notNull(),
  revision: integer("revision").notNull().default(1),
  publishedRevision: integer("published_revision").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const cmsRevisions = pgTable(
  "cms_revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    revision: integer("revision").notNull(),
    kind: text("kind").$type<"draft" | "publish">().notNull(),
    content: jsonb("content").$type<SiteContent>().notNull(),
    actorId: text("actor_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("cms_revisions_created_at_idx").on(table.createdAt)],
);

export const cmsMedia = pgTable("cms_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  storageUrl: text("storage_url").notNull(),
  name: text("name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  alt: text("alt").notNull().default(""),
  actorId: text("actor_id").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});
