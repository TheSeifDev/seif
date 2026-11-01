"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  ExternalLink,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useDashboard } from "../dashboard-context";
import {
  ArrayEditor,
  BooleanField,
  FieldHelp,
  NotchedPanel,
  SectionHeading,
  StatusPill,
  TextField,
  buttonDanger,
  buttonSecondary,
  fieldClass,
  formatDateTimeLocal,
} from "../dashboard-workspace";
import type { BlogBlock, BlogPost, SiteContent } from "@/lib/cms/schema";

type BlogTab = "all" | "drafts" | "review" | "scheduled" | "published";

export function BlogPage() {
  const { content, updateContent, deleteItem } = useDashboard();
  const posts: SiteContent["posts"] = React.useMemo(
    () => content.posts || [],
    [content.posts],
  );

  const [activeTab, setActiveTab] = React.useState<BlogTab>("all");
  const [query, setQuery] = React.useState("");
  const [selectedSlug, setSelectedSlug] = React.useState<string>(
    posts[0]?.slug || "",
  );
  const [batchSelected, setBatchSelected] = React.useState<Set<string>>(
    new Set(),
  );
  const [warningMessage, setWarningMessage] = React.useState<string | null>(
    null,
  );

  // Computed counts
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftsCount = posts.filter((p) => p.status === "draft").length;
  const reviewCount = posts.filter((p) => p.reviewRequired).length;
  const scheduledCount = posts.filter((p) => Boolean(p.scheduledAt)).length;

  // Filtered posts based on active tab and search query
  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      if (activeTab === "drafts" && post.status !== "draft") return false;
      if (activeTab === "review" && !post.reviewRequired) return false;
      if (activeTab === "scheduled" && !post.scheduledAt) return false;
      if (activeTab === "published" && post.status !== "published") return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const match =
          post.title.toLowerCase().includes(q) ||
          post.slug.toLowerCase().includes(q) ||
          post.description.toLowerCase().includes(q) ||
          post.tags.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [posts, activeTab, query]);

  // Active post for editor
  const activePost =
    posts.find((p) => p.slug === selectedSlug) ||
    filteredPosts[0] ||
    posts[0];
  const activeIndex = posts.findIndex((p) => p.slug === activePost?.slug);

  // Bulk selection helpers
  const toggleSelectAll = () => {
    if (batchSelected.size === filteredPosts.length) {
      setBatchSelected(new Set());
    } else {
      setBatchSelected(new Set(filteredPosts.map((p) => p.slug)));
    }
  };

  const toggleSelectPost = (slug: string) => {
    const next = new Set(batchSelected);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setBatchSelected(next);
  };

  // Content update helpers
  const setPosts = React.useCallback(
    (next: SiteContent["posts"]) => {
      updateContent((curr) => ({ ...curr, posts: next }));
    },
    [updateContent],
  );

  const updateActivePost = React.useCallback(
    (patch: Partial<BlogPost>) => {
      if (!activePost) return;
      setPosts(
        posts.map((item) =>
          item.slug === activePost.slug ? { ...item, ...patch } : item,
        ),
      );
    },
    [activePost, posts, setPosts],
  );

  // Add new article
  const addArticle = () => {
    const now = new Date().toISOString();
    const newSlug = `new-article-${posts.length + 1}`;
    const newPost: BlogPost = {
      slug: newSlug,
      title: "New article",
      description: "Brief summary of the article for listings and previews.",
      status: "draft",
      origin: "author",
      reviewRequired: false,
      updatedAt: now,
      readingMinutes: 3,
      tags: ["engineering", "architecture"],
      body: [{ type: "p", text: "Start drafting article content here." }],
    };
    setPosts([...posts, newPost]);
    setSelectedSlug(newSlug);
  };

  // Safe publishing single article (enforces review gate)
  const handleTogglePublish = (post: BlogPost) => {
    if (post.status === "draft") {
      if (post.reviewRequired) {
        setWarningMessage(
          `Cannot publish "${post.title}": This article is an unreviewed draft fixture. Review and approve it before publishing.`,
        );
        return;
      }
      // Set to published with current timestamp if none exists
      const now = new Date().toISOString();
      const updated = posts.map((p) =>
        p.slug === post.slug
          ? {
              ...p,
              status: "published" as const,
              publishedAt: p.publishedAt || now,
              updatedAt: now,
            }
          : p,
      );
      setPosts(updated);
      setWarningMessage(null);
    } else {
      // Unpublish to draft
      const updated = posts.map((p) =>
        p.slug === post.slug ? { ...p, status: "draft" as const } : p,
      );
      setPosts(updated);
    }
  };

  // Batch publish selected
  const handleBatchPublish = () => {
    const selectedPosts = posts.filter((p) => batchSelected.has(p.slug));
    const unreviewed = selectedPosts.filter((p) => p.reviewRequired);

    if (unreviewed.length > 0) {
      setWarningMessage(
        `Cannot batch publish: ${unreviewed.length} of the selected articles require author review (${unreviewed.map((p) => p.title).join(", ")}). Mark them as reviewed first.`,
      );
      return;
    }

    const now = new Date().toISOString();
    const updated = posts.map((p) => {
      if (batchSelected.has(p.slug)) {
        return {
          ...p,
          status: "published" as const,
          publishedAt: p.publishedAt || now,
          updatedAt: now,
        };
      }
      return p;
    });
    setPosts(updated);
    setBatchSelected(new Set());
    setWarningMessage(null);
  };

  // Batch unpublish to draft
  const handleBatchUnpublish = () => {
    const updated = posts.map((p) => {
      if (batchSelected.has(p.slug)) {
        return { ...p, status: "draft" as const };
      }
      return p;
    });
    setPosts(updated);
    setBatchSelected(new Set());
  };

  // Batch mark reviewed
  const handleBatchMarkReviewed = () => {
    const updated = posts.map((p) => {
      if (batchSelected.has(p.slug)) {
        return { ...p, reviewRequired: false, origin: "author" as const };
      }
      return p;
    });
    setPosts(updated);
    setWarningMessage(null);
  };

  // Approve single review required post
  const handleApproveReview = (slug: string) => {
    const updated = posts.map((p) =>
      p.slug === slug
        ? { ...p, reviewRequired: false, origin: "author" as const }
        : p,
    );
    setPosts(updated);
    setWarningMessage(null);
  };

  // Block management inside active post
  const updateBlock = (blockIndex: number, block: BlogBlock) => {
    if (!activePost) return;
    const nextBody = activePost.body.map((item, i) =>
      i === blockIndex ? block : item,
    );
    updateActivePost({ body: nextBody });
  };

  const addBlock = (type: BlogBlock["type"]) => {
    if (!activePost) return;
    const newBlock: BlogBlock =
      type === "list"
        ? { type: "list", items: ["New list item"], ordered: false }
        : type === "code"
          ? { type: "code", language: "tsx", code: "// Code snippet" }
          : type === "h2"
            ? { type: "h2", text: "Subheading" }
            : type === "h3"
              ? { type: "h3", text: "Section title" }
              : type === "quote"
                ? { type: "quote", text: "Key insight or takeaway" }
                : { type: "p", text: "Paragraph text here." };

    updateActivePost({ body: [...activePost.body, newBlock] });
  };

  const moveBlock = (blockIndex: number, direction: "up" | "down") => {
    if (!activePost) return;
    const target = direction === "up" ? blockIndex - 1 : blockIndex + 1;
    if (target < 0 || target >= activePost.body.length) return;
    const nextBody = [...activePost.body];
    const temp = nextBody[blockIndex];
    nextBody[blockIndex] = nextBody[target];
    nextBody[target] = temp;
    updateActivePost({ body: nextBody });
  };

  const deleteBlock = (blockIndex: number) => {
    if (!activePost) return;
    const nextBody = activePost.body.filter((_, i) => i !== blockIndex);
    updateActivePost({ body: nextBody });
  };

  return (
    <div className="space-y-6">
      {/* Top Heading & Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          eyebrow="Content / Technical Writing"
          title="Articles & Blog Management"
          description="Manage technical case studies, block content, author reviews, batch publishing, and scheduling."
        />
        <button
          type="button"
          onClick={addArticle}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky/30 bg-sky/15 px-4 text-xs font-semibold text-sky-200 transition hover:bg-sky/25"
        >
          <Plus className="size-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist">
            Total Articles
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-snow">
            {posts.length}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Published
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-300">
            {publishedCount}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Needs Review
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-300">
            {reviewCount}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
            Scheduled
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-sky-300">
            {scheduledCount}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist">
            Drafts
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-mist">
            {draftsCount}
          </div>
        </div>
      </div>

      {/* Safety Gate Warning Banner */}
      {warningMessage && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold">Review Gate Warning: </span>
              {warningMessage}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWarningMessage(null)}
            className="text-amber-400 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Main Workspace: Left Article List & Tabs, Right Article & Block Editor */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
        {/* Left: 5 Tabbed Views, Search & Batch Selection */}
        <NotchedPanel className="p-5">
          {/* Tab Bar */}
          <div className="mb-4 flex flex-wrap gap-1.5 rounded-lg border border-white/10 bg-night p-1">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                activeTab === "all"
                  ? "bg-white/15 text-white"
                  : "text-mist hover:text-snow"
              }`}
            >
              All ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("drafts")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                activeTab === "drafts"
                  ? "bg-white/15 text-white"
                  : "text-mist hover:text-snow"
              }`}
            >
              Drafts ({draftsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                activeTab === "review"
                  ? "bg-amber-500/20 text-amber-200"
                  : "text-mist hover:text-snow"
              }`}
            >
              Needs Review ({reviewCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("scheduled")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                activeTab === "scheduled"
                  ? "bg-sky/20 text-sky-200"
                  : "text-mist hover:text-snow"
              }`}
            >
              Scheduled ({scheduledCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("published")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                activeTab === "published"
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "text-mist hover:text-snow"
              }`}
            >
              Published ({publishedCount})
            </button>
          </div>

          {/* Search Bar & Select All */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-mist hover:text-snow">
              <input
                type="checkbox"
                checked={
                  filteredPosts.length > 0 &&
                  batchSelected.size === filteredPosts.length
                }
                onChange={toggleSelectAll}
                className="size-3.5 rounded accent-sky"
              />
              <span>Select all in view</span>
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-mist" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="h-8 w-44 rounded-lg border border-white/10 bg-night-2 pl-8 pr-3 text-xs text-snow placeholder-mist/60 focus:border-sky/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Batch Actions Toolbar (Visible when items selected) */}
          {batchSelected.size > 0 && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky/30 bg-sky/[0.08] p-2.5">
              <span className="text-xs font-semibold text-sky-200">
                {batchSelected.size} selected
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleBatchPublish}
                  className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30"
                >
                  Publish Selected
                </button>
                <button
                  type="button"
                  onClick={handleBatchUnpublish}
                  className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-snow hover:bg-white/15"
                >
                  Set to Draft
                </button>
                <button
                  type="button"
                  onClick={handleBatchMarkReviewed}
                  className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/30"
                >
                  Mark Reviewed
                </button>
                <button
                  type="button"
                  onClick={() => setBatchSelected(new Set())}
                  className="text-xs text-mist hover:text-white px-1"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Article List */}
          <div className="space-y-2">
            {filteredPosts.map((post) => {
              const isSelected = post.slug === activePost?.slug;
              const isChecked = batchSelected.has(post.slug);

              return (
                <div
                  key={post.slug}
                  className={`group relative flex flex-col gap-2.5 rounded-xl border p-3.5 transition ${
                    isSelected
                      ? "border-sky/50 bg-sky/[0.07] shadow-[0_4px_20px_-8px_rgba(56,189,248,0.25)]"
                      : "border-white/10 bg-night-2 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectPost(post.slug)}
                        className="mt-1 size-3.5 rounded accent-sky"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedSlug(post.slug)}
                        className="flex min-w-0 flex-col text-left focus:outline-none"
                      >
                        <span className="truncate text-sm font-semibold text-snow group-hover:text-white">
                          {post.title || "Untitled Article"}
                        </span>
                        <span className="truncate text-xs text-mist">
                          /{post.slug} · {post.readingMinutes} min read
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusPill
                        tone={
                          post.status === "published" ? "success" : "warning"
                        }
                      >
                        {post.status}
                      </StatusPill>
                      <button
                        type="button"
                        onClick={() => setSelectedSlug(post.slug)}
                        className={`rounded-lg border px-2 py-0.5 text-xs font-medium transition ${
                          isSelected
                            ? "border-sky/40 bg-sky/20 text-sky"
                            : "border-white/10 bg-white/5 text-snow hover:border-white/20"
                        }`}
                      >
                        {isSelected ? "Editing" : "Edit"}
                      </button>
                    </div>
                  </div>

                  {/* Metadata and review badges row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {post.reviewRequired && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                        <AlertTriangle className="size-3" />
                        Needs Review
                      </span>
                    )}

                    {post.scheduledAt && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky/30 bg-sky/15 px-2 py-0.5 text-[11px] font-medium text-sky-200">
                        <Calendar className="size-3" />
                        Scheduled
                      </span>
                    )}

                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-mist"
                      >
                        {tag}
                      </span>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                      <a
                        href={`/dashboard/preview/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-mist hover:text-sky"
                        title="Preview article"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-mist">
                No articles match this view or search filter.
              </div>
            )}
          </div>
        </NotchedPanel>

        {/* Right: Detailed Article Editor with Safety Gate & Block Editor */}
        {activePost ? (
          <NotchedPanel className="p-5 sm:p-7">
            {/* Action Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                  Article Editor
                </div>
                <div className="mt-1 text-lg font-bold text-snow">
                  {activePost.title || "Untitled Article"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  tone={
                    activePost.status === "published" ? "success" : "warning"
                  }
                >
                  {activePost.status}
                </StatusPill>

                {/* Safe publish button */}
                <button
                  type="button"
                  onClick={() => handleTogglePublish(activePost)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    activePost.status === "published"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
                      : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                  }`}
                >
                  {activePost.status === "published"
                    ? "Unpublish to Draft"
                    : "Publish Article"}
                </button>

                <a
                  className={buttonSecondary}
                  href={`/dashboard/preview/blog/${activePost.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-3.5" /> Preview
                </a>

                <button
                  type="button"
                  className={buttonDanger}
                  onClick={() => {
                    if (activeIndex >= 0) deleteItem("posts", activeIndex);
                  }}
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </div>

            {/* Review Gate Alert Banner */}
            {activePost.reviewRequired && (
              <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-400" />
                    <div>
                      <div className="text-xs font-semibold text-amber-200">
                        Review Gate Active
                      </div>
                      <div className="mt-0.5 text-xs text-amber-200/80 leading-relaxed">
                        This article was imported from an initial draft fixture.
                        Publishing is gated until you verify and approve the
                        content.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApproveReview(activePost.slug)}
                    className="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-night hover:bg-amber-300"
                  >
                    Approve & Authorize Publishing
                  </button>
                </div>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Title"
                value={activePost.title}
                onChange={(value) => updateActivePost({ title: value })}
              />
              <TextField
                label="Slug"
                value={activePost.slug}
                onChange={(value) => updateActivePost({ slug: value })}
                help="Lowercase kebab-case slug; used in public URL."
              />
              <div className="sm:col-span-2">
                <TextField
                  label="Description"
                  value={activePost.description}
                  onChange={(value) => updateActivePost({ description: value })}
                  multiline
                  help="Summary displayed on blog index and meta descriptions."
                />
              </div>

              {/* Cover Image */}
              <div className="sm:col-span-2">
                <TextField
                  label="Cover Image URL (optional)"
                  value={activePost.coverImage || ""}
                  onChange={(value) =>
                    updateActivePost({ coverImage: value || undefined })
                  }
                  placeholder="https://... or /images/..."
                  help="Optional hero banner image displayed at the top of the article."
                />
              </div>

              {/* Schedule and Publication Dates */}
              <TextField
                label="Scheduled At (optional)"
                type="datetime-local"
                value={formatDateTimeLocal(activePost.scheduledAt)}
                onChange={(value) =>
                  updateActivePost({
                    scheduledAt: value
                      ? new Date(value).toISOString()
                      : undefined,
                  })
                }
                help="Target publication time for scheduled release."
              />

              <TextField
                label="Published At"
                type="datetime-local"
                value={formatDateTimeLocal(activePost.publishedAt)}
                onChange={(value) =>
                  updateActivePost({
                    publishedAt: value
                      ? new Date(value).toISOString()
                      : undefined,
                  })
                }
                help="Required when published. Stamped automatically on publish."
              />

              <TextField
                label="Reading Minutes"
                type="number"
                value={String(activePost.readingMinutes)}
                onChange={(value) =>
                  updateActivePost({
                    readingMinutes: Math.max(1, parseInt(value, 10) || 1),
                  })
                }
              />

              <TextField
                label="Tags (comma-separated)"
                value={activePost.tags.join(", ")}
                onChange={(value) =>
                  updateActivePost({
                    tags: value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            {/* Review Required Checkbox & Status */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <BooleanField
                label="Review required gate"
                value={activePost.reviewRequired}
                onChange={(value) =>
                  updateActivePost({
                    reviewRequired: value,
                    origin: value ? "initial-draft" : "author",
                  })
                }
                help="When enabled, prevents premature publication until approved."
              />

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-mist">
                  Publication Status
                </span>
                <select
                  className={fieldClass}
                  value={activePost.status}
                  onChange={(event) =>
                    updateActivePost({
                      status: event.target.value as BlogPost["status"],
                    })
                  }
                >
                  <option value="draft">Draft (keep private)</option>
                  <option value="published">
                    Published (visible after publish)
                  </option>
                </select>
                <FieldHelp>
                  Saving records this into your draft. Use Publish to put live.
                </FieldHelp>
              </label>
            </div>

            {/* Structured Body Blocks */}
            <div className="mt-8 border-t border-white/[0.08] pt-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                    Structured Content
                  </div>
                  <h3 className="mt-1 text-base font-bold text-snow">
                    Article Blocks ({activePost.body.length})
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[11px] text-mist">Add block:</span>
                  {(["p", "h2", "h3", "quote", "list", "code"] as const).map(
                    (type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => addBlock(type)}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-snow hover:border-sky/40 hover:text-sky"
                      >
                        +{type}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Blocks List */}
              <div className="space-y-3">
                {activePost.body.map((block, idx) => (
                  <div
                    key={`${block.type}-${idx}`}
                    className="rounded-xl border border-white/10 bg-night-2 p-4 transition hover:border-white/20"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold uppercase text-sky">
                        [{block.type}] Block #{idx + 1}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveBlock(idx, "up")}
                          className="rounded p-1 text-mist hover:text-white disabled:opacity-20"
                          title="Move block up"
                        >
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === activePost.body.length - 1}
                          onClick={() => moveBlock(idx, "down")}
                          className="rounded p-1 text-mist hover:text-white disabled:opacity-20"
                          title="Move block down"
                        >
                          <ArrowDown className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBlock(idx)}
                          className="rounded p-1 text-mist hover:text-red-400"
                          title="Delete block"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Block inputs based on type */}
                    {block.type === "list" ? (
                      <div className="space-y-3">
                        <BooleanField
                          label="Ordered list (numbered)"
                          value={Boolean(block.ordered)}
                          onChange={(val) =>
                            updateBlock(idx, { ...block, ordered: val })
                          }
                        />
                        <ArrayEditor
                          value={block.items}
                          path={["posts", activeIndex, "body", idx, "items"]}
                          label="List items"
                          update={(_, val) =>
                            updateBlock(idx, {
                              ...block,
                              items: val as string[],
                            })
                          }
                        />
                      </div>
                    ) : block.type === "code" ? (
                      <div className="space-y-3">
                        <TextField
                          label="Language"
                          value={block.language}
                          onChange={(val) =>
                            updateBlock(idx, { ...block, language: val })
                          }
                          placeholder="tsx, js, python, bash, sql..."
                        />
                        <TextField
                          label="Code"
                          multiline
                          value={block.code}
                          onChange={(val) =>
                            updateBlock(idx, { ...block, code: val })
                          }
                        />
                      </div>
                    ) : (
                      <TextField
                        label={
                          block.type === "p"
                            ? "Paragraph Text"
                            : block.type === "h2"
                              ? "H2 Heading Text"
                              : block.type === "h3"
                                ? "H3 Subheading Text"
                                : "Quote Text"
                        }
                        multiline={block.type === "p" || block.type === "quote"}
                        value={block.text}
                        onChange={(val) =>
                          updateBlock(idx, { ...block, text: val })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </NotchedPanel>
        ) : (
          <NotchedPanel className="p-8 text-center text-mist">
            Select an article from the left list to view and edit its content.
          </NotchedPanel>
        )}
      </div>
    </div>
  );
}
