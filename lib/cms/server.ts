import "server-only";
import { cache } from "react";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { readPublishedContent } from "@/lib/cms/repository";
import type { SiteContent } from "@/lib/cms/schema";

// Defaults are used only before database configuration/initialization. Once a
// configured database fails, propagate the error rather than republish old data.
const loadPublished = unstable_cache(
  readPublishedContent,
  ["seif-published-content-v1"],
  { tags: ["site-content"], revalidate: 60 },
);
export const getSiteContent = cache(
  async (): Promise<SiteContent> => structuredClone(await loadPublished()),
);
export function refreshPublishedContent() {
  revalidateTag("site-content", { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  revalidatePath("/llms.txt");
  revalidatePath("/opengraph-image");
}
