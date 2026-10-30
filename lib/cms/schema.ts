import { z } from "zod";

/**
 * URLs accepted by public CMS content. Local relative paths are allowed for
 * site assets/routes; external links must use HTTPS. Protocol-relative URLs,
 * executable/data URLs and embedded raw blobs are intentionally rejected.
 */
const SAFE_RELATIVE_URL = /^\/(?!\/)[^\u0000-\u001f<>]*$/;
const SAFE_HTTPS_URL = /^https:\/\/[^\u0000-\u001f<>\s]+$/i;

function isSafePublicUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed !== value) return false;
  if (SAFE_RELATIVE_URL.test(value)) return true;
  if (!SAFE_HTTPS_URL.test(value)) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.hostname.endsWith(".local") &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1" &&
      url.hostname !== "0.0.0.0" &&
      url.hostname !== "[::1]"
    );
  } catch {
    return false;
  }
}

const publicUrl = z
  .string()
  .min(1)
  .max(2048)
  .refine(isSafePublicUrl, "Use a site-relative path or an HTTPS URL");

const slug = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase kebab-case slug");

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();
const textArray = (maxItem: number, maxItems = 500) =>
  z.array(text(maxItem)).max(maxItems);
const nonEmptyTextArray = (maxItem: number, maxItems = 500) =>
  textArray(maxItem, maxItems).min(1);
const isoDate = z.string().datetime({ offset: true });
const identifier = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const identityLineSchema = z
  .object({
    text: z.string().max(240),
    accent: optionalText(240),
  })
  .strict();

const identitySchema = z
  .object({
    label: text(80),
    statement: z
      .object({
        a: z.array(identityLineSchema).min(1).max(12),
        b: z.array(identityLineSchema).min(1).max(12),
      })
      .strict(),
    // The cinematic desktop composition has one copy block on either side
    // of the portrait; changing that shape would break its motion layout.
    blocks: z
      .array(
        z
          .object({
            kanji: text(16),
            reading: text(80),
            title: text(160),
            body: text(2000),
          })
          .strict(),
      )
      .length(2),
    caption: text(80),
    next: text(160),
  })
  .strict();

const profileSchema = z
  .object({
    name: text(120),
    firstName: text(80),
    lastName: text(80),
    fullName: text(160),
    handle: text(120),
    alias: text(120),
    role: text(160),
    shortRole: text(160),
    experienceYears: text(40),
    platforms: text(40),
    email: z.string().trim().email().max(320),
    githubUrl: publicUrl,
    location: text(160),
    availability: text(240),
    cvUrl: publicUrl,
    japaneseMotto: text(240),
    japaneseMottoMeaning: text(240),
    headline: text(240),
    intro: text(2000),
    summary: text(4000),
  })
  .strict();

const assetsSchema = z
  .object({
    heroBackground: publicUrl,
    heroWorld: publicUrl,
    aboutInk: publicUrl,
    contactScene: publicUrl,
    portrait: publicUrl,
  })
  .strict();

const experienceSchema = z
  .array(
    z
      .object({
        role: text(240),
        organization: text(240),
        location: text(160),
        period: text(120),
        points: nonEmptyTextArray(2000),
        stack: textArray(120),
      })
      .strict(),
  )
  .max(200);

const educationSchema = z
  .object({
    degree: text(240),
    institution: text(240),
    period: text(120),
  })
  .strict();

const trainingSchema = z
  .array(
    z
      .object({
        provider: text(240),
        items: nonEmptyTextArray(240),
      })
      .strict(),
  )
  .max(200);

const principlesSchema = z
  .array(
    z
      .object({
        title: text(160),
        body: text(2000),
        icon: identifier,
      })
      .strict(),
  )
  .max(200);

const journeySchema = z
  .array(
    z
      .object({
        id: identifier,
        index: text(16),
        kanji: text(16),
        reading: text(80),
        meaning: text(120),
        period: text(120),
        title: text(240),
        body: text(2400),
        facts: z
          .array(z.object({ label: text(120), value: text(500) }).strict())
          .max(50),
      })
      .strict(),
  )
  .max(200);

const processStepsSchema = z
  .array(
    z
      .object({
        id: identifier,
        index: text(16),
        title: text(160),
        kanji: text(16),
        summary: text(500),
        detail: text(2400),
        outputs: nonEmptyTextArray(240),
      })
      .strict(),
  )
  .max(200);

const navigationSchema = z
  .array(
    z
      .object({ href: z.string().trim().min(1).max(240), label: text(120) })
      .strict(),
  )
  .max(100);

const skillGroupsSchema = z
  .array(z.object({ name: text(120), skills: nonEmptyTextArray(120) }).strict())
  .max(200);

const marqueeRowsSchema = z
  .array(
    z
      .object({
        label: text(120),
        caption: text(240),
        direction: z.enum(["left", "right"]),
        items: nonEmptyTextArray(120),
      })
      .strict(),
  )
  .max(100);

const projectLinkSchema = z
  .object({
    url: publicUrl,
    label: text(120),
    note: optionalText(1000),
  })
  .strict();

const projectSchema = z
  .object({
    id: identifier,
    slug,
    title: text(240),
    category: text(160),
    domains: nonEmptyTextArray(120),
    kanji: text(16),
    kanjiMeaning: text(120),
    summary: text(2000),
    description: text(5000),
    highlights: nonEmptyTextArray(2400),
    features: z
      .array(
        z.object({ title: text(160), items: nonEmptyTextArray(1000) }).strict(),
      )
      .max(100)
      .optional(),
    architecture: z
      .object({
        steps: z
          .array(z.object({ name: text(160), detail: text(1000) }).strict())
          .min(1)
          .max(100),
        note: text(2000),
      })
      .strict()
      .optional(),
    stack: textArray(120),
    live: projectLinkSchema.optional(),
    repo: projectLinkSchema.optional(),
    image: z
      .object({ src: publicUrl, alt: text(500), caption: text(500) })
      .strict()
      .optional(),
    availability: optionalText(500),
    featured: z.boolean(),
    status: z.enum(["draft", "published"]).default("published"),
    sources: nonEmptyTextArray(500),
  })
  .strict();

const blogBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: text(12000) }).strict(),
  z.object({ type: z.literal("h2"), text: text(500) }).strict(),
  z.object({ type: z.literal("h3"), text: text(500) }).strict(),
  z.object({ type: z.literal("quote"), text: text(4000) }).strict(),
  z
    .object({
      type: z.literal("list"),
      items: nonEmptyTextArray(4000, 200),
      ordered: z.boolean().optional(),
    })
    .strict(),
  z
    .object({ type: z.literal("code"), language: text(80), code: text(30000) })
    .strict(),
]);

const postSchema = z
  .object({
    slug,
    title: text(240),
    description: text(2000),
    status: z.enum(["draft", "published"]),
    origin: z.enum(["initial-draft", "author"]),
    reviewRequired: z.boolean(),
    publishedAt: isoDate.optional(),
    updatedAt: isoDate,
    readingMinutes: z.number().int().min(1).max(1440),
    tags: nonEmptyTextArray(120),
    body: z.array(blogBlockSchema).min(1).max(1000),
  })
  .strict();

const seoSchema = z
  .object({
    siteOrigin: z
      .string()
      .trim()
      .url()
      .refine(isSafePublicUrl, "Use a public HTTPS origin")
      .refine((value) => /^https:\/\//i.test(value), "Use an HTTPS site origin")
      .refine((value) => {
        try {
          const url = new URL(value);
          return (
            url.pathname === "/" &&
            !url.search &&
            !url.hash &&
            !url.username &&
            !url.password
          );
        } catch {
          return false;
        }
      }, "Use an origin without a path, query, or credentials"),
    siteName: text(160),
    defaultTitle: text(240),
    titleTemplate: text(240),
    description: text(4000),
    locale: text(40),
    ogImage: publicUrl,
    socialImageAlt: text(300),
    twitterCard: z.enum(["summary", "summary_large_image"]),
    googleSiteVerification: z.string().trim().max(200).optional(),
    robots: z.object({ index: z.boolean(), follow: z.boolean() }).strict(),
  })
  .strict();

const siteContentBaseSchema = z
  .object({
    profile: profileSchema,
    assets: assetsSchema,
    identity: identitySchema,
    experience: experienceSchema,
    education: educationSchema,
    training: trainingSchema,
    principles: principlesSchema,
    journey: journeySchema,
    processSteps: processStepsSchema,
    navigation: navigationSchema,
    skillGroups: skillGroupsSchema,
    marqueeRows: marqueeRowsSchema,
    projects: z.array(projectSchema).max(1000),
    posts: z.array(postSchema).max(1000),
    copy: z.record(z.string(), text(12000)),
    seo: seoSchema,
  })
  .strict();

/**
 * Complete CMS payload validator. The final refinement protects public routes
 * from ambiguous records before persistence: IDs/slugs are unique, references
 * are resolvable, and published posts/projects contain the data their routes
 * need to render safely.
 */
export const siteContentSchema = siteContentBaseSchema.superRefine(
  (content, ctx) => {
    const checkUnique = (
      values: string[],
      path: (string | number)[],
      label: string,
    ) => {
      const seen = new Map<string, number>();
      values.forEach((value, index) => {
        const previous = seen.get(value);
        if (previous !== undefined) {
          ctx.addIssue({
            code: "custom",
            path: [...path, index],
            message: `${label} must be unique; duplicates item ${previous + 1}`,
          });
        } else {
          seen.set(value, index);
        }
      });
    };

    checkUnique(
      content.navigation.map((item) => item.href),
      ["navigation"],
      "Navigation href",
    );
    checkUnique(
      content.journey.map((item) => item.id),
      ["journey"],
      "Journey id",
    );
    checkUnique(
      content.processSteps.map((item) => item.id),
      ["processSteps"],
      "Process step id",
    );
    checkUnique(
      content.projects.map((item) => item.id),
      ["projects"],
      "Project id",
    );
    checkUnique(
      content.projects.map((item) => item.slug),
      ["projects"],
      "Project slug",
    );
    checkUnique(
      content.posts.map((item) => item.slug),
      ["posts"],
      "Post slug",
    );
    checkUnique(
      content.skillGroups.map((item) => item.name.toLowerCase()),
      ["skillGroups"],
      "Skill group name",
    );

    const projectSlugs = new Set(
      content.projects.map((project) => project.slug),
    );
    content.navigation.forEach((item, index) => {
      if (
        !item.href.startsWith("/") ||
        item.href.startsWith("//") ||
        /[?#]/.test(item.href)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["navigation", index, "href"],
          message: "Navigation links must be clean relative site paths",
        });
      }
    });
    content.projects.forEach((project, index) => {
      if (project.status === "published" && project.slug.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["projects", index, "slug"],
          message: "Published projects need a slug",
        });
      }
    });

    // Reserved route slugs must not collide with fixed collection routes.
    for (const [index, project] of content.projects.entries()) {
      if (["about", "blog", "contact", "projects"].includes(project.slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["projects", index, "slug"],
          message: "Slug collides with a reserved public route",
        });
      }
    }
    for (const [index, post] of content.posts.entries()) {
      if (
        ["about", "blog", "contact", "projects"].includes(post.slug) ||
        projectSlugs.has(post.slug)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["posts", index, "slug"],
          message: "Post slug collides with a public route or project slug",
        });
      }
      if (post.status === "published" && !post.publishedAt) {
        ctx.addIssue({
          code: "custom",
          path: ["posts", index, "publishedAt"],
          message: "Published posts require publishedAt",
        });
      }
    }
  },
);

export type SiteContent = z.infer<typeof siteContentSchema>;
export type SiteContentInput = z.input<typeof siteContentSchema>;
export type BlogBlock = SiteContent["posts"][number]["body"][number];
export type SiteProject = SiteContent["projects"][number];
