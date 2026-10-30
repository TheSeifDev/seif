# Private dashboard authentication setup

This project uses Better Auth with GitHub OAuth and a PostgreSQL/Neon Drizzle adapter. The implementation targets the exact current stable packages checked during this change:

```sh
npm install better-auth@1.7.14 @better-auth/drizzle-adapter@1.7.14
```

The package versions should remain pinned together. The auth implementation uses `better-auth/minimal` because the project supplies the Drizzle adapter, and mounts the standard Next.js App Router handler at `/api/auth/*`.

## GitHub OAuth application

Create or update one GitHub OAuth App with this exact authorization callback URL:

```text
https://theseif.vercel.app/api/auth/callback/github
```

The application must request only the scopes needed by the implementation:

- `read:user`, for the GitHub profile and stable numeric profile ID.
- `user:email`, because Better Auth requires an email field on its user record and GitHub may keep that address private.

The server does not authorize by email, GitHub handle, display name, or avatar. The admission gate checks the raw GitHub OAuth profile ID before Better Auth provisions a user/account or creates a session. Only numeric GitHub ID `167328383` is admitted. The durable authorization check in `requireAdmin()` independently requires a stored Better Auth account row with:

```text
providerId = "github"
accountId  = "167328383"
```

## Vercel environment variables

Set these variables for the Production environment and any Preview environment that is intentionally allowed to authenticate. Do not commit values to the repository, and do not put the GitHub client secret in a `NEXT_PUBLIC_*` variable.

```text
BETTER_AUTH_SECRET=<at least 32 random characters with high entropy>
GITHUB_CLIENT_ID=<GitHub OAuth App client ID>
GITHUB_CLIENT_SECRET=<GitHub OAuth App client secret>
DATABASE_URL=<Neon pooled/runtime connection string>
SITE_URL=https://theseif.vercel.app
CMS_ENABLED=true
```

`SITE_URL` is consumed through the existing canonical `getSiteOrigin()` helper. That helper rejects local/request-derived origins and safely falls back to `https://theseif.vercel.app`; the auth configuration does not infer its origin from `NODE_ENV`, an internal HTTP URL, forwarded headers, or a browser-supplied callback URL. `BETTER_AUTH_URL` is not required by this implementation because `baseURL` is set explicitly from the canonical site helper.

After changing a Vercel variable, redeploy the affected environment. A missing or invalid runtime configuration is not replaced by a dummy secret or fake account: the auth endpoint returns `503 AUTH_NOT_CONFIGURED`, and server-side authorization throws a controlled `AuthError` with status `503`.

## Database merge and migration

The auth schema `lib/auth/schema.ts` exports the four Better Auth core tables explicitly: `user`, `session`, `account`, and `verification`. They are already merged into `lib/db/schema.ts`, alongside `cms_state`, `cms_revisions`, `cms_media` and the preserved contact table. Do not create a second Drizzle database client.

The parent schema should expose the auth tables to Drizzle Kit, for example by re-exporting the auth schema exports alongside the application tables. The auth server separately passes the explicit `{ user, session, account, verification }` object to `drizzleAdapter(..., { provider: "pg" })`.

Reviewed additive migrations are already generated as `drizzle/0001_early_next_avengers.sql` and `drizzle/0002_mixed_doctor_strange.sql`; the second adds a recoverable media-deletion timestamp. Review the target database's migration history and take a backup before applying through the existing Drizzle configuration:

```sh
npx drizzle-kit migrate
```

Keep `CMS_ENABLED=false` until the migrations and provider secrets are configured; this protects the current public portfolio even if its contact database is already connected. Do not re-run an untracked contact-table creation against an existing table. Reconcile migration history before applying if the target was previously provisioned outside Drizzle. Then set `CMS_ENABLED=true` and redeploy. No production migration was performed during this task.

The migration must create these Better Auth columns and constraints:

- `user`: text primary key `id`; non-null `name`, unique non-null `email`, non-null `email_verified`, nullable `image`, and non-null `created_at`/`updated_at` timestamps.
- `session`: text primary key `id`; unique non-null `token`; non-null `expires_at`, `created_at`, and `updated_at`; nullable `ip_address` and `user_agent`; non-null `user_id` referencing `user.id` with cascade delete.
- `account`: text primary key `id`; non-null `account_id`, `provider_id`, and `user_id`; nullable OAuth token fields and expiry timestamps; nullable `scope` and `password`; non-null `created_at`/`updated_at`; foreign key to `user.id` with cascade delete; unique `(provider_id, account_id)` and an index on `user_id`.
- `verification`: text primary key `id`; non-null `identifier`, `value`, and `expires_at`; non-null `created_at`/`updated_at` timestamps.

The existing `drizzle.config.ts` currently points at `./lib/db/schema.ts`, so the merge is required for `drizzle-kit generate` to see the auth tables. Better Auth’s schema generator may also be used as a reference, but the final migration must be generated/reviewed with the project’s main Drizzle schema so it preserves the existing contact table.

## Runtime and protection contract

`getAuth()` is lazy and returns `null` until all required variables are present, the secret is at least 32 characters, and `getDb()` can obtain a database connection. It never creates a fallback secret or an in-memory account. The catch-all route therefore returns a cache-disabled `503` while unconfigured.

`requireAdmin(request?)` is the required guard for every dashboard server action, route handler, and protected server component. With no argument it reads Next.js request headers for RSC use; with a `Request` it uses that request’s headers. It first asks Better Auth to validate the session, then queries the stored `account` table for the exact GitHub provider/account pair. A valid session without that stored row receives a controlled `403`; no email, username, session-cookie presence, or UI redirect is accepted as authorization.

The OAuth admission gate is implemented with Better Auth’s `user.validateUserInfo`. It rejects every method except GitHub OAuth and every GitHub profile whose raw numeric `id` is not `167328383`, before new user/account provisioning and again on returning OAuth sign-in. Email/password and public registration are unavailable. The verified owner may be provisioned on first OAuth login; disabling implicit creation would incorrectly lock that owner out too. The social sign-in hook fixes callback/error destinations to `/dashboard`; CSRF and origin checks stay enabled. OAuth tokens are encrypted before database storage.

Cookies are HTTP-only. Their `Secure` flag is derived from the canonical trusted origin’s protocol, not from `NODE_ENV` or an internal request URL. The production trusted origin is HTTPS, so production cookies are `Secure; SameSite=None; HttpOnly`, allowing the dashboard auth flow to work when embedded. Only the canonical site origin is trusted.

## Official references

The implementation follows these official Better Auth references:

- [Installation and Next.js route handler](https://better-auth.com/docs/installation)
- [Next.js integration, RSC session access, and Next.js 16 guidance](https://better-auth.com/docs/integrations/next)
- [Drizzle ORM adapter](https://better-auth.com/docs/adapters/drizzle)
- [OAuth providers and `validateUserInfo`](https://better-auth.com/docs/concepts/oauth)
- [Users, accounts, and the pre-provision validation callback](https://better-auth.com/docs/concepts/users-accounts)
- [Core database schema](https://better-auth.com/docs/concepts/database)
- [Hooks and pre-endpoint request validation](https://better-auth.com/docs/concepts/hooks)
- [Security, CSRF, trusted origins, and cookies](https://better-auth.com/docs/reference/security)
- [Cookie configuration](https://better-auth.com/docs/concepts/cookies)
- [Better Auth package registry page](https://www.npmjs.com/package/better-auth)
- [Drizzle adapter package registry page](https://www.npmjs.com/package/@better-auth/drizzle-adapter)
