import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/content/blog";
import { projects } from "@/lib/content/projects";
import { siteUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
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
    ...staticRoutes.map((route) => ({
      url: siteUrl(route),
      changeFrequency: route === "/" ? "weekly" as const : "monthly" as const,
      priority: route === "/" ? 1 : route === "/projects" || route === "/about" ? 0.8 : 0.6,
    })),
    ...publishedPosts.map((post) => ({
      url: siteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
