import { z } from "zod";
import { adminError, adminRequest, ok, readJson } from "@/lib/cms/http";
import { getAdminContent, saveDraft } from "@/lib/cms/repository";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await adminRequest(request);
    return ok(await getAdminContent());
  } catch (error) {
    return adminError(error);
  }
}
export async function PUT(request: Request) {
  try {
    const owner = await adminRequest(request, true);
    const input = z
      .object({
        content: z.unknown(),
        expectedRevision: z.number().int().positive(),
      })
      .strict()
      .parse(await readJson(request));
    return ok(
      await saveDraft(
        input.content,
        input.expectedRevision,
        owner.session.user.id,
      ),
    );
  } catch (error) {
    return adminError(error);
  }
}
