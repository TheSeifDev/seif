import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/cms/server";
import { cmsUrl } from "@/lib/cms/metadata";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSiteContent();
  const routes = [
    "/",
    "/about",
    "/projects",
    ...content.projects.map((project) => `/projects/${project.slug}`),
    "/blog",
    "/contact",
  ];
  return [
    ...routes.map((route) => ({
      url:
        route === "/"
          ? content.seo.siteOrigin.replace(/\/$/, "")
          : cmsUrl(route, content),
      changeFrequency:
        route === "/" ? ("weekly" as const) : ("monthly" as const),
      priority:
        route === "/"
          ? 1
          : route === "/projects" || route === "/about"
            ? 0.8
            : 0.6,
    })),
    ...content.posts.map((post) => ({
      url: cmsUrl(`/blog/${post.slug}`, content),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
