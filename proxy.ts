import { NextResponse, type NextRequest } from "next/server";
import { getPublishedPosts } from "@/lib/content/blog";
import { projects } from "@/lib/content/projects";

/**
 * With Cache Components, `dynamicParams = false` is unavailable and a
 * `notFound()` thrown inside a partially prerendered page keeps the 200
 * status of the already-streamed shell. Unknown project slugs and
 * unpublished (draft) article slugs are therefore rejected here, before
 * rendering, so they receive a real 404.
 */
const projectSlugs = new Set(projects.map((project) => project.slug));
const publishedPostSlugs = new Set(getPublishedPosts().map((post) => post.slug));

function isKnown(pathname: string) {
  const [, section, slug, ...rest] = pathname.split("/");
  if (!slug || rest.some(Boolean)) return false;
  const decoded = decodeURIComponent(slug);
  if (section === "projects") return projectSlugs.has(decoded);
  if (section === "blog") return publishedPostSlugs.has(decoded);
  return true;
}

export function proxy(request: NextRequest) {
  if (isKnown(request.nextUrl.pathname)) return NextResponse.next();

  return NextResponse.rewrite(new URL("/__not-found", request.url), {
    status: 404,
  });
}

export const config = {
  matcher: ["/projects/:slug+", "/blog/:slug+"],
};
