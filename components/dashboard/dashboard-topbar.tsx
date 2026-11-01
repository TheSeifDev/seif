"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronRight,
  Menu,
  RefreshCcw,
  RotateCcw,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./dashboard-context";

const routeNames: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/projects": "Projects",
  "/dashboard/blog": "Blog Articles",
  "/dashboard/about": "About & Profile",
  "/dashboard/skills": "Skills & Marquee",
  "/dashboard/home": "Home & Copy",
  "/dashboard/media": "Media Library",
  "/dashboard/inbox": "Messages Inbox",
  "/dashboard/seo": "SEO & Metadata",
  "/dashboard/settings": "Settings & Revisions",
};

export function DashboardTopbar({
  onOpenMobileNav,
}: {
  onOpenMobileNav: () => void;
}) {
  const pathname = usePathname();
  const {
    revision,
    publishedRevision,
    dirty,
    saving,
    publishing,
    configured,
    save,
    discard,
    openPublishModal,
    setNotice,
  } = useDashboard();

  const currentTitle = routeNames[pathname] || "Workspace";

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-night/80 backdrop-blur-md px-4 sm:px-6 lg:px-10 py-3.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-mist hover:text-snow"
            aria-label="Open navigation menu"
          >
            <Menu className="size-4" />
          </button>

          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-mist truncate">
            <Link
              href="/dashboard"
              className="hover:text-snow transition-colors shrink-0"
            >
              Dashboard
            </Link>
            <ChevronRight className="size-3 text-mist/40 shrink-0" />
            <span className="font-semibold text-snow truncate">{currentTitle}</span>
          </nav>
        </div>

        {/* Right: State Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Status Badges */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider uppercase",
                dirty
                  ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                  : revision === publishedRevision
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                    : "border-sky/25 bg-sky/10 text-sky",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  dirty
                    ? "bg-amber-400 animate-pulse"
                    : revision === publishedRevision
                      ? "bg-emerald-400"
                      : "bg-sky",
                )}
              />
              <span>
                {dirty
                  ? "Unsaved"
                  : revision === publishedRevision
                    ? "In Sync"
                    : "Unpublished"}
              </span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-mist">
              <span>Rev</span>
              <strong className="text-snow">#{revision}</strong>
            </span>
          </div>

          {/* Discard edits */}
          {dirty && (
            <button
              type="button"
              onClick={discard}
              title="Discard unsaved edits"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-white/10 bg-white/[0.03] font-mono text-[11px] font-medium text-mist hover:text-snow hover:border-white/20 transition-all"
            >
              <RotateCcw className="size-3" />
              <span className="hidden sm:inline">Discard</span>
            </button>
          )}

          {/* Save draft button */}
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving || !configured}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full font-semibold text-[11px] bg-white text-night hover:bg-snow disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {saving ? (
              <RefreshCcw className="size-3 animate-spin text-night" />
            ) : (
              <Check className="size-3 text-night" />
            )}
            <span>{saving ? "Saving" : "Save draft"}</span>
          </button>

          {/* Publish revision button (Named exact 'Publish' for tests) */}
          <button
            type="button"
            onClick={() => {
              if (dirty) {
                setNotice({
                  tone: "info",
                  message: "Save your draft changes before publishing.",
                });
              } else {
                openPublishModal();
              }
            }}
            disabled={publishing || !configured}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full font-semibold text-[11px] bg-sky text-night hover:bg-[#7cc9ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_16px_-4px_rgba(77,182,255,0.4)]"
          >
            {publishing ? (
              <RefreshCcw className="size-3 animate-spin text-night" />
            ) : (
              <Send className="size-3 text-night" />
            )}
            <span>Publish</span>
          </button>
        </div>
      </div>
    </header>
  );
}
