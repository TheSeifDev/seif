"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  FileText,
  FolderGit2,
  Globe,
  History,
  Image as ImageIcon,
  Mail,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  Settings2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./dashboard-context";
import { formatDate, formatBytes, StatusPill } from "./dashboard-workspace";
import { gsap, useGSAP, motionQueries } from "@/components/motion/gsap";

export function OverviewControlCenter() {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const {
    content,
    revision,
    publishedRevision,
    dirty,
    saving,
    publishing,
    configured,
    save,
    discard,
    openPublishModal,
    downloadBackup,
    restoreRevision,
    restoringRevisionId,
    revisions,
    messages,
    unreadMessagesCount,
    mediaItems,
  } = useDashboard();

  // Subtle GSAP entrance animation for dashboard cards
  useGSAP(
    () => {
      if (
        typeof window !== "undefined" &&
        window.matchMedia(motionQueries.motion).matches
      ) {
        gsap.fromTo(
          ".overview-card",
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.04,
            ease: "power2.out",
          },
        );
      }
    },
    { scope: containerRef },
  );

  // Compute real statistics from actual data
  const publishedProjects = content.projects.filter(
    (p) => p.status === "published",
  ).length;
  const draftProjects = content.projects.length - publishedProjects;
  const featuredProjects = content.projects.filter((p) => p.featured).length;

  const publishedPosts = content.posts.filter(
    (p) => p.status === "published",
  ).length;
  const draftPosts = content.posts.length - publishedPosts;
  const totalReadingMinutes = content.posts.reduce(
    (acc, p) => acc + (p.readingMinutes || 1),
    0,
  );

  const totalSkills = content.skillGroups.reduce(
    (acc, g) => acc + (g.skills?.length || 0),
    0,
  );
  const copyStringsCount = Object.keys(content.copy || {}).length;
  const totalMediaBytes = mediaItems.reduce((acc, m) => acc + (m.size || 0), 0);

  // Real publication ratio
  const totalPublishable = content.projects.length + content.posts.length;
  const totalPublished = publishedProjects + publishedPosts;
  const publishedRatio =
    totalPublishable > 0 ? Math.round((totalPublished / totalPublishable) * 100) : 100;

  // Real draft items for planning / schedule
  const draftItems = [
    ...content.projects
      .filter((p) => p.status === "draft")
      .map((p) => ({
        type: "Project" as const,
        title: p.title,
        category: p.category,
        href: "/dashboard/projects",
        date: p.domains?.join(", ") || "Case study",
      })),
    ...content.posts
      .filter((p) => p.status === "draft")
      .map((p) => ({
        type: "Article" as const,
        title: p.title,
        category: p.tags?.join(", ") || "Technical post",
        href: "/dashboard/blog",
        date: p.publishedAt ? formatDate(p.publishedAt) : "Draft",
      })),
  ];

  return (
    <div ref={containerRef} className="space-y-8">
      {/* 1. Header & Executive Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-sky">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-sky" />
            <span>EXECUTIVE COMMAND CENTER</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-snow">
            Overview
          </h1>
          <p className="mt-1 text-xs text-mist leading-relaxed max-w-2xl">
            Portfolio administration control center. Monitor publication telemetry,
            review real-time metrics, inspect scheduled releases, and manage site records.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {dirty && (
            <button
              type="button"
              onClick={discard}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-mist hover:text-snow hover:border-white/20 transition-all"
            >
              <RotateCcw className="size-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={downloadBackup}
            title="Download JSON backup snapshot"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-mist hover:text-snow hover:border-white/20 transition-all"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving || !configured}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl font-semibold text-xs bg-white text-night hover:bg-snow disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {saving ? (
              <RefreshCcw className="size-3.5 animate-spin text-night" />
            ) : (
              <Check className="size-3.5 text-night" />
            )}
            <span>{saving ? "Saving" : "Save draft"}</span>
          </button>

          <button
            type="button"
            onClick={openPublishModal}
            disabled={publishing || !configured}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl font-semibold text-xs bg-sky text-night hover:bg-[#7cc9ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_-4px_rgba(77,182,255,0.4)]"
          >
            {publishing ? (
              <RefreshCcw className="size-3.5 animate-spin text-night" />
            ) : (
              <Send className="size-3.5 text-night" />
            )}
            <span>Publish revision</span>
          </button>
        </div>
      </div>

      {/* 2. Site Status & Publishing State Hero */}
      <div className="overview-card rounded-3xl border border-white/[0.08] bg-night-2 p-6 sm:p-7 relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Production Live</span>
              </span>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-mist hover:text-sky transition-colors"
              >
                <span>theseif.vercel.app</span>
                <ArrowUpRight className="size-3" />
              </a>
            </div>

            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-snow">
                {dirty
                  ? "Unsaved modifications in memory"
                  : revision === publishedRevision
                    ? "Portfolio is fully synchronized with live public site"
                    : `Revision #${revision} is saved and ready for publication`}
              </h2>
              <p className="mt-1 text-xs text-mist leading-relaxed">
                {dirty
                  ? "You have draft changes that have not yet been saved to PostgreSQL. Click Save draft to commit them."
                  : revision === publishedRevision
                    ? `Public revision #${publishedRevision} matches current saved working draft. Changes reach the public instantly upon publish.`
                    : `Working draft revision #${revision} is ahead of live revision #${publishedRevision}. Review below and trigger publish when ready.`}
              </p>
            </div>
          </div>

          {/* Revision Telemetry Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-white/[0.08] bg-night-3 px-4 py-3 font-mono text-xs text-center min-w-[110px]">
              <div className="text-[10px] text-mist/70 uppercase">Working Draft</div>
              <div className="mt-0.5 text-base font-bold text-snow">#{revision}</div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-night-3 px-4 py-3 font-mono text-xs text-center min-w-[110px]">
              <div className="text-[10px] text-mist/70 uppercase">Public Live</div>
              <div className="mt-0.5 text-base font-bold text-sky">#{publishedRevision}</div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-night-3 px-4 py-3 font-mono text-xs text-center min-w-[110px]">
              <div className="text-[10px] text-mist/70 uppercase">Live Ratio</div>
              <div className="mt-0.5 text-base font-bold text-emerald-400">{publishedRatio}%</div>
            </div>
          </div>
        </div>

        {/* Background glow decoration */}
        <div
          aria-hidden="true"
          className="absolute -right-20 -bottom-20 size-80 rounded-full bg-sky/5 blur-3xl pointer-events-none"
        />
      </div>

      {/* 3. Real KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Projects */}
        <Link
          href="/dashboard/projects"
          className="overview-card group rounded-2xl border border-white/[0.08] bg-night-2 p-4 hover:border-sky/40 hover:bg-white/[0.02] transition-all"
        >
          <div className="flex items-center justify-between text-mist group-hover:text-sky transition-colors">
            <FolderGit2 className="size-4" />
            <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3 font-display text-2xl font-bold text-snow">
            {content.projects.length}
          </div>
          <div className="text-xs font-semibold text-snow">Projects</div>
          <div className="mt-0.5 font-mono text-[10px] text-mist">
            {publishedProjects} live · {featuredProjects} featured
          </div>
        </Link>

        {/* Articles */}
        <Link
          href="/dashboard/blog"
          className="overview-card group rounded-2xl border border-white/[0.08] bg-night-2 p-4 hover:border-sky/40 hover:bg-white/[0.02] transition-all"
        >
          <div className="flex items-center justify-between text-mist group-hover:text-sky transition-colors">
            <FileText className="size-4" />
            <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3 font-display text-2xl font-bold text-snow">
            {content.posts.length}
          </div>
          <div className="text-xs font-semibold text-snow">Articles</div>
          <div className="mt-0.5 font-mono text-[10px] text-mist">
            {publishedPosts} live · {totalReadingMinutes}m read
          </div>
        </Link>

        {/* Skills */}
        <Link
          href="/dashboard/skills"
          className="overview-card group rounded-2xl border border-white/[0.08] bg-night-2 p-4 hover:border-sky/40 hover:bg-white/[0.02] transition-all"
        >
          <div className="flex items-center justify-between text-mist group-hover:text-sky transition-colors">
            <Sparkles className="size-4" />
            <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3 font-display text-2xl font-bold text-snow">
            {totalSkills}
          </div>
          <div className="text-xs font-semibold text-snow">Skills</div>
          <div className="mt-0.5 font-mono text-[10px] text-mist">
            {content.skillGroups.length} groups
          </div>
        </Link>

        {/* Copy Strings */}
        <Link
          href="/dashboard/home"
          className="overview-card group rounded-2xl border border-white/[0.08] bg-night-2 p-4 hover:border-sky/40 hover:bg-white/[0.02] transition-all"
        >
          <div className="flex items-center justify-between text-mist group-hover:text-sky transition-colors">
            <Globe className="size-4" />
            <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3 font-display text-2xl font-bold text-snow">
            {copyStringsCount}
          </div>
          <div className="text-xs font-semibold text-snow">Copy Nodes</div>
          <div className="mt-0.5 font-mono text-[10px] text-mist">
            Editable text
          </div>
        </Link>

        {/* Media */}
        <Link
          href="/dashboard/media"
          className="overview-card group rounded-2xl border border-white/[0.08] bg-night-2 p-4 hover:border-sky/40 hover:bg-white/[0.02] transition-all"
        >
          <div className="flex items-center justify-between text-mist group-hover:text-sky transition-colors">
            <ImageIcon className="size-4" />
            <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3 font-display text-2xl font-bold text-snow">
            {mediaItems.length}
          </div>
          <div className="text-xs font-semibold text-snow">Media Assets</div>
          <div className="mt-0.5 font-mono text-[10px] text-mist">
            {formatBytes(totalMediaBytes) || "Blob storage"}
          </div>
        </Link>

        {/* Messages */}
        <Link
          href="/dashboard/inbox"
          className="overview-card group rounded-2xl border border-white/[0.08] bg-night-2 p-4 hover:border-sky/40 hover:bg-white/[0.02] transition-all"
        >
          <div className="flex items-center justify-between text-mist group-hover:text-sky transition-colors">
            <Mail className="size-4" />
            <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3 font-display text-2xl font-bold text-snow flex items-center gap-2">
            <span>{messages.length}</span>
            {unreadMessagesCount > 0 && (
              <span className="size-2 rounded-full bg-sky animate-ping" />
            )}
          </div>
          <div className="text-xs font-semibold text-snow">Inquiries</div>
          <div className="mt-0.5 font-mono text-[10px] text-mist">
            {unreadMessagesCount} unread
          </div>
        </Link>
      </div>

      {/* 4. Professional Charts Using Real Available Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Content Volume Breakdown (Real SVG bar chart) */}
        <div className="overview-card lg:col-span-2 rounded-3xl border border-white/[0.08] bg-night-2 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-sky">
                DATA TELEMETRY
              </div>
              <h3 className="text-base font-bold text-snow">
                Portfolio Content Volume Distribution
              </h3>
            </div>
            <span className="font-mono text-[11px] text-mist">Real Counts</span>
          </div>

          {/* SVG Bar Chart with real numbers */}
          <div className="space-y-3.5 pt-2 font-mono text-xs">
            {[
              {
                label: "Case Study Projects",
                count: content.projects.length,
                max: 30,
                color: "bg-sky",
                detail: `${publishedProjects} live`,
              },
              {
                label: "Technical Articles",
                count: content.posts.length,
                max: 30,
                color: "bg-emerald-400",
                detail: `${publishedPosts} live`,
              },
              {
                label: "Skill Taxonomy Groups",
                count: content.skillGroups.length,
                max: 30,
                color: "bg-amber-400",
                detail: `${totalSkills} total skills`,
              },
              {
                label: "Global Copy Strings",
                count: copyStringsCount,
                max: 30,
                color: "bg-indigo-400",
                detail: `${copyStringsCount} keys`,
              },
              {
                label: "Media Files in Blob Store",
                count: mediaItems.length,
                max: 30,
                color: "bg-purple-400",
                detail: formatBytes(totalMediaBytes) || "0 B",
              },
              {
                label: "Stored Contact Inquiries",
                count: messages.length,
                max: 30,
                color: "bg-pink-400",
                detail: `${unreadMessagesCount} unread`,
              },
            ].map((bar) => {
              const widthPct = Math.min(100, Math.max(8, (bar.count / bar.max) * 100));
              return (
                <div key={bar.label} className="space-y-1">
                  <div className="flex items-center justify-between text-mist">
                    <span className="text-snow text-[11px]">{bar.label}</span>
                    <span className="text-mist text-[11px]">
                      <strong className="text-snow font-bold mr-2">{bar.count}</strong>
                      ({bar.detail})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-night-3 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", bar.color)}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Publication Health Gauge (Real SVG donut ring) */}
        <div className="overview-card rounded-3xl border border-white/[0.08] bg-night-2 p-6 flex flex-col justify-between">
          <div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-sky">
              PUBLICATION HEALTH
            </div>
            <h3 className="text-base font-bold text-snow">
              Live vs Draft Ratio
            </h3>
            <p className="mt-1 text-xs text-mist">
              Proportion of total portfolio case studies and articles live in production.
            </p>
          </div>

          {/* Concentric SVG Ring Gauge */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative size-36">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-night-3"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-sky transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={`${(publishedRatio * 251.2) / 100} 251.2`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-2xl font-extrabold text-snow">
                  {publishedRatio}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-mist">
                  Published
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-sky" />
                <span className="text-mist">Live:</span>
                <strong className="text-snow">{totalPublished}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-night-3" />
                <span className="text-mist">Draft:</span>
                <strong className="text-snow">{draftProjects + draftPosts}</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-center font-mono text-[11px] text-mist">
            Total Content Items: <span className="text-snow font-bold">{totalPublishable}</span>
          </div>
        </div>
      </div>

      {/* 5. Schedule & Planning Area */}
      <div className="overview-card rounded-3xl border border-white/[0.08] bg-night-2 p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-sky">
              <Calendar className="size-3" />
              <span>CONTENT PLANNING & PIPELINE</span>
            </div>
            <h3 className="mt-0.5 text-lg font-bold text-snow">
              Draft Items Pending Release
            </h3>
          </div>
          <span className="font-mono text-xs text-mist">
            {draftItems.length} item{draftItems.length !== 1 ? "s" : ""} awaiting publication
          </span>
        </div>

        {draftItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <CheckCircle2 className="size-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-snow">
              Release pipeline is clear
            </p>
            <p className="text-xs text-mist mt-1 max-w-md mx-auto">
              All case studies and articles in your working database are currently published to the live portfolio.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-night-3/60 overflow-hidden">
            {draftItems.map((item, idx) => (
              <div
                key={`${item.type}-${item.title}-${idx}`}
                className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold",
                      item.type === "Project"
                        ? "bg-sky/20 text-sky"
                        : "bg-emerald-500/20 text-emerald-400",
                    )}
                  >
                    {item.type}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-snow truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-mist truncate">
                      Category: {item.category} · {item.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline-flex rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] text-amber-300">
                    Draft Private
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push(item.href)}
                    className="inline-flex items-center gap-1 text-xs font-mono text-sky hover:underline"
                  >
                    <span>Edit</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Recent Activity & Messages Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revisions Activity Feed */}
        <div className="overview-card rounded-3xl border border-white/[0.08] bg-night-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="size-4 text-sky" />
              <h3 className="text-base font-bold text-snow">Recent Revisions</h3>
            </div>
            <Link
              href="/dashboard/settings"
              className="text-xs font-mono text-sky hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-2">
            {revisions.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-night-3/60 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-snow">
                      Rev #{item.revision}
                    </span>
                    <StatusPill tone="neutral">{item.kind}</StatusPill>
                  </div>
                  <div className="font-mono text-[10px] text-mist mt-0.5">
                    {formatDate(item.createdAt)}
                  </div>
                </div>

                {item.revision !== revision && (
                  <button
                    type="button"
                    onClick={() => void restoreRevision(item)}
                    disabled={restoringRevisionId === item.id}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-sky hover:underline disabled:opacity-40"
                  >
                    {restoringRevisionId === item.id ? (
                      <RefreshCcw className="size-3 animate-spin" />
                    ) : null}
                    <span>Restore</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Messages Preview */}
        <div className="overview-card rounded-3xl border border-white/[0.08] bg-night-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-sky" />
              <h3 className="text-base font-bold text-snow">Recent Inquiries</h3>
            </div>
            <Link
              href="/dashboard/inbox"
              className="text-xs font-mono text-sky hover:underline"
            >
              Open Inbox ({unreadMessagesCount}) →
            </Link>
          </div>

          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-mist font-mono">
              No inquiries received yet.
            </div>
          ) : (
            <div className="space-y-2">
              {messages.slice(0, 4).map((msg) => (
                <Link
                  key={msg.id}
                  href="/dashboard/inbox"
                  className="block rounded-xl border border-white/[0.06] bg-night-3/60 p-3 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-snow truncate">
                      {msg.name || "Anonymous Contact"}
                    </span>
                    <span className="font-mono text-[10px] text-mist">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-mist truncate mt-0.5">
                    {msg.subject || msg.message || "No subject"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 7. Quick Management Access Launchpad */}
      <div className="overview-card rounded-3xl border border-white/[0.08] bg-night-2 p-6 sm:p-7 space-y-4">
        <div>
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-sky">
            QUICK MANAGEMENT ACCESS
          </div>
          <h3 className="text-lg font-bold text-snow">
            Jump to Dedicated Workspace Areas
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              title: "Projects & Case Studies",
              desc: "Manage showcased works, stack tags, features, and reordering.",
              href: "/dashboard/projects",
              icon: FolderGit2,
              badge: `${content.projects.length} items`,
            },
            {
              title: "Articles & Blog",
              desc: "Compose structured blocks, manage draft articles and topics.",
              href: "/dashboard/blog",
              icon: FileText,
              badge: `${content.posts.length} posts`,
            },
            {
              title: "Profile & About",
              desc: "Experience timeline, training, journey milestones, identity statements.",
              href: "/dashboard/about",
              icon: UserCheck,
              badge: "8 sections",
            },
            {
              title: "Skills & Capabilities",
              desc: "Categorized skill groups and infinite marquee banner content.",
              href: "/dashboard/skills",
              icon: Sparkles,
              badge: `${totalSkills} skills`,
            },
            {
              title: "Home & Site Copy",
              desc: "Assets, navigation links, and public copy strings.",
              href: "/dashboard/home",
              icon: Globe,
              badge: `${copyStringsCount} strings`,
            },
            {
              title: "Media Library",
              desc: "Upload assets to Vercel Blob store, inspect bytes, copy URLs.",
              href: "/dashboard/media",
              icon: ImageIcon,
              badge: `${mediaItems.length} files`,
            },
            {
              title: "Contact Form Inbox",
              desc: "Read, archive, or purge visitor contact submissions.",
              href: "/dashboard/inbox",
              icon: Mail,
              badge: `${messages.length} messages`,
            },
            {
              title: "SEO & Search Appearance",
              desc: "Public meta description, title template, and robots rules.",
              href: "/dashboard/seo",
              icon: Search,
              badge: "Configured",
            },
            {
              title: "Settings & Revisions",
              desc: "Rollback snapshots, download JSON backups, and check readiness.",
              href: "/dashboard/settings",
              icon: Settings2,
              badge: `Rev #${revision}`,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-night-3/60 p-4 hover:border-sky/40 hover:bg-white/[0.03] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-mist group-hover:text-sky transition-colors">
                    <Icon className="size-4" />
                    <span className="font-mono text-[10px] rounded-full bg-white/[0.05] px-2 py-0.5">
                      {card.badge}
                    </span>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-snow group-hover:text-sky transition-colors">
                    {card.title}
                  </h4>
                  <p className="mt-1 text-xs text-mist leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 font-mono text-[11px] text-sky group-hover:underline">
                  <span>Open section</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
