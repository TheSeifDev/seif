import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unavailable(): Response {
  return Response.json(
    { error: "AUTH_NOT_CONFIGURED" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request): Promise<Response> {
  const auth = getAuth();
  if (!auth) return unavailable();
  return toNextJsHandler(auth).GET(request);
}

export async function POST(request: Request): Promise<Response> {
  const auth = getAuth();
  if (!auth) return unavailable();
  return toNextJsHandler(auth).POST(request);
}
