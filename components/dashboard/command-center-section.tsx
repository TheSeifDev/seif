"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Download,
  GitBranch,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { darkCard } from "@/lib/ui/layout";
import type { SiteContent } from "@/lib/cms/schema";

type CommandCenterSectionProps = {
  content: SiteContent;
  savedContent: SiteContent;
  revision: number;
  publishedRevision: number;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  configured: boolean;
  unreadMessagesCount: number;
  onSave: () => void;
  onPublish: () => void;
  onDiscard: () => void;
  onDownloadBackup: () => void;
  publishTriggerRef?: React.RefObject<HTMLButtonElement | null>;
};

export function CommandCenterSection({
  content,
  revision,
  publishedRevision,
  dirty,
  saving,
  publishing,
  configured,
  unreadMessagesCount,
  onSave,
  onPublish,
  onDiscard,
  onDownloadBackup,
  publishTriggerRef,
}: CommandCenterSectionProps) {
  // Compute pending review articles
  const pendingReviewArticles = content.posts.filter(
    (p) => p.status === "draft" && p.reviewRequired,
  ).length;

  const unpublishedRevisions = revision - publishedRevision;

  return (
    <section id="command-center" className="scroll-mt-8 space-y-8">
      {/* Editorial Title Block */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-sky shadow-[0_0_0_4px_rgba(77,182,255,0.18)]"
            />
            <span>● 01 ——— COMMAND CENTER</span>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-snow">
            Control Center
          </h1>
          <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-mist max-w-2xl">
            Real-time synchronization, infrastructure readiness, and production deployment controls for Seif Ayman&apos;s portfolio.
          </p>
        </div>

        {/* Global Primary Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onDiscard}
            disabled={!dirty}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 text-[13px] font-semibold text-snow hover:border-sky/60 hover:text-sky transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCcw className="size-3.5" />
            <span>Discard</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving || !configured}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-snow px-5 text-[13px] font-semibold text-night hover:bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <RefreshCcw className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>{saving ? "Saving" : "Save"}</span>
          </button>

          <button
            ref={publishTriggerRef}
            type="button"
            onClick={onPublish}
            disabled={publishing || !configured}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-sky px-5 text-[13px] font-semibold text-night hover:bg-[#7cc9ff] shadow-[0_8px_24px_-12px_rgba(77,182,255,0.3)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {publishing ? (
              <RefreshCcw className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            <span>Publish</span>
          </button>

          <button
            type="button"
            onClick={onDownloadBackup}
            title="Download JSON Content Backup"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-mist hover:text-snow hover:border-white/30 transition-colors"
          >
            <Download className="size-4" />
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View Live Site"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-mist hover:text-snow hover:border-white/30 transition-colors"
          >
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>

      {/* Real-time Status Board */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Production Sync */}
        <div className={cn(darkCard, "p-6 relative overflow-hidden flex flex-col justify-between shadow-sm")}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
              Production Sync
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase",
                revision === publishedRevision
                  ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                  : "border border-amber-500/25 bg-amber-500/10 text-amber-300",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  revision === publishedRevision
                    ? "bg-emerald-400"
                    : "bg-amber-400 animate-pulse",
                )}
              />
              {revision === publishedRevision ? "Synchronized" : "Pending"}
            </span>
          </div>

          <div className="my-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-snow">
                #{publishedRevision}
              </span>
              <span className="text-xs text-mist font-mono">Live revision</span>
            </div>
            <p className="mt-1 text-xs text-mist leading-relaxed">
              {unpublishedRevisions > 0
                ? `${unpublishedRevisions} draft update(s) staged ahead of live visitors.`
                : "Live visitors receive the current verified revision."}
            </p>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-mist">
            <span>Working target</span>
            <span className="text-snow font-medium">#{revision}</span>
          </div>
        </div>

        {/* Card 2: Infrastructure */}
        <div className={cn(darkCard, "p-6 relative overflow-hidden flex flex-col justify-between shadow-sm")}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
              Infrastructure
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky/25 bg-sky/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-sky uppercase">
              <Database className="size-2.5" />
              <span>Neon Cloud</span>
            </span>
          </div>

          <div className="my-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-snow">
                8
              </span>
              <span className="text-xs text-mist font-mono">Database tables</span>
            </div>
            <p className="mt-1 text-xs text-mist leading-relaxed">
              Neon PostgreSQL serverless endpoint active with dynamic pooling.
            </p>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-mist">
            <span>Status</span>
            <span className="text-emerald-400 font-medium">Operational</span>
          </div>
        </div>

        {/* Card 3: Buffer Delta */}
        <div className={cn(darkCard, "p-6 relative overflow-hidden flex flex-col justify-between shadow-sm")}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
              Working Buffer
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase",
                dirty
                  ? "border border-amber-500/25 bg-amber-500/10 text-amber-300"
                  : "border border-white/10 bg-white/[0.03] text-mist",
              )}
            >
              <GitBranch className="size-2.5" />
              <span>{dirty ? "Unsaved" : "Clean"}</span>
            </span>
          </div>

          <div className="my-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-snow">
                {dirty ? "Modified" : "Saved"}
              </span>
            </div>
            <p className="mt-1 text-xs text-mist leading-relaxed">
              {dirty
                ? "Edits in browser memory. Click Save to persist to database."
                : "Working memory in sync with server draft."}
            </p>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-mist">
            <span>Auth control</span>
            <span className="text-snow font-medium">Strict Admin</span>
          </div>
        </div>

        {/* Card 4: Security Shield */}
        <div className={cn(darkCard, "p-6 relative overflow-hidden flex flex-col justify-between shadow-sm")}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
              Environment Guard
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 uppercase">
              <ShieldCheck className="size-2.5" />
              <span>Enforced</span>
            </span>
          </div>

          <div className="my-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-snow">
                100%
              </span>
              <span className="text-xs text-mist font-mono">Isolated</span>
            </div>
            <p className="mt-1 text-xs text-mist leading-relaxed">
              Strict Better Auth session cookies with cross-origin mutation blocks.
            </p>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-mist">
            <span>Protected APIs</span>
            <span className="text-sky font-medium">5 endpoints</span>
          </div>
        </div>
      </div>

      {/* Attention Center (What Needs Attention) */}
      <div className={cn(darkCard, "p-6 sm:p-7 relative overflow-hidden shadow-sm")}>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="size-4 text-sky" />
            <h2 className="font-display text-lg font-bold tracking-tight text-snow">
              Action & Attention Queue
            </h2>
          </div>
          <span className="font-mono text-[11px] text-mist">
            Priority Engine
          </span>
        </div>

        <div className="space-y-3">
          {unreadMessagesCount > 0 && (
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-sky/30 bg-sky/10 p-4">
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-sky mt-1.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-snow">
                    New Contact Inquiry ({unreadMessagesCount} unread)
                  </div>
                  <div className="mt-0.5 text-xs text-mist">
                    Prospective client messages are stored in your private inbox. Scroll down to Recent Activity or Content Hub to review.
                  </div>
                </div>
              </div>
              <a
                href="#activity"
                className="inline-flex h-8 shrink-0 items-center rounded-full border border-sky/40 bg-sky/20 px-3 text-[11px] font-semibold text-sky hover:bg-sky/30 transition-colors"
              >
                View message
              </a>
            </div>
          )}

          {pendingReviewArticles > 0 && (
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-4 text-amber-300 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-amber-200">
                    Draft Articles Pending Review ({pendingReviewArticles})
                  </div>
                  <div className="mt-0.5 text-xs text-amber-100/70">
                    One or more articles are flagged with review requirements before publishing to live readers.
                  </div>
                </div>
              </div>
              <a
                href="#content-hub"
                className="inline-flex h-8 shrink-0 items-center rounded-full border border-amber-500/40 bg-amber-500/20 px-3 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors"
              >
                Review posts
              </a>
            </div>
          )}

          {dirty && (
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <RefreshCcw className="size-4 text-amber-300 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-amber-200">
                    Unsaved Content Modifications
                  </div>
                  <div className="mt-0.5 text-xs text-amber-100/70">
                    Your working buffer contains changes that have not yet been saved to the PostgreSQL revision ledger.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="inline-flex h-8 shrink-0 items-center rounded-full bg-snow px-3 text-[11px] font-semibold text-night hover:bg-white transition-colors"
              >
                {saving ? "Saving…" : "Save draft now"}
              </button>
            </div>
          )}

          {unpublishedRevisions > 0 && !dirty && (
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-sky/30 bg-sky/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-sky mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-snow">
                    Working Revision #{revision} Staged
                  </div>
                  <div className="mt-0.5 text-xs text-mist">
                    Saved content is ready. Live visitors still see revision #{publishedRevision} until you publish.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onPublish}
                disabled={publishing}
                className="inline-flex h-8 shrink-0 items-center rounded-full bg-sky px-3 text-[11px] font-semibold text-night hover:bg-[#7cc9ff] transition-colors"
              >
                Publish to Live
              </button>
            </div>
          )}

          {!dirty && unpublishedRevisions === 0 && unreadMessagesCount === 0 && pendingReviewArticles === 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-200 text-xs">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>All systems nominal. Public website is synchronized and no items require immediate attention.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

