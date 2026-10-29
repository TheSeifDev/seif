import type { MetadataRoute } from "next";

function siteBase() {
  const configured = process.env.SITE_URL?.trim();
  // SITE_URL must be set in production so the sitemap has a canonical origin.
  return configured && /^https?:\/\//i.test(configured)
    ? configured.replace(/\/+$/, "")
    : "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard"],
    },
    sitemap: `${siteBase()}/sitemap.xml`,
  };
}
