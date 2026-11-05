"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderGit2,
  Menu,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  Upload,
} from "lucide-react";
import { useDashboard } from "./dashboard-context";
import { DashboardNotifications } from "./dashboard-notifications";

const routeMeta: Record<string, { group: string; title: string }> = {
  "/dashboard": { group: "Overview", title: "Dashboard Control Center" },
  "/dashboard/home": { group: "Content", title: "Home & Site Copy" },
  "/dashboard/projects": { group: "Content", title: "Projects & Case Studies" },
  "/dashboard/blog": { group: "Content", title: "Blog Articles" },
  "/dashboard/about": { group: "Content", title: "About & Profile" },
  "/dashboard/skills": { group: "Content", title: "Skills & Taxonomy" },
  "/dashboard/schedule": { group: "Operations", title: "Content Calendar & Schedule" },
  "/dashboard/media": { group: "Operations", title: "Media Assets Library" },
  "/dashboard/inbox": { group: "Operations", title: "Contact Form Inbox" },
  "/dashboard/analytics": { group: "Insights", title: "Website Analytics & Telemetry" },
  "/dashboard/seo": { group: "Insights", title: "Search Engine Optimization" },
  "/dashboard/settings": { group: "System", title: "Settings & System Revisions" },
  "/dashboard/notifications": { group: "System", title: "Notification Channels & Delivery" },
  "/dashboard/settings/notifications": { group: "System", title: "Notification Settings" },
};

export function DashboardTopbar({
  onOpenMobileNav,
  onOpenCommandPalette,
}: {
  onOpenMobileNav: () => void;
  onOpenCommandPalette: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [createMenuOpen, setCreateMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const createMenuRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);

  const {
    dirty,
    saving,
    publishing,
    configured,
    save,
    discard,
    openPublishModal,
    setNotice,
    unreadMessagesCount,
    content,
  } = useDashboard();

  // Close menus on outside click
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setCreateMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const meta = routeMeta[pathname] || { group: "Workspace", title: "Administration" };

  const reviewRequiredCount = content.posts.filter((p) => p.reviewRequired).length;
  const notificationsCount = unreadMessagesCount + reviewRequiredCount + (dirty ? 1 : 0);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-night/85 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 select-none">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto min-w-0">
        {/* Left: Mobile Toggle & Contextual Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-mist hover:text-snow shrink-0"
            aria-label="Open admin navigation"
          >
            <Menu className="size-4" />
          </button>

          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-mist truncate">
            <Link
              href="/dashboard"
              prefetch={false}
              className="hover:text-snow transition-colors shrink-0 font-medium"
            >
              Control Center
            </Link>
            <ChevronRight className="size-3 text-mist/40 shrink-0" />
            <span className="text-mist/70 shrink-0 hidden sm:inline">{meta.group}</span>
            <ChevronRight className="size-3 text-mist/40 shrink-0 hidden sm:inline" />
            <span className="font-semibold text-snow truncate">{meta.title}</span>
          </nav>
        </div>

        {/* Right: Functional Command Tools & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Global Command Search (Ctrl+K) */}
          <button
            type="button"
            onClick={() => {
              console.log("TOPBAR: Command palette button clicked");
              onOpenCommandPalette();
            }}
            className="hidden md:inline-flex items-center gap-2 h-8 px-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-mist hover:border-white/20 hover:text-snow transition-all"
            title="Search commands, pages, and projects (Ctrl+K)"
          >
            <Search className="size-3.5 text-mist" />
            <span className="text-[11px] font-sans">Command palette</span>
            <kbd className="inline-flex items-center rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.2 font-mono text-[9px] text-mist">
              ⌘K
            </kbd>
          </button>

          {/* Quick Create Dropdown Menu */}
          <div ref={createMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setCreateMenuOpen((prev) => !prev);
                setNotificationsOpen(false);
              }}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border border-sky/30 bg-sky/10 text-xs font-semibold text-sky hover:bg-sky/20 transition-all shadow-sm"
              aria-expanded={createMenuOpen}
              aria-haspopup="true"
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="size-3 opacity-70" />
            </button>

            {createMenuOpen && (
              <div
                className="absolute right-0 top-10 z-50 w-52 rounded-2xl border border-white/10 bg-night-2 p-1.5 text-snow shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-md"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCreateMenuOpen(false);
                    router.push("/dashboard/projects");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-snow hover:bg-white/[0.06] transition-colors"
                  role="menuitem"
                >
                  <FolderGit2 className="size-4 text-sky shrink-0" />
                  <span>New Project Case Study</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateMenuOpen(false);
                    router.push("/dashboard/blog");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-snow hover:bg-white/[0.06] transition-colors"
                  role="menuitem"
                >
                  <FileText className="size-4 text-emerald-400 shrink-0" />
                  <span>New Technical Article</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateMenuOpen(false);
                    router.push("/dashboard/media");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-snow hover:bg-white/[0.06] transition-colors"
                  role="menuitem"
                >
                  <Upload className="size-4 text-purple-400 shrink-0" />
                  <span>Upload Media Asset</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setCreateMenuOpen(false);
              }}
              className="relative inline-flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-mist hover:text-snow hover:border-white/20 transition-all"
              aria-label="View notifications"
            >
              <Bell className="size-3.5" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-sky font-mono text-[9px] font-bold text-night flex items-center justify-center animate-pulse">
                  {notificationsCount}
                </span>
              )}
            </button>

            <DashboardNotifications
              open={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          {/* Preview Public Site Action */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Preview Live Portfolio"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-medium text-mist hover:text-snow hover:border-white/20 transition-all"
          >
            <span className="text-[11px]">Preview Site</span>
            <ArrowUpRight className="size-3" />
          </a>

          {/* Contextual Discard Button */}
          {dirty && (
            <button
              type="button"
              onClick={discard}
              title="Discard unsaved edits in memory"
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-white/10 bg-white/[0.03] font-mono text-[11px] font-medium text-amber-300 hover:text-snow hover:border-white/20 transition-all"
            >
              <RotateCcw className="size-3 text-amber-400" />
              <span className="hidden sm:inline">Discard</span>
            </button>
          )}

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving || !configured}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl font-semibold text-xs bg-white text-night hover:bg-snow disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {saving ? (
              <RefreshCcw className="size-3 animate-spin text-night" />
            ) : (
              <Check className="size-3 text-night" />
            )}
            <span>{saving ? "Saving" : "Save draft"}</span>
          </button>

          {/* Publish Revision Button (Named exact 'Publish' for integration tests) */}
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
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl font-semibold text-xs bg-sky text-night hover:bg-[#7cc9ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_16px_-4px_rgba(77,182,255,0.4)]"
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
