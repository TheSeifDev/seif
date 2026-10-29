import { NextResponse, type NextRequest } from "next/server";
import { getPublishedPosts } from "@/lib/content/blog";
import { projects } from "@/lib/content/projects";

/**
 * Unknown project slugs and unpublished (draft) article slugs are rejected
 * before rendering so they receive a real 404 and never leak draft content.
 */
const projectSlugs = new Set(projects.map((project) => project.slug));
const publishedPostSlugs = new Set(getPublishedPosts().map((post) => post.slug));

function isKnown(pathname: string) {
  const [, section, slug, ...rest] = pathname.split("/");
  if (!slug || rest.some(Boolean)) return false;
  let decoded: string;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    return false;
  }
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
