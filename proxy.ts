import { NextResponse, type NextRequest } from "next/server";
import { readPublishedContent } from "@/lib/cms/repository";

/** Reject unpublished/unknown records before streaming, including runtime CMS slugs. */
export async function proxy(request: NextRequest) {
  const [, section, encoded, ...rest] = request.nextUrl.pathname.split("/");
  let slug = "";
  try {
    slug = decodeURIComponent(encoded ?? "");
  } catch {
    /* rejected below */
  }
  if (!slug || rest.some(Boolean))
    return NextResponse.rewrite(new URL("/__not-found", request.url), {
      status: 404,
    });
  let content;
  try {
    content = await readPublishedContent();
  } catch {
    return new NextResponse("Content temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "30" },
    });
  }
  const known =
    section === "projects"
      ? content.projects.some((project) => project.slug === slug)
      : content.posts.some((post) => post.slug === slug);
  return known
    ? NextResponse.next()
    : NextResponse.rewrite(new URL("/__not-found", request.url), {
        status: 404,
      });
}
export const config = { matcher: ["/projects/:slug+", "/blog/:slug+"] };
