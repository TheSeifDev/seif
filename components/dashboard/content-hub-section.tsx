"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  FolderOpen,
  Globe2,
  ImagePlus,
  Inbox,
  Settings,
  Sparkles,
  UserCircle,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { darkCard } from "@/lib/ui/layout";
import type { SiteContent } from "@/lib/cms/schema";
import type { ContentHubKey } from "./dashboard-types";

type ContentHubSectionProps = {
  content: SiteContent;
  activeEditor: ContentHubKey | null;
  onSelectEditor: (key: ContentHubKey | null) => void;
  renderEditor: (key: ContentHubKey) => React.ReactNode;
  unreadMessagesCount: number;
};

export function ContentHubSection({
  content,
  activeEditor,
  onSelectEditor,
  renderEditor,
  unreadMessagesCount,
}: ContentHubSectionProps) {
  const publishedProjects = content.projects.filter((p) => p.status === "published").length;
  const publishedPosts = content.posts.filter((p) => p.status === "published").length;
  const totalSkills = content.skillGroups.reduce((acc, g) => acc + g.skills.length, 0);

  const hubModules: Array<{
    key: ContentHubKey;
    buttonLabel: string;
    title: string;
    description: string;
    stat: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      key: "projects",
      buttonLabel: "Projects",
      title: "Case Studies & Projects",
      description: "Manage case studies, architecture details, highlights, and published states.",
      stat: `${content.projects.length} total · ${publishedProjects} published`,
      icon: FolderOpen,
    },
    {
      key: "blog",
      buttonLabel: "Blog",
      title: "Articles & Editorial",
      description: "Compose technical articles, ordered blocks, and draft review states.",
      stat: `${content.posts.length} total · ${publishedPosts} published`,
      icon: BookOpen,
    },
    {
      key: "about",
      buttonLabel: "About",
      title: "Profile & Identity",
      description: "Biography, career experience, education, principles, and journey.",
      stat: "8 structured sections",
      icon: UserCircle,
    },
    {
      key: "skills",
      buttonLabel: "Skills",
      title: "Technical Skills & Marquee",
      description: "Ordered skill groups, proficiency ratings, and animated marquee tracks.",
      stat: `${content.skillGroups.length} groups · ${totalSkills} skills`,
      icon: Sparkles,
    },
    {
      key: "home",
      buttonLabel: "Home",
      title: "Site Copy, Assets & Home",
      description: "Wordmarks, hero copy, navigation items, and stable asset paths.",
      stat: `${Object.keys(content.copy).length} copy strings · ${content.navigation.length} links`,
      icon: Globe2,
    },
    {
      key: "media",
      buttonLabel: "Media",
      title: "Media Library & CDN",
      description: "Upload images, inspect stored assets, and copy stable URLs.",
      stat: "Vercel Blob storage connected",
      icon: ImagePlus,
    },
    {
      key: "inbox",
      buttonLabel: "Inbox",
      title: "Contact Inquiries",
      description: "Inspect client messages, sender emails, and update read/archived states.",
      stat: unreadMessagesCount > 0 ? `${unreadMessagesCount} unread message(s)` : "All messages read",
      icon: Inbox,
    },
    {
      key: "seo",
      buttonLabel: "SEO",
      title: "Search & Metadata",
      description: "Meta tags, OpenGraph cards, search descriptions, and robot directives.",
      stat: "Canonical domain active",
      icon: Wrench,
    },
    {
      key: "settings",
      buttonLabel: "Settings",
      title: "Revision Ledger & Backup",
      description: "Inspect version history, restore draft revisions, and download JSON backups.",
      stat: "PostgreSQL audit ledger",
      icon: Settings,
    },
  ];

  return (
    <section id="content-hub" className="scroll-mt-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-6 border-b border-white/[0.08] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-sky shadow-[0_0_0_4px_rgba(77,182,255,0.18)]"
            />
            <span>● 06 ——— CONTENT HUB</span>
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-snow">
            Content Architecture
          </h2>
          <p className="mt-1 text-sm text-mist max-w-2xl">
            High-density workspace for portfolio domains. Select any module below to edit structured content with zero page reloads.
          </p>
        </div>

        {activeEditor && (
          <button
            type="button"
            onClick={() => onSelectEditor(null)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs font-semibold text-snow hover:border-sky/50 hover:text-sky transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="size-3.5" />
            <span>Hub Overview</span>
          </button>
        )}
      </div>

      {/* When no editor is active, display the Master Content Hub Grid */}
      {!activeEditor ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hubModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.key}
                className={cn(
                  darkCard,
                  "group relative overflow-hidden p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20",
                )}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-mist">
                      {module.stat}
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-snow group-hover:border-sky/40 group-hover:text-sky transition-colors">
                      <Icon className="size-4" />
                    </div>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-snow group-hover:text-sky transition-colors">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-xs text-mist leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-mist/60 uppercase">
                    CMS Module
                  </span>
                  {/* The button has the exact name (e.g. "Projects", "Blog", etc.) for test and accessibility compatibility */}
                  <button
                    type="button"
                    onClick={() => onSelectEditor(module.key)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 text-xs font-semibold text-snow hover:bg-snow hover:text-night transition-colors"
                  >
                    <span>{module.buttonLabel}</span>
                    <ArrowUpRight className="size-3" />
                  </button>
                </div>

                {/* Accent hover border line */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-sky transition-all duration-300 group-hover:w-full" />
              </div>
            );
          })}
        </div>
      ) : (
        /* When an editor is active, render its full focused interface */
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-sky/30 bg-sky/10 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-sky animate-pulse" />
              <span className="font-mono text-xs uppercase font-semibold text-snow">
                Editing Domain:{" "}
                <span className="text-sky">
                  {hubModules.find((m) => m.key === activeEditor)?.title || activeEditor}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectEditor(null)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-snow hover:text-sky transition-colors"
            >
              <span>Close Editor</span>
              <span>✕</span>
            </button>
          </div>

          <div className="transition-all duration-300">
            {renderEditor(activeEditor)}
          </div>
        </div>
      )}
    </section>
  );
}
