# Seif Ayman Portfolio

A multi-page portfolio for Seif Ayman built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, GSAP/ScrollTrigger, and a lazy Three.js moon sequence on Home. The primary typeface is self-hosted variable Montserrat through `next/font`; Japanese copy and technical labels use system fallbacks without additional web-font downloads.

## Public routes

- `/` — Home, including the Cinematic Identity Sequence.
- `/about` — background, capabilities, working principles and a factual professional FAQ.
- `/projects` and `/projects/[slug]` — verified public projects and case studies.
- `/blog` and `/blog/[slug]` — unpublished drafts are not exposed.
- `/contact` — contact form and direct contact links.
- `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/llms.txt` — public discovery resources.

The private dashboard remains a separate future phase, not a public route.

## Development and checks

```bash
npm ci
npm run dev
```

Production validation uses the built app, not the development server:

```bash
npm run build
npm run typecheck
npm run lint
npm start
# In another terminal:
python3 scripts/check-seo.py
python3 scripts/check-refinement.py
python3 scripts/check-multipage.py
python3 scripts/check-performance-interaction.py
```

The browser checks require Python Playwright and Chromium. Their default target is `http://127.0.0.1:3000`. Non-pinned below-fold Home motion and compact-screen scenes are initialized as a section approaches the viewport; pinned desktop sections establish their spacing during initial layout so anchor positions stay stable. The multipage test visits deferred sections before comparing the full ScrollTrigger lifecycle. Meaningful content remains server-rendered and readable without JavaScript.

To repeat Lighthouse with an installed CLI:

```bash
LIGHTHOUSE_BIN=lighthouse bash scripts/measure-lighthouse.sh http://127.0.0.1:3000 current
```

The script measures mobile and desktop separately using Lighthouse's default simulated throttling and a cold browser profile. Reports go to `LIGHTHOUSE_OUT`, defaulting to `/home/ubuntu/seif-lighthouse`. Run it without other browser/build jobs competing for CPU. Scores are lab measurements, not field Core Web Vitals or a guarantee of identical PageSpeed scores in production.

## Performance and public discovery

`lib/seo` centralizes metadata and public identity graphs. Set `SITE_URL` to the real production origin; the verified default is `https://theseif.vercel.app`. The retired `https://prof-zeta-one.vercel.app` value is remapped to the new default so a stale production environment cannot resurrect the obsolete canonical. Change it if the portfolio moves to a custom domain. Do not use a preview URL or localhost as the production canonical.

Public pages provide route-specific canonical, Open Graph and Twitter metadata in the server HTML. Linked Person/WebSite/ProfilePage and project/article/breadcrumb graphs use only curated public facts from `docs/content-sources.md`. The About FAQ is visible and uses the same source data as its markup. Draft posts are absent from listings, the sitemap and `/llms.txt`; missing pages return 404/noindex.

`OAI-SearchBot` is explicitly allowed to crawl public content, while API/dashboard routes stay excluded. The existing wildcard policy for other crawlers is unchanged; search visibility is separate from model-training permission. `/llms.txt` is a supplementary factual summary, not a requirement or ranking guarantee.

### Google Search Console ownership and sitemap

The site supports Google Search Console's **HTML tag** verification method through the root metadata. Create a **URL-prefix** property for the exact deployed origin, `https://theseif.vercel.app`, then copy only the account-issued `content` value from Google's verification tag into `GOOGLE_SITE_VERIFICATION` in `.env.local` (or into `PUBLIC_GOOGLE_SITE_VERIFICATION` in `lib/seo/site-verification.ts` when a durable public configuration is preferred) and redeploy. The value is intentionally public in the rendered HTML, but it must be the genuine token for the property; never place Google API credentials in the application.

After the deployment containing the genuine token is live, complete **Verify** in the owning Search Console account. Then submit `https://theseif.vercel.app/sitemap.xml` in that URL-prefix property and use URL Inspection if individual indexing requests are needed. The relevant Google guidance is [verify your website ownership](https://support.google.com/webmasters/answer/9008080?hl=en) and [submit a sitemap](https://support.google.com/webmasters/answer/7451001?hl=en). Code support only emits the verification tag and sitemap URL; it does not create or own the Search Console property, sign in to an account, or complete verification on the owner's behalf. Until the genuine token is configured and Google verification is completed, Search Console ownership remains pending; with no token configured, no verification tag is emitted.

Large decorative images are conservatively compressed. Active background imports generate content-hashed URLs so replacing an asset also updates the optimized-image cache key. Next serves responsive AVIF/WebP with bounded quality options. Below-fold project images are lazy-loaded, full-resolution cursor previews mount on demand, and only the main Home portrait is preloaded. Three.js stays lazy and unavailable on low-power/reduced-motion/mobile fallbacks. SplitText/Flip are kept out of the shared Home motion bundle.

## Contact service configuration

The contact route stores messages in PostgreSQL through Drizzle and can notify the owner through Resend. Copy `.env.example` to `.env.local` and supply server-side values only after the database and verified sender are configured. With no database configuration, the API returns `503 not_configured`; it does not claim the message was saved. Neon and Resend are not configured or tested by this performance pass.

`scripts/test-contact.ts` targets a dedicated local `portfolio_test` database, not a shared or production database.

## Source and deployment

Repository: https://github.com/TheSeifDev/seif

Public site: https://theseif.vercel.app

The portfolio was recovered from approved source snapshots and is now maintained in the user's `main` branch. Vercel deployment status must be verified separately from a successful Git push. No purchases, domain changes, private dashboard publication or contact-provider configuration are part of this pass.
