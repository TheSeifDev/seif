import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { processRetryableOutboxItems } from "@/lib/notifications/outbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorizedCronRequest(request: Request): {
  authorized: boolean;
  configured: boolean;
} {
  const expectedSecret = process.env.CRON_SECRET?.trim();
  if (!expectedSecret) {
    return { authorized: false, configured: false };
  }

  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { authorized: false, configured: true };
  }

  const providedSecret = authHeader.slice("Bearer ".length).trim();
  const expectedBuf = Buffer.from(expectedSecret, "utf8");
  const providedBuf = Buffer.from(providedSecret, "utf8");

  if (expectedBuf.length !== providedBuf.length) {
    return { authorized: false, configured: true };
  }

  const match = crypto.timingSafeEqual(expectedBuf, providedBuf);
  return { authorized: match, configured: true };
}

export async function GET(request: Request) {
  const auth = isAuthorizedCronRequest(request);
  if (!auth.configured) {
    return NextResponse.json(
      {
        ok: false,
        error: "CRON_NOT_CONFIGURED",
        message: "CRON_SECRET environment variable is not configured.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!auth.authorized) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHORIZED",
        message: "Invalid or missing Bearer CRON_SECRET.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_NOT_CONFIGURED",
        message: "Database is not configured.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const processed = await processRetryableOutboxItems(db, 20);
  return NextResponse.json(
    {
      ok: true,
      processedCount: processed.length,
      timestamp: new Date().toISOString(),
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

