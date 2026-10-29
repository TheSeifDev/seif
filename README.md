# Seif Ayman Portfolio

A multi-page portfolio for Seif Ayman built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, GSAP/ScrollTrigger, and a lazy Three.js moon sequence on the Home page.

## Public routes

- `/` — Home, including the Cinematic Identity Sequence between About and The Journey.
- `/about`
- `/projects` and `/projects/[slug]`
- `/blog` and `/blog/[slug]` — unpublished draft articles are not exposed.
- `/contact`

The private dashboard is a later, separate phase and is not part of the public routes. This recovered copy has not been published.

## Local development

```bash
npm ci
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
python3 scripts/check-multipage.py
python3 scripts/check-identity.py
```

The two browser scripts expect a production server at `http://127.0.0.1:3000`; build the app and run `npm start` in another terminal first.

## Contact service configuration

The contact route stores messages in PostgreSQL through Drizzle and can notify the site owner through Resend. Copy `.env.example` to `.env.local` and supply server-side values only after the database and verified sender are configured. With no database configuration, the API responds with `503 not_configured`; it does not claim the message was saved. Neon and Resend are not configured or tested for this copy.

The local PostgreSQL integration script is `scripts/test-contact.ts`; it targets a dedicated local `portfolio_test` database and is not intended to run against a shared or production database.

## Source and publishing

The public GitHub repository was used as a read-only reference. This project was reconstructed from the completed prior project’s source snapshots. Publishing is intentionally disabled for this task; no public deployment has been made.
