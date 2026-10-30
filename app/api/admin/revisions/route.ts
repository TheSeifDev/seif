import { z } from "zod";
import { adminError, adminRequest, ok, readJson } from "@/lib/cms/http";
import { listRevisions, restoreRevision } from "@/lib/cms/repository";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await adminRequest(request);
    return ok({ items: await listRevisions() });
  } catch (error) {
    return adminError(error);
  }
}
export async function POST(request: Request) {
  try {
    const owner = await adminRequest(request, true);
    const input = z
      .object({
        id: z.string().uuid(),
        expectedRevision: z.number().int().positive(),
      })
      .strict()
      .parse(await readJson(request));
    return ok(
      await restoreRevision(
        input.id,
        input.expectedRevision,
        owner.session.user.id,
      ),
    );
  } catch (error) {
    return adminError(error);
  }
}
