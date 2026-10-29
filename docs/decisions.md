# Decision record — 2026-10-29

Confirmed: Next.js App Router + TypeScript + GSAP; Neon PostgreSQL + Drizzle; Better Auth + GitHub OAuth restricted by stable GitHub numeric owner ID; no public registration. English first, Arabic/RTL later. Intended host Vercel, site/callback origins environment-driven, custom domain not a blocker.

Instagram account: Creator. Read account/media/supported account & content Insights, status and last successful sync. Publishing/comments/write operations OUT of scope. Tokens server-only encrypted; DB snapshots, reconnect/failure states, never Meta on every public request, never automatic publication of synchronized content. Current Meta Unified Login documentation identifies instagram_basic and instagram_manage_insights; exact account/permission/metric eligibility must be verified in Phase 7.

Visual: supplied references + real portrait, no Figma/assets expected. Japanese minimal/cinematic, original environmental art rather than flattened screenshots/stock. Scroll-linked Blue → Crimson direction subject to review. Contact remains Light Blue independently of global accent.

Private drafts and draft assets: authenticated access only before explicit publication; new project/article draft by default; public listing/details/search/metadata/sitemap exclude drafts and unpublished detail returns404. Owner previews/edits in dashboard. Publish/unpublish/delete distinct explicit actions; deletion confirmed and includes DB AND object bytes/variants. Outbox/reconciliation handles partial deletion; no claim of physical delete from DB row removal. Equivalent controls apply to other publishable content and imported/synced items.

Phase 2 scope: public Home + reusable design system + responsive/accessibility/reduced motion/GSAP cleanup + honest labeled empty/project placeholders and only verified 5+ years. No dashboard, OAuth, migrations, live GitHub/Instagram, other public pages or deployment claim in this phase. Navbar uses existing Home anchors rather than unimplemented routes.

Current source commit d60860b includes neon.ts and @neon/config/@neon/env; preserve additions. Committed merge-conflict markers in package.json require repair retaining both Neon dependencies. Preserve next.config.ts until an observed compatibility failure justifies a targeted change.

Vercel constraints for later: Node/pg/Neon compatible, singleton pool and Fluid Compute pool lifecycle integration evaluated at Phase4; no resident process/setInterval. Hobby Cron at most once/day, coarse timing and best-effort delivery; protected CRON_SECRET, lock/idempotence and reconciliation required. More frequent synchronization requires a suitable paid plan or explicitly chosen external scheduler.

Storage remains an explicit selection before Phase4: Vercel Blob private offers simpler auth-gated delivery and actual deletion; private R2 S3 offers lower egress costs with extra integration complexity. Do NOT provision either now. Default to recommending private Blob for small portfolio assets; check actual usage/cost and get approval before paid provisioning. Never public-obscure URLs for draft assets. Production deletion cannot promise erasure from provider backups without a separate contractual guarantee.

Sources:
- https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package
- https://vercel.com/docs/vercel-blob/private-storage
- https://vercel.com/docs/vercel-blob/usage-and-pricing
- https://developers.cloudflare.com/r2/pricing/
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/permissions
