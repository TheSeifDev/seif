import type {
  NotificationChannel,
  NotificationOutboxStatus,
} from "@/lib/db/schema";

export type { NotificationChannel, NotificationOutboxStatus };

export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = [
  "email",
  "web_push",
  "whatsapp",
  "instagram",
] as const;

export type NotificationUiStatus =
  | NotificationOutboxStatus
  | "not_configured"
  | "unavailable";

export type ChannelAvailabilityState =
  | "implemented"
  | "configured"
  | "test_delivery_successful"
  | "not_configured"
  | "unavailable";

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
      status: "unavailable";
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
  implemented: boolean;
  configured: boolean;
  enabled: boolean;
  available: boolean;
  availabilityState: ChannelAvailabilityState;
  restrictionReason: string | null;
  missingEnvVars: string[];
  lastSentAt: string | null;
  lastTestSentAt: string | null;
  testDeliveryVerified: boolean;
  details: string;
};
