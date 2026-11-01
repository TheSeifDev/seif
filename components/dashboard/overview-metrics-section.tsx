"use client";

import * as React from "react";
import {
  BookOpen,
  FolderOpen,
  Image as ImageIcon,
  Inbox,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { darkCard } from "@/lib/ui/layout";
import { gsap, useGSAP, motionQueries } from "@/components/motion/gsap";
import type { SiteContent } from "@/lib/cms/schema";
import type { ContentHubKey, MediaItem, InboxMessage } from "./dashboard-types";

type OverviewMetricsSectionProps = {
  content: SiteContent;
  messages: InboxMessage[];
  mediaItems: MediaItem[];
  onOpenContentHub: (key: ContentHubKey) => void;
};

export function OverviewMetricsSection({
  content,
  messages,
  mediaItems,
  onOpenContentHub,
}: OverviewMetricsSectionProps) {
  const containerRef = React.useRef<HTMLElement>(null);

  // Real data calculations
  const totalProjects = content.projects.length;
  const publishedProjects = content.projects.filter(
    (p) => p.status === "published",
  ).length;
  const featuredProjects = content.projects.filter((p) => p.featured).length;

  const totalPosts = content.posts.length;
  const publishedPosts = content.posts.filter(
    (p) => p.status === "published",
  ).length;
  const totalReadingMinutes = content.posts.reduce(
    (acc, p) => acc + (p.readingMinutes || 0),
    0,
  );

  const totalMessages = messages.length;
  const unreadMessages = messages.filter((m) => m.status !== "read" && m.status !== "archived").length;

  const totalMedia = mediaItems.length;
  const totalMediaBytes = mediaItems.reduce((acc, m) => acc + (m.size || 0), 0);
  const totalMediaMB = (totalMediaBytes / (1024 * 1024)).toFixed(1);

  // GSAP Count-up animation
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(motionQueries.motion, () => {
        const counters = containerRef.current?.querySelectorAll<HTMLElement>("[data-metric-value]");
        if (!counters) return;

        counters.forEach((el) => {
          const targetValue = Number(el.dataset.metricValue || "0");
          if (isNaN(targetValue) || targetValue === 0) return;

          const obj = { val: 0 };
          gsap.to(obj, {
            val: targetValue,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
            onUpdate: () => {
              el.textContent = Math.round(obj.val).toString();
            },
          });
        });
      });
    },
    { scope: containerRef },
  );

  const metrics = [
    {
      label: "Projects & Case Studies",
      value: totalProjects,
      published: publishedProjects,
      detail: `${featuredProjects} featured on homepage`,
      icon: FolderOpen,
      hubKey: "projects" as ContentHubKey,
      color: "sky",
    },
    {
      label: "Articles & Publications",
      value: totalPosts,
      published: publishedPosts,
      detail: `${totalReadingMinutes} total reading minutes`,
      icon: BookOpen,
      hubKey: "blog" as ContentHubKey,
      color: "snow",
    },
    {
      label: "Contact Inquiries",
      value: totalMessages,
      published: unreadMessages,
      detail: `${unreadMessages} unread message(s)`,
      icon: Inbox,
      hubKey: "inbox" as ContentHubKey,
      color: "emerald",
    },
    {
      label: "Stored Media Assets",
      value: totalMedia,
      published: totalMedia,
      detail: `${totalMediaMB} MB total storage volume`,
      icon: ImageIcon,
      hubKey: "media" as ContentHubKey,
      color: "amber",
    },
  ];

  return (
    <section ref={containerRef} id="metrics" className="scroll-mt-8 space-y-8">
      {/* Heading */}
      <div className="flex flex-col gap-2 pb-6 border-b border-white/[0.08] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-sky shadow-[0_0_0_4px_rgba(77,182,255,0.18)]"
            />
            <span>● 02 ——— METRICS & HEALTH</span>
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-snow">
            Overview
          </h2>
          <p className="mt-1 text-sm text-mist">
            Real portfolio telemetry aggregated directly from PostgreSQL content and storage records.
          </p>
        </div>

        <div className="font-mono text-xs text-mist">
          Telemetry state: <span className="text-emerald-400">Verified</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={cn(
                darkCard,
                "group relative overflow-hidden p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20",
              )}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
                  {metric.label}
                </span>
                <div className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-snow group-hover:border-sky/40 group-hover:text-sky transition-colors">
                  <Icon className="size-4" />
                </div>
              </div>

              {/* Number with GSAP Count-up Target */}
              <div className="my-6">
                <div className="flex items-baseline gap-3">
                  <span
                    data-metric-value={metric.value}
                    className="font-display text-5xl font-extrabold text-snow tracking-tight"
                  >
                    {metric.value}
                  </span>
                  <span className="font-mono text-xs text-mist">records</span>
                </div>
                <div className="mt-2 text-xs text-mist leading-relaxed">
                  {metric.detail}
                </div>
              </div>

              {/* Card Footer Quick Link */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[10px] text-mist">
                  {metric.published} active / published
                </span>
                <button
                  type="button"
                  onClick={() => onOpenContentHub(metric.hubKey)}
                  className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-sky hover:text-white transition-colors"
                >
                  <span>MANAGE</span>
                  <ArrowUpRight className="size-3" />
                </button>
              </div>

              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 h-0.5 w-1/4 bg-sky/70 transition-all duration-300 group-hover:w-full" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
