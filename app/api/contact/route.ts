import { submitContact, type ContactResult } from "@/lib/contact/submit";


const MAX_BODY_BYTES = 16 * 1024;

function jsonResponse(body: unknown, status: number, headers?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function statusCode(result: ContactResult): number {
  switch (result.status) {
    case "saved":
      return 201;
    case "invalid":
    case "rejected":
      return 400;
    case "rate_limited":
      return 429;
    case "not_configured":
      return 503;
    case "error":
      return 500;
  }
}

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return jsonResponse({ status: "error", message: "JSON is required." }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonResponse({ status: "error", message: "Request body is too large." }, 413);
  }

  let body: unknown;
  try {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ status: "error", message: "Request body is too large." }, 413);
    }
    body = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    return jsonResponse({ status: "invalid", fieldErrors: { _form: ["Please send valid JSON."] } }, 400);
  }

  const result = await submitContact(body, request.headers);
  const headers: HeadersInit =
    result.status === "rate_limited"
      ? { "Retry-After": String(result.retryAfterSeconds) }
      : {};
  return jsonResponse(result, statusCode(result), headers);
}
