import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { isDeepStrictEqual } from "node:util";
import { getDb } from "@/lib/db/client";
import { defaultSiteContent } from "@/lib/cms/defaults";
import { siteContentSchema, type SiteContent } from "@/lib/cms/schema";
import { cmsMedia, cmsRevisions, cmsState } from "@/lib/cms/tables";

export class CmsError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "CmsError";
  }
}

function database() {
  const db = getDb();
  if (!db)
    throw new CmsError(
      "DATABASE_NOT_CONFIGURED",
      503,
      "Content storage is not configured.",
    );
  return db;
}

export function sanitizePublicContent(content: SiteContent): SiteContent {
  const data = structuredClone(content);
  data.projects = data.projects.filter(
    (project) => project.status === "published",
  );
  data.posts = data.posts.filter(
    (post) =>
      post.status === "published" &&
      !post.reviewRequired &&
      Boolean(post.publishedAt) &&
      new Date(post.publishedAt!).getTime() <= Date.now(),
  );
  return data;
}

/** Initialization is an authorized one-time INSERT, never an upsert/reset. */
export async function getAdminContent() {
  const db = database();
  await db
    .insert(cmsState)
    .values({
      id: "main",
      draft: defaultSiteContent,
      published: defaultSiteContent,
      revision: 1,
      publishedRevision: 1,
    })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(cmsState)
    .where(eq(cmsState.id, "main"))
    .limit(1);
  if (!row)
    throw new CmsError(
      "CONTENT_UNAVAILABLE",
      503,
      "Content initialization did not finish.",
    );
  return {
    content: siteContentSchema.parse(row.draft),
    revision: row.revision,
    publishedRevision: row.publishedRevision,
    dirty: row.revision !== row.publishedRevision,
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt.toISOString(),
  };
}

/** Anonymous reads do not initialize or write to the database. */
export async function readPublishedContent(): Promise<SiteContent> {
  const db = getDb();
  if (!db || process.env.CMS_ENABLED !== "true")
    return sanitizePublicContent(defaultSiteContent);
  const [row] = await db
    .select({ content: cmsState.published })
    .from(cmsState)
    .where(eq(cmsState.id, "main"))
    .limit(1);
  return sanitizePublicContent(
    row ? siteContentSchema.parse(row.content) : defaultSiteContent,
  );
}

export async function saveDraft(
  input: unknown,
  expectedRevision: number,
  actorId: string,
) {
  const content = siteContentSchema.parse(input);
  const db = database();
  const row = await db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(cmsState)
      .where(eq(cmsState.id, "main"))
      .for("update");
    if (!current || current.revision !== expectedRevision)
      throw new CmsError(
        "REVISION_CONFLICT",
        409,
        "Content changed in another session. Reload before saving.",
      );
    content.posts = content.posts.map((post) => {
      const previous = current.draft.posts.find(
        (item) => item.slug === post.slug,
      );
      const comparable = (item: typeof post) => ({
        ...item,
        updatedAt: undefined,
      });
      return {
        ...post,
        updatedAt:
          !previous ||
          !isDeepStrictEqual(comparable(previous), comparable(post))
            ? new Date().toISOString()
            : previous.updatedAt,
      };
    });
    const mediaIds = [
      ...new Set(
        [
          ...JSON.stringify(content).matchAll(
            /\/api\/media\/([a-f0-9-]{36})/gi,
          ),
        ].map((match) => match[1]),
      ),
    ];
    if (mediaIds.length) {
      const active = await tx
        .select({ id: cmsMedia.id })
        .from(cmsMedia)
        .where(and(inArray(cmsMedia.id, mediaIds), isNull(cmsMedia.deletedAt)));
      if (active.length !== mediaIds.length)
        throw new CmsError(
          "MEDIA_UNAVAILABLE",
          409,
          "A referenced file is missing or pending deletion. Choose an available file before saving.",
        );
    }
    const [saved] = await tx
      .update(cmsState)
      .set({
        draft: content,
        revision: sql`${cmsState.revision} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(cmsState.id, "main"), eq(cmsState.revision, expectedRevision)),
      )
      .returning();
    if (!saved)
      throw new CmsError(
        "REVISION_CONFLICT",
        409,
        "Content changed in another session. Reload before saving.",
      );
    await tx
      .insert(cmsRevisions)
      .values({ revision: saved.revision, kind: "draft", content, actorId });
    return saved;
  });
  return {
    content,
    revision: row.revision,
    publishedRevision: row.publishedRevision,
    dirty: true,
  };
}

export async function publishDraft(expectedRevision: number, actorId: string) {
  const db = database();
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(cmsState)
      .where(eq(cmsState.id, "main"))
      .for("update");
    if (!row || row.revision !== expectedRevision)
      throw new CmsError(
        "REVISION_CONFLICT",
        409,
        "Reload the saved draft before publishing.",
      );
    const content = siteContentSchema.parse(row.draft);
    const unreviewed = content.posts.filter(
      (post) => post.status === "published" && post.reviewRequired,
    );
    if (unreviewed.length)
      throw new CmsError(
        "REVIEW_REQUIRED",
        409,
        "Review the initial article drafts before marking them published.",
      );
    if (row.publishedRevision !== row.revision) {
      await tx
        .update(cmsState)
        .set({
          published: content,
          publishedRevision: row.revision,
          publishedAt: new Date(),
        })
        .where(eq(cmsState.id, "main"));
      await tx
        .insert(cmsRevisions)
        .values({ revision: row.revision, kind: "publish", content, actorId });
    }
    return {
      content,
      revision: row.revision,
      publishedRevision: row.revision,
      dirty: false,
    };
  });
}

export async function listRevisions() {
  return database()
    .select({
      id: cmsRevisions.id,
      revision: cmsRevisions.revision,
      kind: cmsRevisions.kind,
      createdAt: cmsRevisions.createdAt,
    })
    .from(cmsRevisions)
    .orderBy(desc(cmsRevisions.createdAt))
    .limit(50);
}

export async function restoreRevision(
  id: string,
  expectedRevision: number,
  actorId: string,
) {
  const [row] = await database()
    .select({ content: cmsRevisions.content })
    .from(cmsRevisions)
    .where(eq(cmsRevisions.id, id))
    .limit(1);
  if (!row)
    throw new CmsError("NOT_FOUND", 404, "That revision no longer exists.");
  return saveDraft(row.content, expectedRevision, actorId);
}

function contentReferences(content: SiteContent, id: string) {
  return JSON.stringify(content).includes(`/api/media/${id}`);
}

export async function mediaVisibility(
  id: string,
): Promise<"published" | "draft"> {
  return contentReferences(await readPublishedContent(), id)
    ? "published"
    : "draft";
}

export async function mediaIsReferenced(id: string): Promise<boolean> {
  const [row] = await database()
    .select()
    .from(cmsState)
    .where(eq(cmsState.id, "main"))
    .limit(1);
  return Boolean(
    row &&
      (contentReferences(row.draft, id) ||
        contentReferences(sanitizePublicContent(row.published), id)),
  );
}

export async function listMedia() {
  const rows = await database()
    .select()
    .from(cmsMedia)
    .orderBy(desc(cmsMedia.createdAt));
  const published = await readPublishedContent();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    url: `/api/media/${row.id}`,
    type: row.contentType,
    size: row.size,
    alt: row.alt,
    visibility: row.deletedAt
      ? "deletion-pending"
      : contentReferences(published, row.id)
        ? "published"
        : "draft",
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getMedia(id: string) {
  const [row] = await database()
    .select()
    .from(cmsMedia)
    .where(eq(cmsMedia.id, id))
    .limit(1);
  return row;
}

export async function createMedia(row: typeof cmsMedia.$inferInsert) {
  const [saved] = await database().insert(cmsMedia).values(row).returning();
  if (!saved)
    throw new CmsError(
      "UPLOAD_NOT_SAVED",
      503,
      "The file record could not be saved.",
    );
  return {
    id: saved.id,
    name: saved.name,
    url: `/api/media/${saved.id}`,
    type: saved.contentType,
    size: saved.size,
    alt: saved.alt,
    visibility: "draft",
    createdAt: saved.createdAt.toISOString(),
  };
}

export async function removeMediaRecord(id: string) {
  await database().delete(cmsMedia).where(eq(cmsMedia.id, id));
}

/** Lock content against concurrent saves before recording a recoverable deletion. */
export async function beginMediaDeletion(id: string) {
  return database().transaction(async (tx) => {
    const [state] = await tx
      .select()
      .from(cmsState)
      .where(eq(cmsState.id, "main"))
      .for("update");
    if (
      state &&
      (contentReferences(state.draft, id) ||
        contentReferences(sanitizePublicContent(state.published), id))
    ) {
      throw new CmsError(
        "MEDIA_IN_USE",
        409,
        "Remove this file from saved and published content before deleting it.",
      );
    }
    const [item] = await tx
      .update(cmsMedia)
      .set({ deletedAt: new Date() })
      .where(eq(cmsMedia.id, id))
      .returning();
    if (!item) throw new CmsError("NOT_FOUND", 404, "File not found.");
    return item;
  });
}
