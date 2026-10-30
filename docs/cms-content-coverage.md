# CMS content coverage

This document describes the content boundary implemented in `lib/cms/schema.ts`, `lib/cms/defaults.ts`, and `lib/cms/copy.ts`. The seed is intentionally private-dashboard ready: it preserves the current public content and all three initial blog drafts without publishing or rewriting them.

## Top-level controls

| CMS key | Seed source | Public consumers today | Editable coverage |
| --- | --- | --- | --- |
| `profile` | `lib/content/profile.ts` (`profile`) | Home hero/connect, About introduction/hero, Contact details, site logo/footer/navbar, structured data | Identity, role, links, location, availability, CV, motto, headline, intro, summary |
| `assets` | `lib/content/profile.ts` (`assets`) | Home hero/about/identity/connect, About introduction, Contact hero, project media fallback | Relative or HTTPS public asset paths only |
| `identity` | `lib/content/profile.ts` (`identity`) | `components/home/identity.tsx` | Statement lines, two cinematic copy blocks, caption and next cue; exactly two blocks are retained because the existing pinned composition places one on each side of the portrait |
| `experience` | `lib/content/profile.ts` (`experience`) | `components/about/experience-section.tsx` | Roles, organizations, periods, locations, points and working stacks |
| `education` | `lib/content/profile.ts` (`education`) | `components/about/education-section.tsx` | Degree, institution and period |
| `training` | `lib/content/profile.ts` (`training`) | `components/about/education-section.tsx` | Providers and programme/item lists |
| `principles` | `lib/content/profile.ts` (`principles`) | `components/home/about.tsx`, `components/about/principles-section.tsx` | Title, body and icon key; unknown added icon names should use the public component's existing fallback strategy when integrated |
| `journey` | `lib/content/profile.ts` (`journey`) | `components/home/journey.tsx` | Chapter IDs, index/kanji labels, period, title/body and fact rows |
| `processSteps` | `lib/content/profile.ts` (`processSteps`) | `components/home/process.tsx` | Step IDs, index/kanji, summary/detail and outputs |
| `navigation` | `lib/content/profile.ts` (`navigation`) | `components/site/navbar.tsx`, `components/site/footer.tsx`, breadcrumbs are still route-defined | Relative clean hrefs and labels |
| `skillGroups` | `lib/content/skills.ts` (`skillGroups`) | `components/home/skills.tsx`, `components/about/capabilities-section.tsx` | Group names and skill lists; the current technology icon registry retains a generic fallback for added names |
| `marqueeRows` | `lib/content/skills.ts` (`marqueeRows`) | `components/home/skills-marquee.tsx` | Labels, captions, direction and items |
| `projects` | `lib/content/projects.ts` (`projects`) | Home featured/more cards, `/projects`, case-study routes, project structured data, sitemap | All original project fields plus CMS `id` and `status: "draft" | "published"`; current six projects are seeded `published` to preserve the existing public site |
| `posts` | `lib/content/blog.ts` (`posts`) | Blog listing/article routes, metadata, sitemap, structured data | Original `BlogBlock` union and post fields, including `draft`, `origin`, `reviewRequired`, `publishedAt?`, `updatedAt`, tags and body; all current posts remain `draft` / `initial-draft` / review-required |
| `copy` | Inventory in `lib/cms/copy.ts` | Current literals in the files listed below; parent integration can replace them with `getCopy()` calls | Stable dot keys for headings, captions, CTAs, labels, form states, accessibility labels, footer text, 404 text and exact FAQ questions/answers |
| `seo` | `lib/seo/metadata.ts`, `lib/seo/site-verification.ts` and current rendered metadata | Root/page metadata and public origin consumers | Official `https://theseif.vercel.app` origin, title/description/social fields, robots flags and the public Google Search Console HTML token. No server credentials are imported. |

## Copy inventory by public source

`defaultCopy` covers the display literals currently outside the structured content records. The exact FAQ source is `app/(site)/about/page.tsx`, and its rendering is `components/about/about-faq-section.tsx`; questions and answers are represented as `about.faq.question.*` and `about.faq.answer.*`.

| Area | Current source files |
| --- | --- |
| Global shell, skip link, navigation, logo, footer | `app/layout.tsx`, `components/site/logo.tsx`, `components/site/navbar.tsx`, `components/site/footer.tsx` |
| Home hero/about/identity/journey/projects/skills/process/contact CTA | `components/home/hero.tsx`, `about.tsx`, `identity.tsx`, `journey.tsx`, `featured-projects.tsx`, `more-projects.tsx`, `skills.tsx`, `skills-marquee.tsx`, `process.tsx`, `connect-cta.tsx` |
| About hero, introduction, experience, education, capabilities, principles, FAQ and closing CTA | `components/about/about-hero.tsx`, `introduction-section.tsx`, `experience-section.tsx`, `education-section.tsx`, `capabilities-section.tsx`, `principles-section.tsx`, `about-faq-section.tsx`, `app/(site)/about/page.tsx` |
| Projects archive/index/focus/CTA and case-study labels | `components/projects/projects-hero.tsx`, `projects-index.tsx`, `project-stack.tsx`, `projects-cta.tsx`, `app/(site)/projects/[slug]/page.tsx`, `components/system/project-media.tsx`, `components/projects/case-study-media.tsx` |
| Blog empty state, article/list labels and reading UI | `app/(site)/blog/page.tsx`, `app/(site)/blog/[slug]/page.tsx`, `components/blog/article-body.tsx` |
| Contact hero/details/form labels/placeholders/statuses | `app/(site)/contact/page.tsx`, `components/contact/contact-form.tsx` |
| Not-found route | `app/not-found.tsx` |

Dynamic values intentionally remain in their records rather than being duplicated in `copy`: names, project titles/summaries, dates, counts, profile email/location/availability, skill names and post content. Braced values in copy (for example `{title}`, `{email}`, `{count}`) are interpolation templates, not invented facts.

## Validation and cross-field behavior

- The top-level object is strict and contains exactly the requested CMS keys.
- Text fields are trimmed and bounded; arrays have high safety ceilings without requiring the current item counts.
- Public asset and external-link fields allow site-relative paths or HTTPS only. `javascript:`, `data:`, protocol-relative URLs, control characters, credentials and local/private host forms are rejected.
- Project IDs, project slugs, post slugs, navigation hrefs, journey IDs, process IDs and skill-group names are checked for uniqueness where they act as keys.
- Project slugs cannot collide with fixed public routes. Post slugs cannot collide with fixed routes or project slugs.
- Published posts require `publishedAt`; draft posts may omit it. The seed keeps every initial draft private.
- Existing identity motion requires two identity blocks. Other arrays are editable and not pinned to the current count.
- `defaultSiteContent` is produced through JSON serialization and schema parsing, so it is mutable, JSON-safe seed data rather than readonly source tuples.

## Constraints outside this data boundary

- Public routes/components now receive sanitized published CMS content instead of importing `lib/content/*`. Checked-in exports remain the versioned seed and the safe pre-activation source; `CMS_ENABLED=true` switches the application to database-backed snapshots after reviewed migrations.
- GSAP scenes, selectors, route names, section IDs, CSS classes, breakpoints, pin geometry and visual timing remain runtime/style code, not CMS content. Editing a label cannot safely change those mechanics.
- Original image imports resolve to fingerprinted build assets. Uploads use the separate protected private-Blob flow, with stable `/api/media/<id>` addresses. Draft assets require owner authentication; only references in published content enable anonymous reads. Referenced files cannot be deleted, and durable deletion markers allow cleanup retries without losing the storage address.
- Icon components are selected by code. New skill/principle icon keys need the existing fallback or a future registry control; the schema does not execute arbitrary component names.
- Counts, formatted dates, project filters, next-project links, breadcrumbs, JSON-LD shape and sitemap entries are generated from CMS records at runtime rather than being free-form layout code. Article updatedAt is stamped server-side when article data changes. Runtime slug validation supports newly published records and returns true 404 responses for drafts/unpublished records.
- Contact notification outcomes and validation are server/runtime behavior. The copy inventory includes their current public messages, but it does not expose contact secrets, database credentials, auth settings or email-provider configuration.
- Better Auth/owner authorization, transactional PostgreSQL revisions, the protected dashboard and APIs are implemented outside the model files. External Neon, GitHub OAuth and private Blob configuration remains a separate, explicitly pending operational step; local test success does not claim live-provider readiness.
