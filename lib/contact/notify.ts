type NotificationResult =
  | { status: "sent" }
  | { status: "not_configured" }
  | { status: "failed"; error: string };

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

export async function notifyContact(input: {
  name: string;
  email: string;
  message: string;
}): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();

  if (!apiKey || !from || !to) return { status: "not_configured" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `Portfolio contact from ${input.name}`,
        text: `Name: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (response.ok) return { status: "sent" };

    let errorName = "unknown_error";
    try {
      const body: unknown = await response.json();
      if (isRecord(body) && isRecord(body.error) && typeof body.error.name === "string") {
        errorName = body.error.name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
      } else if (isRecord(body) && typeof body.name === "string") {
        errorName = body.name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
      }
    } catch {
      // The HTTP status is sufficient when the provider does not return JSON.
    }

    return { status: "failed", error: `HTTP ${response.status}: ${errorName}` };
  } catch {
    return { status: "failed", error: "Notification request failed." };
  }
}
