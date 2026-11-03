import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { notificationOutbox } from "@/lib/db/schema";
import {
  verifyWhatsAppWebhookChallenge,
  verifyWhatsAppWebhookSignature,
} from "@/lib/notifications/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const verifyToken = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verification = verifyWhatsAppWebhookChallenge({
    mode,
    verifyToken,
    challenge,
  });

  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status }
    );
  }

  return new NextResponse(verification.challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        statuses?: Array<{
          id?: string;
          status?: string;
          errors?: Array<{ code?: number; title?: string }>;
        }>;
      };
    }>;
  }>;
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-hub-signature-256");
  const rawBody = await request.text();

  if (!verifyWhatsAppWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "Invalid or missing webhook signature." },
      { status: 401 }
    );
  }

  let parsed: WhatsAppWebhookPayload;
  try {
    parsed = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ received: true, updated: 0 }, { status: 200 });
  }

  let updatedCount = 0;
  const entries = parsed.entry ?? [];

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      for (const statusEvent of change.value?.statuses ?? []) {
        const providerId = statusEvent.id;
        const providerStatus = statusEvent.status;
        if (!providerId || !providerStatus) continue;

        const isFailure = providerStatus === "failed";
        const firstErr = statusEvent.errors?.[0];

        const rows = await db
          .update(notificationOutbox)
          .set({
            providerStatus: providerStatus.slice(0, 80),
            ...(isFailure
              ? {
                  status: "failed",
                  lastErrorCode: firstErr?.code
                    ? `WA_${firstErr.code}`
                    : "WA_WEBHOOK_FAILED",
                  lastErrorMessage:
                    firstErr?.title?.slice(0, 200) ||
                    "WhatsApp delivery failed per webhook.",
                }
              : {}),
            updatedAt: new Date(),
          })
          .where(eq(notificationOutbox.providerMessageId, providerId))
          .returning({ id: notificationOutbox.id });

        updatedCount += rows.length;
      }
    }
  }

  return NextResponse.json({ received: true, updated: updatedCount }, { status: 200 });
}

