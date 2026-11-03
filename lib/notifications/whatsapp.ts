import crypto from "node:crypto";
import type {
  ChannelDispatchResult,
  ChannelReadiness,
  NotificationAlertPayload,
} from "./types";
import { sanitizeExcerpt } from "./email";

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  recipientPhone: string;
  templateName?: string;
  templateLanguage: string;
  webhookVerifyToken?: string;
  appSecret?: string;
}

export interface WhatsAppNotificationAdapter {
  isConfigured(): boolean;
  getReadiness(enabled?: boolean, lastSentAt?: string | null): ChannelReadiness;
  send(payload: NotificationAlertPayload): Promise<ChannelDispatchResult>;
}

const REQUIRED_WHATSAPP_ENV_VARS = [
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_BUSINESS_ACCOUNT_ID",
  "WHATSAPP_NOTIFICATION_RECIPIENT",
] as const;

export function getWhatsAppConfig(): WhatsAppConfig | null {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() || "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || "";
  const businessAccountId =
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim() || "";
  const recipientPhone =
    process.env.WHATSAPP_NOTIFICATION_RECIPIENT?.trim() || "";

  if (!accessToken || !phoneNumberId || !businessAccountId || !recipientPhone) {
    return null;
  }

  return {
    accessToken,
    phoneNumberId,
    businessAccountId,
    recipientPhone,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME?.trim() || undefined,
    templateLanguage:
      process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "en_US",
    webhookVerifyToken:
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() || undefined,
    appSecret: process.env.WHATSAPP_APP_SECRET?.trim() || undefined,
  };
}

export function getWhatsAppConfigReadiness(
  enabled = false,
  lastSentAt: string | null = null,
): ChannelReadiness {
  const missing: string[] = [];
  for (const key of REQUIRED_WHATSAPP_ENV_VARS) {
    if (!process.env[key]?.trim()) {
      missing.push(key);
    }
  }

  return {
    channel: "whatsapp",
    configured: missing.length === 0,
    enabled,
    missingEnvVars: missing,
    lastSentAt,
    details:
      missing.length === 0
        ? "Meta WhatsApp Business Cloud API configured."
        : `Not Configured — missing environment variables: ${missing.join(", ")}`,
  };
}

function redactSecret(text: string, secret: string): string {
  if (!secret) return text;
  return text.split(secret).join("[REDACTED]");
}

export class MetaWhatsAppCloudAdapter implements WhatsAppNotificationAdapter {
  isConfigured(): boolean {
    return getWhatsAppConfig() !== null;
  }

  getReadiness(
    enabled = false,
    lastSentAt: string | null = null,
  ): ChannelReadiness {
    return getWhatsAppConfigReadiness(enabled, lastSentAt);
  }

  async send(payload: NotificationAlertPayload): Promise<ChannelDispatchResult> {
    const config = getWhatsAppConfig();
    if (!config) {
      const readiness = this.getReadiness();
      return {
        status: "not_configured",
        errorCode: "WHATSAPP_NOT_CONFIGURED",
        errorMessage: readiness.details,
      };
    }

    const excerpt = sanitizeExcerpt(
      payload.messageExcerpt || payload.fullMessage,
      200,
    );
    const subjectLine = payload.subject?.trim()
      ? `Subject: ${payload.subject.trim().slice(0, 80)}\n`
      : "";
    const textSummary = payload.isTest
      ? `[Portfolio Test] WhatsApp Business Cloud notification is active.\nInbox: ${payload.inboxUrl}`
      : `New Portfolio Contact Message\nFrom: ${payload.senderName.trim().slice(0, 80)} (${payload.senderEmail.trim()})\n${subjectLine}Preview: ${excerpt}\nOpen Inbox: ${payload.inboxUrl}`;

    const requestBody = config.templateName
      ? {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: config.recipientPhone,
          type: "template",
          template: {
            name: config.templateName,
            language: { code: config.templateLanguage },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: payload.senderName.trim().slice(0, 60),
                  },
                  {
                    type: "text",
                    text: payload.senderEmail.trim().slice(0, 80),
                  },
                  { type: "text", text: excerpt.slice(0, 140) },
                  { type: "text", text: payload.inboxUrl },
                ],
              },
            ],
          },
        }
      : {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: config.recipientPhone,
          type: "text",
          text: {
            preview_url: false,
            body: textSummary,
          },
        };

    const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(
      config.phoneNumberId,
    )}/messages`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const bodyText = await response.text().catch(() => "");
      if (!response.ok) {
        const safeText = redactSecret(bodyText, config.accessToken)
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 240);
        return {
          status: "failed",
          errorCode: `WHATSAPP_HTTP_${response.status}`,
          errorMessage: `WhatsApp Cloud API responded with ${response.status}${safeText ? `: ${safeText}` : ""}`,
          retryable: response.status === 429 || response.status >= 500,
        };
      }

      let providerMessageId: string | undefined;
      try {
        const parsed = JSON.parse(bodyText) as {
          messages?: Array<{ id?: string; message_status?: string }>;
        };
        providerMessageId = parsed.messages?.[0]?.id;
      } catch {
        // Ignore JSON parse fallback
      }

      return {
        status: "sent",
        providerMessageId: providerMessageId || `wa:${Date.now()}`,
        providerStatus: "accepted",
      };
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "WhatsApp Cloud API request failed";
      const safeMessage = redactSecret(rawMessage, config.accessToken).slice(
        0,
        240,
      );
      return {
        status: "failed",
        errorCode: "WHATSAPP_NETWORK_ERROR",
        errorMessage: safeMessage,
        retryable: true,
      };
    }
  }
}

export const whatsappAdapter = new MetaWhatsAppCloudAdapter();

export function verifyWhatsAppWebhookChallenge(params: {
  mode: string | null;
  verifyToken: string | null;
  challenge: string | null;
}):
  | { ok: true; challenge: string }
  | { ok: false; status: number; error: string } {
  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();
  if (!expectedToken) {
    return {
      ok: false,
      status: 503,
      error: "WHATSAPP_WEBHOOK_VERIFY_TOKEN is not configured.",
    };
  }

  if (params.mode !== "subscribe" || !params.verifyToken || !params.challenge) {
    return {
      ok: false,
      status: 400,
      error: "Missing hub.mode, hub.verify_token, or hub.challenge.",
    };
  }

  const providedBuf = Buffer.from(params.verifyToken, "utf8");
  const expectedBuf = Buffer.from(expectedToken, "utf8");
  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return {
      ok: false,
      status: 403,
      error: "Invalid webhook verification token.",
    };
  }

  return { ok: true, challenge: params.challenge };
}

export function verifyWhatsAppWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!appSecret || !signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const expectedHex = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  const providedHex = signatureHeader
    .slice("sha256=".length)
    .trim()
    .toLowerCase();

  if (expectedHex.length !== providedHex.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedHex, "utf8"),
    Buffer.from(providedHex, "utf8"),
  );
}
