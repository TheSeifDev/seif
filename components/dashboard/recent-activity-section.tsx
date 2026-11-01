"use client";

import * as React from "react";
import {
  GitCommit,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { darkCard } from "@/lib/ui/layout";
import type { SiteContent } from "@/lib/cms/schema";
import type { InboxMessage, RevisionItem } from "./dashboard-types";

type RecentActivitySectionProps = {
  content: SiteContent;
  revisions: RevisionItem[];
  messages: InboxMessage[];
  currentRevision: number;
  publishedRevision: number;
  onRestoreRevision: (item: RevisionItem) => void;
  restoringRevisionId: string | null;
  onRefreshRevisions: () => void;
};

type ActivityFilter = "all" | "revisions" | "messages" | "articles";

export function RecentActivitySection({
  content,
  revisions,
  messages,
  currentRevision,
  publishedRevision,
  onRestoreRevision,
  restoringRevisionId,
  onRefreshRevisions,
}: RecentActivitySectionProps) {
  const [filter, setFilter] = React.useState<ActivityFilter>("all");

  // Merge real activity records
  type ActivityEntry = {
    id: string;
    type: "revision" | "message" | "article";
    title: string;
    description: string;
    date: Date;
    badge: string;
    badgeTone: "success" | "warning" | "sky" | "neutral";
    rawRevision?: RevisionItem;
  };

  const entries: ActivityEntry[] = [];

  // Add revisions
  revisions.forEach((rev) => {
    const isLive = rev.revision === publishedRevision;
    const isCurrent = rev.revision === currentRevision;
    entries.push({
      id: `rev-${rev.id}`,
      type: "revision",
      title: `Revision #${rev.revision} ${rev.kind ? `(${rev.kind})` : ""}`,
      description: isLive
        ? "Currently served live to public visitors."
        : isCurrent
          ? "Current active working draft."
          : "Historical content revision stored in database.",
      date: new Date(rev.createdAt),
      badge: isLive ? "LIVE" : isCurrent ? "WORKING" : "SNAPSHOT",
      badgeTone: isLive ? "success" : isCurrent ? "sky" : "neutral",
      rawRevision: rev,
    });
  });

  // Add messages
  messages.forEach((msg) => {
    entries.push({
      id: `msg-${msg.id}`,
      type: "message",
      title: `Inquiry: ${msg.subject || "Message from client"}`,
      description: `From ${msg.name || "Anonymous"} ${msg.email ? `(${msg.email})` : ""} · ${msg.status || "new"}`,
      date: new Date(msg.createdAt || "1970-01-01T00:00:00.000Z"),
      badge: (msg.status || "NEW").toUpperCase(),
      badgeTone: msg.status === "read" ? "neutral" : "sky",
    });
  });

  // Add article updates
  content.posts.forEach((post) => {
    entries.push({
      id: `post-${post.slug}`,
      type: "article",
      title: `Article: ${post.title}`,
      description: `Status: ${post.status} · ${post.readingMinutes} min read · Tags: ${post.tags.slice(0, 3).join(", ")}`,
      date: new Date(post.updatedAt || post.publishedAt || "1970-01-01T00:00:00.000Z"),
      badge: post.status.toUpperCase(),
      badgeTone: post.status === "published" ? "success" : "warning",
    });
  });

  // Sort chronologically newest first
  const sortedEntries = entries
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .filter((entry) => {
      if (filter === "all") return true;
      if (filter === "revisions") return entry.type === "revision";
      if (filter === "messages") return entry.type === "message";
      if (filter === "articles") return entry.type === "article";
      return true;
    });

  return (
    <section id="activity" className="scroll-mt-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-6 border-b border-white/[0.08] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-sky shadow-[0_0_0_4px_rgba(77,182,255,0.18)]"
            />
            <span>● 05 ——— RECENT ACTIVITY</span>
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-snow">
            Audit Trail & History
          </h2>
          <p className="mt-1 text-sm text-mist max-w-2xl">
            Live chronological timeline of database revision states, incoming client inquiries, and article updates.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "revisions", "messages", "articles"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors",
                filter === tab
                  ? "bg-white/[0.1] text-snow border border-sky/30 shadow-sm"
                  : "text-mist hover:text-snow hover:bg-white/[0.03] border border-transparent",
              )}
            >
              {tab}
            </button>
          ))}

          <button
            type="button"
            onClick={onRefreshRevisions}
            title="Refresh Revisions & Activity"
            className="inline-flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-mist hover:text-snow transition-colors"
          >
            <RefreshCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className={cn(darkCard, "p-6 sm:p-8 relative overflow-hidden shadow-sm")}>
        {sortedEntries.length === 0 ? (
          <div className="py-12 text-center text-sm text-mist">
            No activity matches the selected filter.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-white/[0.1]">
            {sortedEntries.slice(0, 15).map((entry) => (
              <div key={entry.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[30px] sm:-left-[38px] top-1.5 flex size-4 items-center justify-center rounded-full bg-night border border-white/20 group-hover:border-sky transition-colors">
                  <div
                    className={cn(
                      "size-1.5 rounded-full",
                      entry.badgeTone === "success"
                        ? "bg-emerald-400"
                        : entry.badgeTone === "sky"
                          ? "bg-sky"
                          : entry.badgeTone === "warning"
                            ? "bg-amber-400"
                            : "bg-white/40",
                    )}
                  />
                </div>

                {/* Entry content card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-night-3/70 p-4 hover:border-white/15 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-mist">
                        {isNaN(entry.date.getTime())
                          ? "Recent"
                          : entry.date.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                      </span>
                      <span className="text-white/20">·</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider border",
                          entry.badgeTone === "success" &&
                            "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                          entry.badgeTone === "sky" &&
                            "border-sky/30 bg-sky/10 text-sky",
                          entry.badgeTone === "warning" &&
                            "border-amber-500/30 bg-amber-500/10 text-amber-300",
                          entry.badgeTone === "neutral" &&
                            "border-white/10 bg-white/[0.04] text-mist",
                        )}
                      >
                        {entry.badge}
                      </span>
                    </div>

                    <div className="mt-1 font-display text-sm font-bold text-snow">
                      {entry.title}
                    </div>
                    <div className="mt-0.5 text-xs text-mist truncate">
                      {entry.description}
                    </div>
                  </div>

                  {/* Optional Quick Action: Restore Revision */}
                  {entry.rawRevision && (
                    <div className="shrink-0 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => onRestoreRevision(entry.rawRevision!)}
                        disabled={
                          restoringRevisionId === entry.rawRevision.id ||
                          entry.rawRevision.revision === currentRevision
                        }
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                          entry.rawRevision.revision === currentRevision
                            ? "border-white/10 bg-white/[0.03] text-mist"
                            : "border-white/15 bg-white/[0.04] text-snow hover:border-sky/50 hover:text-sky",
                        )}
                      >
                        {restoringRevisionId === entry.rawRevision.id ? (
                          <RefreshCcw className="size-3 animate-spin" />
                        ) : (
                          <GitCommit className="size-3" />
                        )}
                        <span>
                          {entry.rawRevision.revision === currentRevision
                            ? "Current Draft"
                            : "Restore as draft"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
