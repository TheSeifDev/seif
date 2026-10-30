import { assets, profile } from "@/lib/content/profile";
import { projects, type Project } from "@/lib/content/projects";
import type { BlogPost } from "@/lib/content/blog";
import { personId, siteUrl, websiteId } from "@/lib/seo/metadata";

const context = "https://schema.org";

export type BreadcrumbItem = {
  name: string;
  path?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

const personReference = { "@id": personId() };
const websiteReference = { "@id": websiteId() };

export function createSiteGraph() {
  return {
    "@context": context,
    "@graph": [
      {
        "@type": "Person",
        "@id": personId(),
        name: profile.fullName,
        alternateName: [profile.name, profile.handle, profile.alias],
        url: siteUrl("/"),
        image: siteUrl(assets.portrait),
        jobTitle: profile.role,
        description: profile.summary,
        homeLocation: {
          "@type": "Place",
          name: profile.location,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Alexandria",
            addressCountry: "Egypt",
          },
        },
        sameAs: [profile.githubUrl],
        knowsAbout: [
          "Full-stack web development",
          "TypeScript",
          "React",
          "Next.js",
          "Node.js",
          "NestJS",
          "PostgreSQL",
          "Software architecture",
          "Retrieval-Augmented Generation",
          "MQTT and IoT systems",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId(),
        name: "Seif Ayman",
        alternateName: profile.handle,
        url: siteUrl("/"),
        description:
          "Portfolio of Seif Ayman Ahmed, Senior Full Stack Software Developer.",
        inLanguage: "en",
        publisher: personReference,
        about: personReference,
      },
    ],
  };
}

export function createBreadcrumbList(items: readonly BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: siteUrl(item.path) } : {}),
    })),
  };
}

export function createProfilePageGraph({
  path,
  name,
  description,
  breadcrumbs,
}: {
  path: string;
  name: string;
  description: string;
  breadcrumbs?: readonly BreadcrumbItem[];
}) {
  const pageUrl = siteUrl(path);
  return {
    "@context": context,
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#profile`,
        url: pageUrl,
        name,
        description,
        isPartOf: websiteReference,
        mainEntity: personReference,
      },
      ...(breadcrumbs ? [createBreadcrumbList(breadcrumbs)] : []),
    ],
  };
}

export function createCollectionPageGraph({
  path,
  name,
  description,
  breadcrumbs,
  items,
}: {
  path: string;
  name: string;
  description: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  items?: readonly { name: string; path: string }[];
}) {
  const pageUrl = siteUrl(path);
  const itemList = items
    ? {
        "@type": "ItemList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          url: siteUrl(item.path),
        })),
      }
    : undefined;

  return {
    "@context": context,
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        url: pageUrl,
        name,
        description,
        isPartOf: websiteReference,
        ...(itemList ? { mainEntity: itemList } : {}),
      },
      ...(breadcrumbs ? [createBreadcrumbList(breadcrumbs)] : []),
    ],
  };
}

export function createContactPageGraph({
  path,
  name,
  description,
  breadcrumbs,
}: {
  path: string;
  name: string;
  description: string;
  breadcrumbs: readonly BreadcrumbItem[];
}) {
  const pageUrl = siteUrl(path);
  return {
    "@context": context,
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${pageUrl}#contact`,
        url: pageUrl,
        name,
        description,
        isPartOf: websiteReference,
        mainEntity: personReference,
      },
      createBreadcrumbList(breadcrumbs),
    ],
  };
}

export function createFaqPageGraph(items: readonly FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function createProjectGraph(project: Project) {
  const pageUrl = siteUrl(`/projects/${project.slug}`);
  const projectType = project.repo ? "SoftwareSourceCode" : "CreativeWork";
  const externalLinks = [project.live?.url, project.repo?.url].filter(
    (url): url is string => Boolean(url),
  );

  return {
    "@context": context,
    "@graph": [
      {
        "@type": projectType,
        "@id": `${pageUrl}#project`,
        url: pageUrl,
        name: project.title,
        description: project.description,
        abstract: project.summary,
        genre: project.category,
        keywords: [...project.domains, ...project.stack],
        creator: personReference,
        isPartOf: websiteReference,
        ...(project.image ? { image: siteUrl(project.image.src) } : {}),
        ...(externalLinks.length ? { sameAs: externalLinks } : {}),
        ...(project.repo ? { codeRepository: project.repo.url } : {}),
        ...(project.repo ? { programmingLanguage: project.stack } : {}),
      },
      createBreadcrumbList([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: project.title, path: `/projects/${project.slug}` },
      ]),
    ],
  };
}

export function createArticleGraph(post: BlogPost & { publishedAt: string }) {
  const pageUrl = siteUrl(`/blog/${post.slug}`);
  return {
    "@context": context,
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: personReference,
        keywords: post.tags,
        isPartOf: websiteReference,
        mainEntityOfPage: { "@id": `${pageUrl}#article` },
      },
      createBreadcrumbList([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ],
  };
}

export function createHomeGraph() {
  const pageUrl = siteUrl("/");
  return {
    "@context": context,
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#profile`,
        url: pageUrl,
        name: "Seif Ayman — Senior Full Stack Developer",
        description: profile.summary,
        isPartOf: websiteReference,
        mainEntity: personReference,
      },
    ],
  };
}

export function createProjectsIndexItems() {
  return projects.map((project) => ({
    name: project.title,
    path: `/projects/${project.slug}`,
  }));
}
