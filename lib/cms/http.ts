import { requireAdmin, AuthError } from "@/lib/auth/server";
import { CmsError } from "@/lib/cms/repository";
import { getSiteOrigin } from "@/lib/seo/metadata";
import { ZodError } from "zod";

export async function adminRequest(request: Request, mutation = false) {
  const principal = await requireAdmin(request);
  if (mutation) {
    const origin = request.headers.get("origin");
    if (
      !origin ||
      origin !== getSiteOrigin() ||
      request.headers.get("sec-fetch-site") === "cross-site"
    ) {
      throw new AuthError(
        "FORBIDDEN",
        403,
        "This request origin is not allowed.",
      );
    }
  }
  return principal;
}
async function readBody(request: Request, maxBytes: number) {
  if (!request.body)
    throw new CmsError("INVALID_BODY", 400, "A request body is required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new CmsError("PAYLOAD_TOO_LARGE", 413, "The request is too large.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function readJson(
  request: Request,
  maxBytes = 1_500_000,
): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new CmsError(
      "INVALID_CONTENT_TYPE",
      415,
      "Use an application/json request.",
    );
  const body = await readBody(request, maxBytes);
  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    throw new CmsError(
      "INVALID_JSON",
      400,
      "The request body is not valid JSON.",
    );
  }
}
export async function readMultipart(request: Request, maxBytes: number) {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data"))
    throw new CmsError(
      "INVALID_CONTENT_TYPE",
      415,
      "Use a multipart file upload.",
    );
  const body = await readBody(request, maxBytes);
  try {
    return await new Response(new Uint8Array(body), {
      headers: { "Content-Type": contentType },
    }).formData();
  } catch {
    throw new CmsError("INVALID_FILE", 400, "The upload could not be read.");
  }
}
export function ok(value: object) {
  return Response.json(
    { ok: true, ...value },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
export function adminError(error: unknown) {
  if (error instanceof ZodError)
    return Response.json(
      {
        ok: false,
        error: "INVALID_CONTENT",
        issues: error.issues.map(({ path, message }) => ({ path, message })),
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  if (error instanceof AuthError || error instanceof CmsError)
    return Response.json(
      { ok: false, error: error.code, message: error.message },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  console.error("CMS operation failed; no content change was confirmed.");
  return Response.json(
    {
      ok: false,
      error: "SERVICE_UNAVAILABLE",
      message:
        "The operation could not be confirmed. Retry after checking service configuration.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
