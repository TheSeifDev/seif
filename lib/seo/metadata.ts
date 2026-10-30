import type { Metadata } from "next";
import { profile } from "@/lib/content/profile";
import { createSiteVerification } from "@/lib/seo/site-verification";

export const DEFAULT_SITE_ORIGIN = "https://theseif.vercel.app";
export const RETIRED_SITE_ORIGIN = "https://prof-zeta-one.vercel.app";
export const SITE_NAME = "Seif Ayman";
export const SITE_TITLE = "Seif Ayman — Senior Full Stack Developer";
export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";

/**
 * Return a canonical origin only when SITE_URL is a real absolute HTTP(S)
 * origin. The verified deployed origin is the safe fallback; request-derived
 * and localhost URLs are never emitted into public metadata.
 */
export function getSiteOrigin(): string {
  const configured = process.env.SITE_URL?.trim();

  if (!configured) return DEFAULT_SITE_ORIGIN;

  try {
    const url = new URL(configured);
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    const isOriginOnly =
      url.pathname === "/" && !url.search && !url.hash && !url.username && !url.password;
    const isLocal =
      ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"].includes(url.hostname) ||
      url.hostname.endsWith(".localhost");

    if (!isHttp || !url.hostname || !isOriginOnly || isLocal) return DEFAULT_SITE_ORIGIN;

    // Prevent a stale production environment value from reviving the obsolete canonical origin.
    return url.origin === RETIRED_SITE_ORIGIN ? DEFAULT_SITE_ORIGIN : url.origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

export function siteUrl(path = "/"): string {
  const normalizedPath = path === "/" ? "" : `/${path.replace(/^\/+/, "")}`;
  return `${getSiteOrigin()}${normalizedPath}`;
}

export const personId = () => `${getSiteOrigin()}/#person`;
export const websiteId = () => `${getSiteOrigin()}/#website`;
export const siteOgImageUrl = () => siteUrl(DEFAULT_OG_IMAGE_PATH);

export type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

function pageTitle(title: string, path: string) {
  return path === "/" ? SITE_TITLE : `${title} — ${profile.name}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const canonical = siteUrl(path);
  const socialTitle = pageTitle(title, path);
  const image = siteOgImageUrl();

  return {
    metadataBase: new URL(getSiteOrigin()),
    title: { absolute: socialTitle },
    description,
    alternates: { canonical },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${socialTitle} — ${SITE_NAME}`,
        },
      ],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function createRootMetadata(): Metadata {
  const description =
    "Portfolio of Seif Ayman Ahmed, Senior Full Stack Software Developer in Alexandria, Egypt.";
  const image = siteOgImageUrl();
  const verification = createSiteVerification();

  return {
    metadataBase: new URL(getSiteOrigin()),
    title: {
      default: SITE_TITLE,
      template: "%s — Seif Ayman",
    },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: profile.fullName, url: siteUrl("/") }],
    creator: profile.fullName,
    publisher: SITE_NAME,
    alternates: { canonical: siteUrl("/") },
    openGraph: {
      type: "website",
      url: siteUrl("/"),
      siteName: SITE_NAME,
      title: SITE_TITLE,
      description,
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_TITLE} portfolio preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    ...(verification ? { verification } : {}),
  };
}

export function createNoIndexMetadata(title = "Not found"): Metadata {
  return {
    title: { absolute: `${title} — ${SITE_NAME}` },
    robots: { index: false, follow: false },
  };
}
