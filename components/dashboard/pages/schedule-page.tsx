"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";
import { useDashboard, useNow } from "../dashboard-context";
import { SectionHeading, formatDate } from "../dashboard-workspace";

export function SchedulePage() {
  const { content } = useDashboard();
  const now = useNow();

  // Find posts scheduled for future release
  const scheduledPosts = React.useMemo(() => {
    if (!now) return [];
    return content.posts
      .filter(
        (p) =>
          p.status === "published" &&
          p.publishedAt &&
          new Date(p.publishedAt).getTime() > now,
      )
      .sort(
        (a, b) =>
          new Date(a.publishedAt || 0).getTime() -
          new Date(b.publishedAt || 0).getTime(),
      );
  }, [content.posts, now]);

  // Find drafts that are review-ready or queued
  const draftPosts = React.useMemo(() => {
    return content.posts.filter((p) => p.status === "draft");
  }, [content.posts]);

  const nextPost = scheduledPosts[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Operations / Content Calendar"
          title="Publish Schedule"
          description="Inspect scheduled content, manage publication queues, and verify edge propagation timings."
        />
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center gap-2 rounded-xl bg-sky px-4 py-2.5 text-xs font-semibold text-night shadow-md hover:bg-sky/90 transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Schedule an Article</span>
        </Link>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-night-2 p-5 shadow-sm">
          <div className="flex items-center justify-between text-mist text-xs font-mono">
            <span>SCHEDULED QUEUE</span>
            <Calendar className="size-4 text-sky" />
          </div>
          <div className="mt-2 text-3xl font-display font-bold text-snow">
            {scheduledPosts.length}
          </div>
          <p className="mt-1 text-xs text-mist">
            Articles queued with future publication dates
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-night-2 p-5 shadow-sm">
          <div className="flex items-center justify-between text-mist text-xs font-mono">
            <span>NEXT PUBLICATION</span>
            <Clock className="size-4 text-sky" />
          </div>
          <div className="mt-2 text-sm font-semibold text-snow truncate">
            {nextPost?.publishedAt
              ? formatDate(nextPost.publishedAt)
              : "No upcoming articles"}
          </div>
          <p className="mt-1 text-xs text-mist truncate">
            {nextPost ? nextPost.title : "Queue is currently clear"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-night-2 p-5 shadow-sm">
          <div className="flex items-center justify-between text-mist text-xs font-mono">
            <span>PIPELINE ENGINE</span>
            <Radio className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>60s Edge ISR Active</span>
          </div>
          <p className="mt-1 text-xs text-mist">
            Timezone baseline: Africa/Cairo (UTC+2)
          </p>
        </div>
      </div>

      {/* Architecture Notice */}
      <div className="rounded-2xl border border-white/[0.08] bg-night-2/70 p-5 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-sky shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-mist leading-relaxed">
            <span className="font-semibold text-snow block">
              How Zero-Latency Scheduling Works on Vercel Hobby
            </span>
            <p>
              Scheduled posts are stored with <code className="text-sky font-mono">status: &quot;published&quot;</code> and a future <code className="text-sky font-mono">publishedAt</code> timestamp. Public content APIs automatically filter out future-dated articles. Because public pages are configured with 60-second Incremental Static Regeneration (ISR), your articles appear automatically within 60 seconds of their publication timestamp without requiring minute-by-minute cron polling.
            </p>
          </div>
        </div>
      </div>

      {/* Scheduled Articles Section */}
      <div className="rounded-2xl border border-white/10 bg-night-2 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="font-display text-sm font-bold text-snow">
              Active Publication Queue
            </h3>
            <p className="text-xs text-mist mt-0.5">
              Articles that will go live at their scheduled timestamp
            </p>
          </div>
          <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 font-mono text-[11px] text-mist">
            {scheduledPosts.length} queued
          </span>
        </div>

        {scheduledPosts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Calendar className="size-8 text-mist/40 mx-auto" />
            <div className="text-sm font-medium text-snow">No articles scheduled</div>
            <p className="text-xs text-mist max-w-sm mx-auto">
              You do not have any future-dated articles queued. You can schedule articles directly from the Blog editor.
            </p>
            <Link
              href="/dashboard/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:underline pt-2"
            >
              <span>Manage Blog articles</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {scheduledPosts.map((post) => (
              <div
                key={post.slug}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-sky shrink-0" />
                    <span className="font-medium text-sm text-snow truncate">
                      {post.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-mist font-mono">
                    <span>/{post.slug}</span>
                    <span>•</span>
                    <span>{post.readingMinutes || 1} min read</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-sky font-mono">
                      {formatDate(post.publishedAt || "")}
                    </div>
                    <div className="text-[10px] text-mist">Auto-release</div>
                  </div>
                  <Link
                    href="/dashboard/blog"
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist hover:text-snow hover:bg-white/[0.05] transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drafts Awaiting Scheduling */}
      <div className="rounded-2xl border border-white/10 bg-night-2 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="font-display text-sm font-bold text-snow">
              Drafts in Progress
            </h3>
            <p className="text-xs text-mist mt-0.5">
              Unpublished drafts that can be scheduled or published
            </p>
          </div>
          <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 font-mono text-[11px] text-mist">
            {draftPosts.length} drafts
          </span>
        </div>

        {draftPosts.length === 0 ? (
          <div className="py-8 text-center text-xs text-mist">
            No draft articles currently in progress.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {draftPosts.slice(0, 5).map((post) => (
              <div
                key={post.slug}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-xs text-snow truncate">
                    {post.title}
                  </div>
                  <div className="text-[11px] text-mist font-mono">/{post.slug}</div>
                </div>
                <Link
                  href="/dashboard/blog"
                  className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-mist hover:text-snow hover:bg-white/[0.05] transition-colors shrink-0"
                >
                  Open in Editor
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

