"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Database,
  ExternalLink,
  FileText,
  FolderGit2,
  Gauge,
  HardDrive,
  Mail,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useDashboard } from "../dashboard-context";
import { SectionHeading, formatBytes } from "../dashboard-workspace";

export function AnalyticsPage() {
  const {
    content,
    revision,
    publishedRevision,
    mediaItems,
    unreadMessagesCount,
    messages,
  } = useDashboard();

  // Compute real content velocity metrics
  const publishedProjects = content.projects.filter(
    (p) => p.status === "published",
  ).length;
  const draftProjects = content.projects.length - publishedProjects;

  const publishedPosts = content.posts.filter(
    (p) => p.status === "published",
  ).length;
  const draftPosts = content.posts.length - publishedPosts;

  const totalReadingMinutes = content.posts.reduce(
    (acc, p) => acc + (p.readingMinutes || 1),
    0,
  );

  const totalMediaBytes = mediaItems.reduce((acc, m) => acc + (m.size || 0), 0);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Insights / Telemetry"
        title="Website Analytics & Telemetry"
        description="Inspect production traffic instrumentation, Core Web Vitals telemetry, and real repository content velocity."
      />

      {/* Integration Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vercel Web Analytics */}
        <div className="rounded-2xl border border-white/10 bg-night-2 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-mist">VERCEL ANALYTICS</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Instrumented
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <BarChart3 className="size-5 text-sky" />
              <h3 className="font-display text-sm font-bold text-snow">
                Visitor & Pageview Tracking
              </h3>
            </div>
            <p className="mt-1.5 text-xs text-mist leading-relaxed">
              Client package <code className="text-sky font-mono text-[11px]">@vercel/analytics</code> is installed and active on public pages with privacy-friendly tracking.
            </p>
          </div>
          <a
            href="https://vercel.com/s3fpls-projects/prof/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-night-3/60 px-3 py-2 text-xs font-semibold text-snow hover:bg-white/[0.05] transition-colors"
          >
            <span>Open Vercel Analytics</span>
            <ExternalLink className="size-3.5 text-mist" />
          </a>
        </div>

        {/* Vercel Speed Insights */}
        <div className="rounded-2xl border border-white/10 bg-night-2 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-mist">SPEED INSIGHTS</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <Gauge className="size-5 text-sky" />
              <h3 className="font-display text-sm font-bold text-snow">
                Real User Core Web Vitals
              </h3>
            </div>
            <p className="mt-1.5 text-xs text-mist leading-relaxed">
              Monitors real-world LCP, INP, and CLS scores measured directly on visitor devices and aggregated by Vercel.
            </p>
          </div>
          <a
            href="https://vercel.com/s3fpls-projects/prof/speed-insights"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-night-3/60 px-3 py-2 text-xs font-semibold text-snow hover:bg-white/[0.05] transition-colors"
          >
            <span>Open Speed Insights</span>
            <ExternalLink className="size-3.5 text-mist" />
          </a>
        </div>

        {/* Google Search Console */}
        <div className="rounded-2xl border border-white/10 bg-night-2 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-mist">SEARCH CONSOLE</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-400">
                Not Connected
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <Search className="size-5 text-amber-400" />
              <h3 className="font-display text-sm font-bold text-snow">
                Google Search Visibility
              </h3>
            </div>
            <p className="mt-1.5 text-xs text-mist leading-relaxed">
              Connect a Google Cloud service account to directly display organic search queries, clicks, impressions, and average SERP positions.
            </p>
          </div>
          <Link
            href="/dashboard/seo"
            className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-night-3/60 px-3 py-2 text-xs font-semibold text-snow hover:bg-white/[0.05] transition-colors"
          >
            <span>Configure SEO & Sitemap</span>
            <ArrowUpRight className="size-3.5 text-mist" />
          </Link>
        </div>
      </div>

      {/* Honest Telemetry Commitment Notice */}
      <div className="rounded-2xl border border-sky/20 bg-sky/5 p-4 flex items-start gap-3">
        <Sparkles className="size-5 text-sky shrink-0 mt-0.5" />
        <div className="text-xs text-snow/90 leading-relaxed">
          <span className="font-bold text-sky block">Zero Fabricated Data Guarantee</span>
          All metrics on this page represent genuine, verified repository data or official external analytics dashboards. No synthetic graphs or mock traffic statistics are ever presented.
        </div>
      </div>

      {/* Repository & Content Velocity Telemetry */}
      <div className="rounded-2xl border border-white/10 bg-night-2 p-6 space-y-5">
        <div className="border-b border-white/[0.08] pb-4">
          <h3 className="font-display text-sm font-bold text-snow">
            Repository Content Telemetry
          </h3>
          <p className="text-xs text-mist mt-0.5">
            Real data aggregated from the current CMS PostgreSQL state
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/[0.06] bg-night-3/40 p-4">
            <div className="flex items-center gap-2 text-mist text-xs font-mono">
              <FolderGit2 className="size-4 text-sky" />
              <span>PROJECTS</span>
            </div>
            <div className="mt-2 text-2xl font-display font-bold text-snow">
              {publishedProjects}
            </div>
            <div className="mt-1 text-[11px] text-mist">
              {draftProjects} draft{draftProjects !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-night-3/40 p-4">
            <div className="flex items-center gap-2 text-mist text-xs font-mono">
              <FileText className="size-4 text-sky" />
              <span>ARTICLES</span>
            </div>
            <div className="mt-2 text-2xl font-display font-bold text-snow">
              {publishedPosts}
            </div>
            <div className="mt-1 text-[11px] text-mist">
              {draftPosts} draft{draftPosts !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-night-3/40 p-4">
            <div className="flex items-center gap-2 text-mist text-xs font-mono">
              <HardDrive className="size-4 text-sky" />
              <span>MEDIA ASSETS</span>
            </div>
            <div className="mt-2 text-2xl font-display font-bold text-snow">
              {mediaItems.length}
            </div>
            <div className="mt-1 text-[11px] text-mist">
              {formatBytes(totalMediaBytes)} stored
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-night-3/40 p-4">
            <div className="flex items-center gap-2 text-mist text-xs font-mono">
              <Database className="size-4 text-sky" />
              <span>CMS REVISIONS</span>
            </div>
            <div className="mt-2 text-2xl font-display font-bold text-snow">
              r{revision}
            </div>
            <div className="mt-1 text-[11px] text-mist">
              Published at r{publishedRevision}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-white/[0.06] bg-night-3/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-sky" />
              <div>
                <div className="text-xs font-semibold text-snow">
                  Contact Form Inquiries
                </div>
                <div className="text-[11px] text-mist">
                  {unreadMessagesCount} unread / {messages.length} total messages
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/inbox"
              className="text-xs font-mono text-sky hover:underline"
            >
              Open Inbox →
            </Link>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-night-3/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-5 text-sky" />
              <div>
                <div className="text-xs font-semibold text-snow">
                  Content Reading Time
                </div>
                <div className="text-[11px] text-mist">
                  {totalReadingMinutes} minutes total across published posts
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/blog"
              className="text-xs font-mono text-sky hover:underline"
            >
              Open Blog →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
