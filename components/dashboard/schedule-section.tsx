"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { darkCard } from "@/lib/ui/layout";
import type { SiteContent } from "@/lib/cms/schema";

type ScheduleSectionProps = {
  content: SiteContent;
  onOpenContentHub: (key: "projects" | "blog") => void;
};

export function ScheduleSection({ content, onOpenContentHub }: ScheduleSectionProps) {
  // Extract real draft articles as scheduled / upcoming pipeline items
  const draftPosts = content.posts.filter((p) => p.status === "draft");
  const draftProjects = content.projects.filter((p) => p.status === "draft");

  // Derive schedule items from actual application state
  const upcomingItems = [
    ...draftPosts.map((post, index) => ({
      id: post.slug,
      title: post.title,
      type: "Article" as const,
      status: post.reviewRequired ? ("Needs Review" as const) : ("Staged Draft" as const),
      date: post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : `Target Cycle 0${index + 1}`,
      tags: post.tags,
      hubKey: "blog" as const,
    })),
    ...draftProjects.map((project, index) => ({
      id: project.slug,
      title: project.title,
      type: "Case Study" as const,
      status: "In Development" as const,
      date: `Sprint 0${index + 1}`,
      tags: project.domains.slice(0, 2),
      hubKey: "projects" as const,
    })),
  ];

  // Calendar dates for the current week / month
  const today = new Date();
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i + 1);
    return {
      dayName: d.toLocaleDateString(undefined, { weekday: "short" }),
      dayNumber: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    };
  });

  return (
    <section id="schedule" className="scroll-mt-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-6 border-b border-white/[0.08] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-sky shadow-[0_0_0_4px_rgba(77,182,255,0.18)]"
            />
            <span>● 04 ——— PUBLISHING SCHEDULE</span>
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-snow">
            Publishing Pipeline
          </h2>
          <p className="mt-1 text-sm text-mist max-w-2xl">
            Structured roadmap, scheduled article releases, and publication queue derived from current draft states.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-mist">
          <CalendarIcon className="size-3.5 text-sky" />
          <span>Active Publishing Cadence</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Timeline View (Left 5 Cols) */}
        <div className={cn(darkCard, "p-6 sm:p-7 lg:col-span-5 flex flex-col justify-between shadow-sm")}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-sky" />
                <h3 className="font-display text-base font-bold text-snow">
                  Current Week Overview
                </h3>
              </div>
              <span className="font-mono text-[10px] text-mist uppercase">
                {today.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Weekly Days Bar */}
            <div className="mt-6 grid grid-cols-7 gap-1.5 text-center">
              {daysOfWeek.map((day) => (
                <div
                  key={day.dayNumber}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl py-3 border transition-colors",
                    day.isToday
                      ? "border-sky bg-sky/15 text-snow font-bold shadow-[0_0_16px_rgba(77,182,255,0.25)]"
                      : "border-white/[0.06] bg-night-3 text-mist",
                  )}
                >
                  <span className="font-mono text-[10px] uppercase">
                    {day.dayName}
                  </span>
                  <span className="mt-1 text-sm font-display">{day.dayNumber}</span>
                  {day.isToday && (
                    <span className="mt-1 size-1 rounded-full bg-sky" />
                  )}
                </div>
              ))}
            </div>

            {/* Pipeline Cadence Guide */}
            <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-night-3 p-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-snow">
                <Sparkles className="size-3.5 text-sky" />
                <span>Editorial Target Cadence</span>
              </div>
              <div className="space-y-2 text-xs text-mist leading-relaxed">
                <div className="flex justify-between">
                  <span>Technical Articles</span>
                  <span className="font-mono text-snow">Bi-weekly</span>
                </div>
                <div className="flex justify-between">
                  <span>Major Case Studies</span>
                  <span className="font-mono text-snow">Monthly cycle</span>
                </div>
                <div className="flex justify-between">
                  <span>Interactive 3D / Shader updates</span>
                  <span className="font-mono text-snow">Quarterly</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] font-mono text-[11px] text-mist flex justify-between">
            <span>Automated Cron Hook</span>
            <span className="text-emerald-400">Ready for integration</span>
          </div>
        </div>

        {/* Upcoming Queue List (Right 7 Cols) */}
        <div className={cn(darkCard, "p-6 sm:p-7 lg:col-span-7 flex flex-col justify-between shadow-sm")}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-sky" />
                <h3 className="font-display text-base font-bold text-snow">
                  Upcoming Content Queue
                </h3>
              </div>
              <span className="font-mono text-[11px] text-mist">
                {upcomingItems.length} Staged Item{upcomingItems.length === 1 ? "" : "s"}
              </span>
            </div>

            {upcomingItems.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <p className="text-sm text-snow font-medium">All drafts currently published</p>
                <p className="mt-1 text-xs text-mist">
                  Create a new draft in the Content Hub to queue items for the publishing calendar.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {upcomingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-night-3 p-4 hover:border-white/20 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-semibold text-sky">
                          {item.type === "Article" ? (
                            <BookOpen className="size-3" />
                          ) : (
                            <FolderOpen className="size-3" />
                          )}
                          <span>{item.type}</span>
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="font-mono text-[10px] text-mist">
                          {item.date}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-snow truncate">
                        {item.title}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] text-mist"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase",
                          item.status === "Needs Review"
                            ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                            : "border border-sky/30 bg-sky/10 text-sky",
                        )}
                      >
                        {item.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenContentHub(item.hubKey)}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-mist hover:text-snow hover:border-white/30 transition-colors"
                        title={`Edit ${item.title}`}
                      >
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-mist font-mono">
            <span>Publishing Engine</span>
            <span className="text-snow font-medium">Explicit Admin Release</span>
          </div>
        </div>
      </div>
    </section>
  );
}

