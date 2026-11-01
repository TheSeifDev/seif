import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SITE_ORIGIN,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/seo/metadata";
import { PUBLIC_GOOGLE_SITE_VERIFICATION } from "@/lib/seo/site-verification";
import {
  assets,
  education,
  experience,
  identity,
  journey,
  navigation,
  principles,
  processSteps,
  profile,
  training,
} from "@/lib/content/profile";
import { projects } from "@/lib/content/projects";
import { posts } from "@/lib/content/blog";
import { marqueeRows, skillGroups } from "@/lib/content/skills";
import { defaultCopy } from "@/lib/cms/copy";
import {
  DEFAULT_HOME_SECTIONS,
  siteContentSchema,
  type SiteContent,
} from "@/lib/cms/schema";

const projectDefaults = projects.map((project, index) => ({
  ...project,
  id: `project-${project.slug}`,
  status: "published" as const,
  placement: {
    featured: { enabled: Boolean(project.featured), order: index },
    more: { enabled: !project.featured, order: index },
  },
}));

const initialContent = {
  profile,
  assets,
  identity,
  experience,
  education,
  training,
  principles,
  journey,
  processSteps,
  navigation,
  skillGroups,
  marqueeRows,
  projects: projectDefaults,
  // Preserve every initial blog draft exactly; status and review metadata are
  // intentionally not promoted or rewritten here.
  posts,
  copy: defaultCopy,
  seo: {
    siteOrigin: DEFAULT_SITE_ORIGIN,
    siteName: SITE_NAME,
    defaultTitle: SITE_TITLE,
    titleTemplate: "%s Seif Ayman",
    description:
      "Portfolio of Seif Ayman Ahmed, Senior Full Stack Software Developer in Alexandria, Egypt.",
    locale: "en_US",
    ogImage: DEFAULT_OG_IMAGE_PATH,
    socialImageAlt: `${SITE_TITLE} portfolio preview`,
    twitterCard: "summary_large_image" as const,
    googleSiteVerification: PUBLIC_GOOGLE_SITE_VERIFICATION,
    robots: { index: true, follow: true },
  },
  home: {
    sections: [...DEFAULT_HOME_SECTIONS],
  },
  faq: [1, 2, 3].map((index) => ({
    id: `faq-${index}`,
    question: defaultCopy[`about.faq.question.${index}`] || "",
    answer: defaultCopy[`about.faq.answer.${index}`] || "",
  })),
};

/**
 * The dashboard can safely mutate this value after loading. JSON cloning is
 * deliberate: it removes readonly tuples/imported module references and makes
 * the exported seed contain only values that can cross a database boundary.
 */
const jsonDefaults: unknown = JSON.parse(JSON.stringify(initialContent));

export const defaultSiteContent: SiteContent =
  siteContentSchema.parse(jsonDefaults);

export default defaultSiteContent;
