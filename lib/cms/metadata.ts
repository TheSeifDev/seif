import type { Metadata } from "next";
import type { SiteContent } from "@/lib/cms/schema";
import {
  createPageMetadata,
  createRootMetadata,
  getSiteOrigin,
  type PageMetadataOptions,
} from "@/lib/seo/metadata";

export function cmsUrl(path: string, content: SiteContent) {
  return new URL(path || "/", `${content.seo.siteOrigin}/`).href;
}
export function createCmsPageMetadata(
  input: PageMetadataOptions & {
    absoluteTitle?: boolean;
    robots?: Metadata["robots"];
    tags?: string[];
  },
  content: SiteContent,
): Metadata {
  const base = createPageMetadata(input);
  const title =
    input.path === "/"
      ? content.seo.defaultTitle
      : input.absoluteTitle
        ? input.title
        : content.seo.titleTemplate.replace("%s", input.title);
  const canonical =
    input.path === "/"
      ? content.seo.siteOrigin.replace(/\/$/, "")
      : cmsUrl(input.path, content);
  const descriptionKey = `seo.page.${input.path === "/" ? "home" : input.path.split("/").filter(Boolean).join(".")}.description`;
  const description =
    content.copy[descriptionKey] ||
    (input.path === "/" ? content.seo.description : input.description);
  const image = cmsUrl(content.seo.ogImage, content);
  const robots = input.robots ?? {
    ...content.seo.robots,
    googleBot: {
      ...content.seo.robots,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
  return {
    ...base,
    metadataBase: new URL(content.seo.siteOrigin),
    title: { absolute: title },
    description,
    authors: [{ name: content.profile.fullName, url: content.seo.siteOrigin }],
    creator: content.profile.fullName,
    alternates: { canonical },
    robots,
    openGraph: {
      ...base.openGraph,
      title,
      description,
      url: canonical,
      siteName: content.seo.siteName,
      locale: content.seo.locale,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: content.seo.socialImageAlt,
        },
      ],
      ...(input.type === "article" && input.tags ? { tags: input.tags } : {}),
    },
    twitter: {
      card: content.seo.twitterCard,
      title,
      description,
      images: [image],
    },
  };
}
export function createCmsRootMetadata(content: SiteContent): Metadata {
  const base = createRootMetadata();
  const page = createCmsPageMetadata(
    { title: "Home", description: content.seo.description, path: "/" },
    content,
  );
  return {
    ...base,
    ...page,
    applicationName: content.seo.siteName,
    publisher: content.seo.siteName,
    title: {
      default: content.seo.defaultTitle,
      template: content.seo.titleTemplate,
    },
    verification: content.seo.googleSiteVerification
      ? { google: content.seo.googleSiteVerification }
      : {},
  };
}

/** Preserve the existing graph structure while replacing static identity/host fields. */
export function withCmsGraph<T>(graph: T, content: SiteContent): T {
  const origin = getSiteOrigin();
  const target = content.seo.siteOrigin.replace(/\/$/, "");
  function transform(value: unknown): unknown {
    if (typeof value === "string") {
      if (value.startsWith(`${origin}/https://`))
        return value.slice(origin.length + 1);
      return value.startsWith(origin)
        ? target + value.slice(origin.length)
        : value;
    }
    if (Array.isArray(value)) return value.map(transform);
    if (!value || typeof value !== "object") return value;
    const source = value as Record<string, unknown>;
    const node = Object.fromEntries(
      Object.entries(source).map(([key, child]) => [key, transform(child)]),
    );
    if (node["@type"] === "Person")
      Object.assign(node, {
        name: content.profile.fullName,
        alternateName: [
          content.profile.name,
          content.profile.handle,
          content.profile.alias,
        ],
        url: target,
        image: cmsUrl(content.assets.portrait, content),
        jobTitle: content.profile.role,
        description: content.profile.summary,
        homeLocation: { "@type": "Place", name: content.profile.location },
        sameAs: [content.profile.githubUrl],
        knowsAbout: [
          ...new Set(content.skillGroups.flatMap((group) => group.skills)),
        ],
      });
    if (node["@type"] === "WebSite")
      Object.assign(node, {
        name: content.seo.siteName,
        alternateName: content.profile.handle,
        description: content.seo.description,
        inLanguage: content.seo.locale.split("_")[0],
      });
    if (node["@type"] === "ProfilePage" && node.url === target)
      Object.assign(node, {
        name: content.seo.defaultTitle,
        description: content.profile.summary,
      });
    return node;
  }
  return transform(graph) as T;
}
