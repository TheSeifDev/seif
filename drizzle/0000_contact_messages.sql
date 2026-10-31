CREATE TABLE IF NOT EXISTS "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"notification_status" text DEFAULT 'pending' NOT NULL,
	"notification_error" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_messages_ip_hash_created_at_idx" ON "contact_messages" USING btree ("ip_hash","created_at");
