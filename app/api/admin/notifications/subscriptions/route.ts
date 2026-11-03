import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";
import { adminError, adminRequest, ok, readJson } from "@/lib/cms/http";
import { CmsError } from "@/lib/cms/repository";
import { validatePushEndpoint } from "@/lib/notifications/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function db() {
  const result = getDb();
  if (!result) {
    throw new CmsError(
      "DATABASE_NOT_CONFIGURED",
      503,
      "Push subscription storage is not configured.",
    );
  }
  return result;
}

const registerSubscriptionSchema = z
  .object({
    endpoint: z.string().url().max(2048),
    keys: z.object({
      p256dh: z.string().min(16).max(512),
      auth: z.string().min(8).max(256),
    }),
    deviceLabel: z.string().trim().max(120).optional(),
  })
  .strict();

const revokeSubscriptionSchema = z
  .object({
    id: z.string().uuid().optional(),
    endpoint: z.string().url().max(2048).optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    await adminRequest(request);
    const rows = await db()
      .select({
        id: pushSubscriptions.id,
        ownerUserId: pushSubscriptions.ownerUserId,
        endpoint: pushSubscriptions.endpoint,
        userAgent: pushSubscriptions.userAgent,
        deviceLabel: pushSubscriptions.deviceLabel,
        createdAt: pushSubscriptions.createdAt,
        lastUsedAt: pushSubscriptions.lastUsedAt,
        revokedAt: pushSubscriptions.revokedAt,
      })
      .from(pushSubscriptions)
      .orderBy(desc(pushSubscriptions.createdAt))
      .limit(50);

    return ok({
      items: rows.map((s) => ({
        id: s.id,
        ownerUserId: s.ownerUserId,
        endpointPreview: `${s.endpoint.slice(0, 42)}...`,
        endpoint: s.endpoint,
        userAgent: s.userAgent,
        deviceLabel: s.deviceLabel || "Chrome Device",
        createdAt: s.createdAt.toISOString(),
        lastUsedAt: s.lastUsedAt ? s.lastUsedAt.toISOString() : null,
        revokedAt: s.revokedAt ? s.revokedAt.toISOString() : null,
        active: !s.revokedAt,
      })),
    });
  } catch (error) {
    return adminError(error);
  }
}

export async function POST(request: Request) {
  try {
    const principal = await adminRequest(request, true);
    const body = registerSubscriptionSchema.parse(await readJson(request));

    const check = validatePushEndpoint(body.endpoint);
    if (!check.valid) {
      throw new CmsError(
        "INVALID_PUSH_ENDPOINT",
        400,
        check.reason || "Invalid push endpoint.",
      );
    }

    const userAgent = request.headers.get("user-agent")?.slice(0, 300) || null;
    const inferredLabel =
      body.deviceLabel?.trim() ||
      (userAgent?.includes("Android")
        ? "Android + Chrome"
        : userAgent?.includes("Windows")
          ? "Windows + Chrome"
          : "Chrome Browser");

    const now = new Date();
    const [saved] = await db()
      .insert(pushSubscriptions)
      .values({
        ownerUserId: principal.session.user.id,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        userAgent,
        deviceLabel: inferredLabel,
        createdAt: now,
        lastUsedAt: now,
        revokedAt: null,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          ownerUserId: principal.session.user.id,
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
          userAgent,
          deviceLabel: inferredLabel,
          lastUsedAt: now,
          revokedAt: null,
        },
      })
      .returning();

    return ok({
      subscription: {
        id: saved.id,
        deviceLabel: saved.deviceLabel,
        endpointPreview: `${saved.endpoint.slice(0, 42)}...`,
        createdAt: saved.createdAt.toISOString(),
        active: !saved.revokedAt,
      },
    });
  } catch (error) {
    return adminError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await adminRequest(request, true);
    const body = revokeSubscriptionSchema.parse(await readJson(request));
    if (!body.id && !body.endpoint) {
      throw new CmsError(
        "MISSING_IDENTIFIER",
        400,
        "Provide subscription id or endpoint to revoke.",
      );
    }

    const database = db();
    const now = new Date();
    const condition = body.id
      ? eq(pushSubscriptions.id, body.id)
      : eq(pushSubscriptions.endpoint, body.endpoint!);

    const updated = await database
      .update(pushSubscriptions)
      .set({ revokedAt: now })
      .where(condition)
      .returning({ id: pushSubscriptions.id });

    if (!updated.length) {
      throw new CmsError("NOT_FOUND", 404, "Subscription not found.");
    }

    return ok({ id: updated[0].id, revokedAt: now.toISOString() });
  } catch (error) {
    return adminError(error);
  }
}
