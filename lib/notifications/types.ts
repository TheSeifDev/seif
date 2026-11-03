import type {
  NotificationChannel,
  NotificationOutboxStatus,
} from "@/lib/db/schema";

export type { NotificationChannel, NotificationOutboxStatus };

export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = [
  "email",
  "web_push",
  "whatsapp",
] as const;

export type NotificationUiStatus =
  | NotificationOutboxStatus
  | "not_configured";

export type ChannelDispatchResult =
  | {
      status: "sent";
      providerMessageId?: string | null;
      providerStatus?: string | null;
      errorMessage?: string | null;
    }
  | {
      status: "not_configured";
      providerStatus?: string | null;
      errorCode: string;
      errorMessage: string;
    }
  | {
      status: "skipped";
      providerStatus?: string | null;
      errorCode: string;
      errorMessage: string;
    }
  | {
      status: "failed";
      providerStatus?: string | null;
      errorCode: string;
      errorMessage: string;
      retryable: boolean;
    };

export type NotificationAlertPayload = {
  contactMessageId: string | null;
  dedupeKey: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  messageExcerpt: string;
  fullMessage: string;
  receivedAtIso: string;
  inboxUrl: string;
  inboxPath: string;
  isTest?: boolean;
};

export type ChannelReadiness = {
  channel: NotificationChannel;
  configured: boolean;
  enabled: boolean;
  missingEnvVars: string[];
  lastSentAt: string | null;
  details: string;
};
