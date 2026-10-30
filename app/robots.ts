import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/cms/server";
import { cmsUrl } from "@/lib/cms/metadata";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getSiteContent();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard"] },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/api/", "/dashboard"],
      },
    ],
    sitemap: cmsUrl("/sitemap.xml", content),
  };
}
