import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/content/blog";
import { projects } from "@/lib/content/projects";

function siteBase() {
  const configured = process.env.SITE_URL?.trim();
  // SITE_URL must be set in production so crawlers receive the canonical origin.
  return configured && /^https?:\/\//i.test(configured)
    ? configured.replace(/\/+$/, "")
    : "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteBase();
  const staticRoutes = [
    "/",
    "/about",
    "/projects",
    ...projects.map((project) => `/projects/${project.slug}`),
    "/blog",
    "/contact",
  ];
  const publishedPosts = getPublishedPosts();

  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}` })),
    ...publishedPosts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ];
}
