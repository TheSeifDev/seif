import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const root = process.cwd();
const url = process.env.CMS_TEST_DATABASE_URL;
if (!url)
  throw new Error(
    "Set CMS_TEST_DATABASE_URL to an isolated local PostgreSQL test database. Never use production credentials.",
  );
const parsed = new URL(url);
if (
  !["127.0.0.1", "localhost"].includes(parsed.hostname) ||
  !parsed.pathname.endsWith("_test")
)
  throw new Error(
    "Refusing to write to anything except a localhost database ending in _test.",
  );
process.env.DATABASE_URL = url;
process.env.CMS_ENABLED = "true";
const output = path.join(root, ".cms-test-repository.cjs");
await build({
  stdin: {
    contents: `export * from './lib/cms/repository'; export {defaultSiteContent} from './lib/cms/defaults'; export {siteContentSchema} from './lib/cms/schema'; export {getDb} from './lib/db/client'; export {cmsState,cmsMedia,cmsRevisions} from './lib/cms/tables';`,
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  packages: "external",
  outfile: output,
  plugins: [
    {
      name: "test-static-images",
      setup(b) {
        b.onLoad({ filter: /\.(webp|png|jpg|jpeg)$/ }, (args) => ({
          contents: `export default {src:${JSON.stringify("/images/" + path.basename(args.path))},width:1200,height:900};`,
          loader: "js",
        }));
      },
    },
  ],
});
const require = createRequire(import.meta.url);
const cms = require(output);
const db = cms.getDb();
await db.execute("TRUNCATE cms_state,cms_revisions,cms_media RESTART IDENTITY");
const checks = [];
const check = (name, condition) => {
  assert.ok(condition, name);
  checks.push({ name, passed: true });
  console.log("PASS", name);
};
const baseline = await cms.getAdminContent();
check(
  "Original projects, skills and all three initial drafts retained",
  baseline.content.projects.length === 6 &&
    baseline.content.skillGroups.length === 15 &&
    baseline.content.posts.length === 3 &&
    baseline.content.posts.every((p) => p.status === "draft"),
);
let publicContent = await cms.readPublishedContent();
check(
  "Anonymous snapshot never contains initial blog drafts",
  publicContent.posts.length === 0,
);
const edited = structuredClone(baseline.content);
edited.profile.availability = "Test-only availability";
edited.projects[0].title = "Test-only project title";
edited.copy["about.introduction.title"] = "Test-only introduction";
const saved = await cms.saveDraft(
  edited,
  baseline.revision,
  "local-test-editor",
);
check(
  "Draft saved durably with next revision",
  saved.revision === 2 &&
    (await cms.getAdminContent()).content.profile.availability ===
      "Test-only availability",
);
publicContent = await cms.readPublishedContent();
check(
  "Save does not publish profile, project or copy changes",
  publicContent.profile.availability !== edited.profile.availability &&
    publicContent.projects[0].title !== edited.projects[0].title &&
    publicContent.copy["about.introduction.title"] !==
      edited.copy["about.introduction.title"],
);
await assert.rejects(
  () => cms.saveDraft(edited, 1, "local-test-editor"),
  (e) => e.code === "REVISION_CONFLICT",
);
check(
  "Stale revision cannot overwrite newer changes",
  (await cms.getAdminContent()).revision === 2,
);
const published = await cms.publishDraft(2, "local-test-editor");
publicContent = await cms.readPublishedContent();
check(
  "Explicit publish updates all fields together",
  published.publishedRevision === 2 &&
    publicContent.profile.availability === edited.profile.availability &&
    publicContent.projects[0].title === edited.projects[0].title &&
    publicContent.copy["about.introduction.title"] ===
      edited.copy["about.introduction.title"],
);
const article = structuredClone(edited);
article.posts[0].status = "published";
article.posts[0].publishedAt = new Date(Date.now() - 1000).toISOString();
const pendingReview = await cms.saveDraft(article, 2, "local-test-editor");
await assert.rejects(
  () => cms.publishDraft(pendingReview.revision, "local-test-editor"),
  (e) => e.code === "REVIEW_REQUIRED",
);
check(
  "Initial drafts require explicit author review before publishing",
  (await cms.readPublishedContent()).posts.length === 0,
);
article.posts[0].reviewRequired = false;
article.posts[0].origin = "author";
article.projects[0].status = "draft";
let revision = (
  await cms.saveDraft(article, pendingReview.revision, "local-test-editor")
).revision;
await cms.publishDraft(revision, "local-test-editor");
publicContent = await cms.readPublishedContent();
check(
  "Reviewed article publishes; unpublished project and other draft articles excluded",
  publicContent.posts.length === 1 &&
    publicContent.projects.length === 5 &&
    !publicContent.projects.some((p) => p.id === article.projects[0].id),
);
const revisions = await cms.listRevisions();
const old = revisions.find((r) => r.kind === "draft" && r.revision === 2);
const restored = await cms.restoreRevision(
  old.id,
  revision,
  "local-test-editor",
);
check(
  "Restoration creates a new draft without rolling back live content",
  restored.revision === revision + 1 &&
    (await cms.readPublishedContent()).posts.length === 1 &&
    restored.content.posts.every((p) => p.status === "draft"),
);
const bad = structuredClone(restored.content);
bad.profile.cvUrl = "javascript:alert(1)";
check(
  "Unsafe executable URLs rejected",
  !cms.siteContentSchema.safeParse(bad).success,
);
const duplicate = structuredClone(restored.content);
duplicate.projects[1].slug = duplicate.projects[0].slug;
check(
  "Duplicate project slugs rejected",
  !cms.siteContentSchema.safeParse(duplicate).success,
);
const empty = structuredClone(restored.content);
empty.projects = [];
empty.posts = [];
empty.journey = [];
empty.skillGroups = [];
check(
  "Intentional empty archives accepted",
  cms.siteContentSchema.safeParse(empty).success,
);
const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
await cms.createMedia({
  id,
  storageUrl: "https://test.private.blob.vercel-storage.com/test.webp",
  name: "local fixture.webp",
  contentType: "image/webp",
  size: 100,
  actorId: "local-test-editor",
});
check("Unlinked media is private", (await cms.mediaVisibility(id)) === "draft");
const mediaDraft = structuredClone(restored.content);
mediaDraft.assets.portrait = `/api/media/${id}`;
const next = await cms.saveDraft(
  mediaDraft,
  restored.revision,
  "local-test-editor",
);
check(
  "Draft media cannot be anonymously fetched, and deletion detects saved reference",
  (await cms.mediaVisibility(id)) === "draft" &&
    (await cms.mediaIsReferenced(id)),
);
await cms.publishDraft(next.revision, "local-test-editor");
check(
  "Media becomes public only when referenced by published content",
  (await cms.mediaVisibility(id)) === "published",
);
const repeated = await cms.getAdminContent();
check(
  "Repeated initialization never resets edited content",
  repeated.content.assets.portrait === `/api/media/${id}` &&
    repeated.revision === next.revision,
);
await assert.rejects(
  () => cms.beginMediaDeletion(id),
  (e) => e.code === "MEDIA_IN_USE",
);
check(
  "Referenced media cannot enter deletion state",
  !(await cms.getMedia(id)).deletedAt,
);
const unused = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
await cms.createMedia({
  id: unused,
  storageUrl: "https://test.private.blob.vercel-storage.com/unused.webp",
  name: "local unused fixture.webp",
  contentType: "image/webp",
  size: 100,
  actorId: "local-test-editor",
});
const pending = await cms.beginMediaDeletion(unused);
check(
  "Deletion intent is durable before external bytes cleanup",
  Boolean(pending.deletedAt) &&
    (await cms.listMedia()).find((item) => item.id === unused).visibility ===
      "deletion-pending",
);
await cms.beginMediaDeletion(unused);
check(
  "Interrupted deletion can be retried without losing storage reference",
  (await cms.getMedia(unused)).storageUrl === pending.storageUrl,
);
const invalidMedia = structuredClone(repeated.content);
invalidMedia.assets.portrait = `/api/media/${unused}`;
await assert.rejects(
  () => cms.saveDraft(invalidMedia, repeated.revision, "local-test-editor"),
  (e) => e.code === "MEDIA_UNAVAILABLE",
);
check(
  "Pending-deletion media cannot be linked by a concurrent save",
  (await cms.getAdminContent()).revision === repeated.revision,
);
await cms.removeMediaRecord(unused);
check(
  "Confirmed cleanup can remove the tombstone",
  !(await cms.getMedia(unused)),
);
const unchanged = await cms.saveDraft(
  repeated.content,
  repeated.revision,
  "local-test-editor",
);
check(
  "Unchanged article timestamps are preserved",
  unchanged.content.posts[0].updatedAt === repeated.content.posts[0].updatedAt,
);
const articleChange = structuredClone(unchanged.content);
articleChange.posts[0].title += " — local edit";
articleChange.posts[0].updatedAt = "2000-01-01T00:00:00.000Z";
const timestamped = await cms.saveDraft(
  articleChange,
  unchanged.revision,
  "local-test-editor",
);
check(
  "Changed articles get a server modification timestamp",
  new Date(timestamped.content.posts[0].updatedAt).getTime() >
    new Date("2000-01-01").getTime() &&
    timestamped.content.posts[0].updatedAt !== articleChange.posts[0].updatedAt,
);
// Leave the isolated DB in the real initial state for the component fixture.
await db.execute("TRUNCATE cms_state,cms_revisions,cms_media RESTART IDENTITY");
await cms.getAdminContent();
await fs.mkdir(path.join(root, "docs/checks"), { recursive: true });
await fs.writeFile(
  path.join(root, "docs/checks/cms-repository-results.json"),
  JSON.stringify(
    {
      scope: "isolated-local-postgresql-not-production",
      checks,
      failures: [],
      externalOAuthAndBlobTested: false,
    },
    null,
    2,
  ) + "\n",
);
await fs.writeFile(
  "/tmp/seif-cms-fixture-content.json",
  JSON.stringify(cms.defaultSiteContent),
);
await fs.unlink(output);
await globalThis.__contactPool?.end();
console.log("CMS repository checks passed:", checks.length);
