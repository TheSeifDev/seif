import { z } from "zod";
import { adminError, adminRequest, ok, readJson } from "@/lib/cms/http";
import { publishDraft } from "@/lib/cms/repository";
import { refreshPublishedContent } from "@/lib/cms/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const owner = await adminRequest(request, true);
    const { expectedRevision } = z
      .object({ expectedRevision: z.number().int().positive() })
      .strict()
      .parse(await readJson(request));
    const result = await publishDraft(expectedRevision, owner.session.user.id);
    refreshPublishedContent();
    return ok(result);
  } catch (error) {
    return adminError(error);
  }
}
