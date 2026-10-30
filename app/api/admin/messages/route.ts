import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { contactMessages } from "@/lib/db/schema";
import { adminError, adminRequest, ok, readJson } from "@/lib/cms/http";
import { CmsError } from "@/lib/cms/repository";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function db() {
  const result = getDb();
  if (!result)
    throw new CmsError(
      "DATABASE_NOT_CONFIGURED",
      503,
      "Inbox storage is not configured.",
    );
  return result;
}
export async function GET(request: Request) {
  try {
    await adminRequest(request);
    const items = await db()
      .select({
        id: contactMessages.id,
        name: contactMessages.name,
        email: contactMessages.email,
        message: contactMessages.message,
        status: contactMessages.status,
        createdAt: contactMessages.createdAt,
        readAt: contactMessages.readAt,
        notificationStatus: contactMessages.notificationStatus,
      })
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(200);
    return ok({ items });
  } catch (error) {
    return adminError(error);
  }
}
export async function PATCH(request: Request) {
  try {
    await adminRequest(request, true);
    const { id, status } = z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "read", "archived"]),
      })
      .strict()
      .parse(await readJson(request));
    const rows = await db()
      .update(contactMessages)
      .set({ status, readAt: status === "new" ? null : new Date() })
      .where(eq(contactMessages.id, id))
      .returning({ id: contactMessages.id });
    if (!rows.length)
      throw new CmsError("NOT_FOUND", 404, "Message not found.");
    return ok({ id, status });
  } catch (error) {
    return adminError(error);
  }
}
export async function DELETE(request: Request) {
  try {
    await adminRequest(request, true);
    const { id } = z
      .object({ id: z.string().uuid() })
      .strict()
      .parse(await readJson(request));
    const rows = await db()
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning({ id: contactMessages.id });
    if (!rows.length)
      throw new CmsError("NOT_FOUND", 404, "Message not found.");
    return ok({ id });
  } catch (error) {
    return adminError(error);
  }
}
