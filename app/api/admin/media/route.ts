import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";
import { z } from "zod";
import {
  adminError,
  adminRequest,
  ok,
  readJson,
  readMultipart,
} from "@/lib/cms/http";
import {
  CmsError,
  createMedia,
  beginMediaDeletion,
  listMedia,
  removeMediaRecord,
} from "@/lib/cms/repository";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 4 * 1024 * 1024;

function storage() {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
    throw new CmsError(
      "STORAGE_NOT_CONFIGURED",
      503,
      "Connect a private Vercel Blob store before uploading files.",
    );
  return process.env.BLOB_READ_WRITE_TOKEN
    ? { token: process.env.BLOB_READ_WRITE_TOKEN }
    : {};
}
function detect(
  bytes: Buffer,
): { type: string; extension: string } | undefined {
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return { type: "image/png", extension: "png" };
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return { type: "image/jpeg", extension: "jpg" };
  if (
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP"
  )
    return { type: "image/webp", extension: "webp" };
  if (bytes.subarray(0, 5).toString() === "%PDF-")
    return { type: "application/pdf", extension: "pdf" };
}
export async function GET(request: Request) {
  try {
    await adminRequest(request);
    return ok({ items: await listMedia() });
  } catch (error) {
    return adminError(error);
  }
}
export async function POST(request: Request) {
  let uploadedUrl: string | undefined;
  try {
    const owner = await adminRequest(request, true);
    const options = storage();
    if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES + 65536)
      throw new CmsError(
        "FILE_TOO_LARGE",
        413,
        "Upload a file smaller than 4 MB.",
      );
    const form = await readMultipart(request, MAX_BYTES + 65536);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > MAX_BYTES)
      throw new CmsError(
        "INVALID_FILE",
        400,
        "Choose a PNG, JPEG, WebP or PDF smaller than 4 MB.",
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const format = detect(bytes);
    if (!format)
      throw new CmsError(
        "UNSUPPORTED_FILE",
        415,
        "Only PNG, JPEG, WebP and PDF files are supported. SVG and executable content are not accepted.",
      );
    const id = randomUUID();
    const uploaded = await put(`cms/${id}.${format.extension}`, bytes, {
      access: "private",
      contentType: format.type,
      addRandomSuffix: false,
      ...options,
    });
    uploadedUrl = uploaded.url;
    const item = await createMedia({
      id,
      storageUrl: uploaded.url,
      name: file.name.replace(/[\r\n\x00]/g, "").slice(0, 200),
      contentType: format.type,
      size: bytes.length,
      actorId: owner.session.user.id,
    });
    return ok({ item });
  } catch (error) {
    if (uploadedUrl) {
      try {
        await del(uploadedUrl, storage());
      } catch {
        console.error("An unlinked private upload needs cleanup.");
      }
    }
    return adminError(error);
  }
}
export async function DELETE(request: Request) {
  try {
    await adminRequest(request, true);
    const options = storage();
    const { id } = z
      .object({ id: z.string().uuid() })
      .strict()
      .parse(await readJson(request));
    const item = await beginMediaDeletion(id);
    await del(item.storageUrl, options);
    await removeMediaRecord(id);
    return ok({ id });
  } catch (error) {
    return adminError(error);
  }
}
