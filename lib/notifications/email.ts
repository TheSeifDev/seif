import type {
  ChannelDispatchResult,
  ChannelReadiness,
  NotificationAlertPayload,
} from "./types";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

export function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeExcerpt(input: string, maxLength = 500): string {
  const cleaned = String(input)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getEmailConfigReadiness(
  enabled = true,
  lastSentAt: string | null = null,
  lastTestSentAt: string | null = null,
): ChannelReadiness {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY?.trim()) missing.push("RESEND_API_KEY");
  if (!process.env.CONTACT_FROM_EMAIL?.trim()) {
    missing.push("CONTACT_FROM_EMAIL");
  }
  const recipient =
    process.env.CONTACT_TO_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim();
  if (!recipient) {
    missing.push("CONTACT_TO_EMAIL");
  }
  const configured = missing.length === 0;
  const testDeliveryVerified = Boolean(lastTestSentAt || lastSentAt);
  return {
    channel: "email",
    implemented: true,
    configured,
    enabled,
    available: true,
    availabilityState: !configured
      ? "not_configured"
      : testDeliveryVerified
        ? "test_delivery_successful"
        : "configured",
    restrictionReason: null,
    missingEnvVars: missing,
    lastSentAt,
    lastTestSentAt,
    testDeliveryVerified,
    details: configured
      ? testDeliveryVerified
        ? "Resend email delivery is configured and verified with a successful delivery."
        : "Resend credentials configured — real Gmail delivery not yet verified in this environment."
      : `Not Configured — missing environment variables: ${missing.join(", ")}`,
  };
}

export function buildContactEmailHtml(payload: NotificationAlertPayload): string {
  const safeName = escapeHtml(payload.senderName);
  const safeEmail = escapeHtml(payload.senderEmail);
  const safeSubject = escapeHtml(payload.subject || "Portfolio contact inquiry");
  const safeTimestamp = escapeHtml(payload.receivedAtIso);
  const safeExcerpt = escapeHtml(
    sanitizeExcerpt(payload.messageExcerpt || payload.fullMessage, 500),
  );
  const safeInboxUrl = escapeHtml(payload.inboxUrl);
  const heading = payload.isTest
    ? "Portfolio Notification Test (Email Channel)"
    : "New Portfolio Contact Submission";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:24px;background-color:#05070a;color:#f5f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background-color:#0b0f17;border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:28px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#49baf1;margin-bottom:8px;">
      SEIF AYMAN · PORTFOLIO CONTROL CENTER
    </div>
    <h1 style="margin:0 0 20px 0;font-size:20px;line-height:1.35;color:#ffffff;">
      ${escapeHtml(heading)}
    </h1>
    <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
      <tr>
        <td style="padding:8px 0;color:#94a3b8;width:110px;">Sender</td>
        <td style="padding:8px 0;color:#f5f5f2;font-weight:600;">${safeName}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#94a3b8;">Email</td>
        <td style="padding:8px 0;color:#49baf1;">${safeEmail}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#94a3b8;">Subject</td>
        <td style="padding:8px 0;color:#f5f5f2;">${safeSubject}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#94a3b8;">Received</td>
        <td style="padding:8px 0;color:#f5f5f2;font-family:monospace;font-size:12px;">${safeTimestamp}</td>
      </tr>
    </table>
    <div style="margin-bottom:24px;padding:16px;background-color:#05070a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#94a3b8;margin-bottom:8px;">
        Safe Message Excerpt
      </div>
      <div style="font-size:14px;line-height:1.6;color:#f5f5f2;white-space:pre-wrap;">${safeExcerpt}</div>
    </div>
    <div>
      <a href="${safeInboxUrl}" style="display:inline-block;padding:12px 22px;background-color:#49baf1;color:#05070a;font-weight:700;font-size:13px;text-decoration:none;border-radius:9999px;">
        Open Message in Dashboard Inbox →
      </a>
    </div>
  </div>
</body>
</html>`;
}

export function buildContactEmailText(payload: NotificationAlertPayload): string {
  const excerpt = sanitizeExcerpt(
    payload.messageExcerpt || payload.fullMessage,
    500,
  );
  return [
    payload.isTest
      ? "Portfolio Notification Test (Email Channel)"
      : "New Portfolio Contact Submission",
    "----------------------------------------",
    `Sender: ${payload.senderName}`,
    `Email: ${payload.senderEmail}`,
    `Subject: ${payload.subject || "Portfolio contact inquiry"}`,
    `Received: ${payload.receivedAtIso}`,
    "",
    "Message Excerpt:",
    excerpt,
    "",
    `Open in Dashboard Inbox: ${payload.inboxUrl}`,
  ].join("\n");
}

export async function sendEmailNotification(
  payload: NotificationAlertPayload,
): Promise<ChannelDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const to =
    process.env.CONTACT_TO_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim();

  if (!apiKey || !from || !to) {
    return {
      status: "not_configured",
      errorCode: "NOT_CONFIGURED",
      errorMessage: "Resend email notification credentials are not configured.",
    };
  }

  const subjectLine = payload.isTest
    ? `[Test] Portfolio Notification — ${payload.subject || "Email"}`
    : payload.subject
      ? `Portfolio contact: ${payload.subject} (${payload.senderName})`
      : `Portfolio contact from ${payload.senderName}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": payload.dedupeKey.slice(0, 255),
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: payload.senderEmail,
        subject: subjectLine.slice(0, 200),
        html: buildContactEmailHtml(payload),
        text: buildContactEmailText(payload),
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (response.ok) {
      let providerId: string | null = null;
      try {
        const body: unknown = await response.json();
        if (isRecord(body) && typeof body.id === "string") {
          providerId = body.id;
        }
      } catch {
        // Provider ID is optional if JSON parsing fails on a 200 OK
      }
      return {
        status: "sent",
        providerMessageId: providerId,
        providerStatus: "accepted",
      };
    }

    let errorName = "unknown_error";
    try {
      const body: unknown = await response.json();
      if (
        isRecord(body) &&
        isRecord(body.error) &&
        typeof body.error.name === "string"
      ) {
        errorName = body.error.name
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 80);
      } else if (isRecord(body) && typeof body.name === "string") {
        errorName = body.name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
      }
    } catch {
      // HTTP status is sufficient when provider does not return JSON
    }

    const retryable = response.status === 429 || response.status >= 500;
    return {
      status: "failed",
      errorCode: `HTTP_${response.status}_${errorName}`.slice(0, 80),
      errorMessage: `HTTP ${response.status}: ${errorName}`,
      retryable,
    };
  } catch {
    return {
      status: "failed",
      errorCode: "NETWORK_OR_TIMEOUT_ERROR",
      errorMessage: "Notification request failed.",
      retryable: true,
    };
  }
}
