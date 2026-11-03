import { sanitizeExcerpt, sendEmailNotification } from "@/lib/notifications/email";
import { getSiteBaseUrl } from "@/lib/notifications/outbox";

type NotificationResult =
  | { status: "sent"; providerMessageId?: string }
  | { status: "not_configured" }
  | { status: "failed"; error: string };

export async function notifyContact(input: {
  id?: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}): Promise<NotificationResult> {
  const baseUrl = getSiteBaseUrl();
  const inboxPath = input.id
    ? `/dashboard/inbox?messageId=${encodeURIComponent(input.id)}`
    : "/dashboard/inbox";

  const result = await sendEmailNotification({
    contactMessageId: input.id ?? null,
    dedupeKey: input.id
      ? `contact:${input.id}:email`
      : `direct-email:${Date.now()}`,
    senderName: input.name,
    senderEmail: input.email,
    subject: input.subject || "Portfolio contact inquiry",
    messageExcerpt: sanitizeExcerpt(input.message, 500),
    fullMessage: input.message,
    receivedAtIso: new Date().toISOString(),
    inboxUrl: `${baseUrl}${inboxPath}`,
    inboxPath,
  });

  if (result.status === "sent") {
    return {
      status: "sent",
      providerMessageId: result.providerMessageId ?? undefined,
    };
  }
  if (result.status === "not_configured" || result.status === "skipped") {
    return { status: "not_configured" };
  }
  return {
    status: "failed",
    error: result.errorMessage || "Notification request failed.",
  };
}
