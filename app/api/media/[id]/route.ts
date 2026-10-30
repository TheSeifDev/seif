import { get } from "@vercel/blob";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/server";
import { getMedia, mediaVisibility } from "@/lib/cms/repository";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success)
    return new Response("Not found", { status: 404 });
  try {
    if ((await mediaVisibility(id)) !== "published")
      await requireAdmin(request);
    const media = await getMedia(id);
    if (!media || media.deletedAt)
      return new Response("Not found", { status: 404 });
    const result = await get(media.storageUrl, {
      access: "private",
      ...(process.env.BLOB_READ_WRITE_TOKEN
        ? { token: process.env.BLOB_READ_WRITE_TOKEN }
        : {}),
    });
    if (!result || result.statusCode !== 200)
      return new Response("Not found", { status: 404 });
    return new Response(result.stream, {
      headers: {
        "Content-Type": media.contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
        "Content-Disposition": `inline; filename="${media.name.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
        ...(media.contentType === "application/pdf"
          ? { "Content-Security-Policy": "sandbox" }
          : {}),
      },
    });
  } catch {
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
