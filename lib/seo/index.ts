export {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SITE_ORIGIN,
  SITE_NAME,
  SITE_TITLE,
  createNoIndexMetadata,
  createPageMetadata,
  createRootMetadata,
  getSiteOrigin,
  personId,
  siteOgImageUrl,
  siteUrl,
  websiteId,
} from "@/lib/seo/metadata";
export {
  createArticleGraph,
  createBreadcrumbList,
  createCollectionPageGraph,
  createContactPageGraph,
  createFaqPageGraph,
  createHomeGraph,
  createProfilePageGraph,
  createProjectGraph,
  createProjectsIndexItems,
  createSiteGraph,
} from "@/lib/seo/structured-data";
export type { BreadcrumbItem, FaqItem } from "@/lib/seo/structured-data";
