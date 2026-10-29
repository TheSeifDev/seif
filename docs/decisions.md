# Decision record

## Final decisions — 29 October 2026 (settled, do not reopen)

1. **Multi-page public site**: `/`, `/about`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/contact`. The private dashboard is a separate area built in a later phase.
2. **Contact**: dedicated `/contact` page with the complete form. Home ends with a concise "Let's Connect" CTA linking to `/contact`. Server-side validation and honest feedback; success is shown only when the message has actually been persisted (and notification status is reported separately).
3. **Submission workflow: Neon PostgreSQL + Resend.** Messages are persisted in Neon (Drizzle migrations) for later review in the dashboard; Resend sends an owner notification when configured. Store only what is needed (name, email, message, status, timestamps, keyed IP hash for rate limiting). Server-side validation, honeypot + timing spam checks, rate limiting. No keys in client code. Missing DB config → message is NOT accepted and the UI says so. Saved but email failed/not configured → UI says the message was saved and the notification did not go out. Integrations are not claimed operational until configured and tested against the real services.
4. **Blog**: three initial article drafts based on CV subjects, `status: "draft"`, `origin: "initial-draft"`. Never shown on `/blog`, article routes (404), sitemap or metadata until explicitly published. No invented personal experiences or results. The dashboard must label them as initial drafts.
5. **More Projects**: exactly three on desktop — Nabd Masr, Personal Portfolio, TrackUp (https://trakeup.vercel.app/, https://github.com/TheSeifDev/traking). Featured: RAFIQ, IT-SUM, PHANTOMS. No duplicates. `Watch Live` / `Go to Repo` only for verified URLs.
6. **Visual system**: black/white structural contrast; Light Blue is the single accent family (two steps: on-dark and on-light). No Crimson, no Three.js moon/circle in the Hero. Three.js removed because it did not contribute to the composition.
7. **Styling**: Tailwind utilities only (theme tokens and keyframes live in `app/globals.css` `@theme`). GSAP + ScrollTrigger via `@gsap/react` `useGSAP` scoped per component so route changes revert triggers.

## Earlier decisions still valid

Next.js App Router + TypeScript + GSAP; Neon PostgreSQL + Drizzle; Better Auth + GitHub OAuth restricted by the owner's numeric GitHub ID; no public registration. English first, Arabic/RTL later. Intended host Vercel; site and callback origins come from environment variables; custom domain not a blocker.

Instagram (later phase): Creator account; read account/media/supported insights only; encrypted server-side tokens; DB snapshots; reconnect/failure states; never publish synchronized content automatically.

Private drafts and draft assets: authenticated access only before explicit publication; public listing/details/search/metadata/sitemap exclude drafts; unpublished details return 404. Publish/unpublish/delete are distinct explicit actions; deletion is confirmed and removes DB rows and stored bytes.

Vercel constraints for later: Node `pg` pool singleton (Fluid Compute), no resident processes. Hobby cron at most once a day. Storage choice (private Vercel Blob vs private R2) is made before the dashboard asset phase; nothing provisioned now.

Preserve `neon.ts` and `@neon/config` / `@neon/env`, and `next.config.ts` unless a concrete failure requires a change.
