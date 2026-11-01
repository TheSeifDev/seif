"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  FileText,
  FolderGit2,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Radio,
  Search,
  Settings2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./dashboard-context";
import type { DashboardContextValue } from "./dashboard-context";
import type { DashboardSectionKey, DashboardSidebarNavItem, DashboardUser, NavItem } from "./dashboard-types";
import { Command, BarChart3, Activity, Calendar, History, Layers } from "lucide-react";

export type DashboardSidebarProps = {
  activeSection?: DashboardSectionKey;
  onNavigate?: (sectionKey: DashboardSectionKey) => void;
  user?: DashboardUser;
  onLogout?: () => void;
  revision?: number;
  publishedRevision?: number;
  dirty?: boolean;
};

export const dashboardNavItems: NavItem[] = [
  { key: "command-center", id: "command-center", label: "Command Center", number: "01", icon: Command },
  { key: "metrics", id: "metrics", label: "Overview Metrics", number: "02", icon: BarChart3 },
  { key: "analytics", id: "analytics", label: "Content Analytics", number: "03", icon: Activity },
  { key: "schedule", id: "schedule", label: "Publish Schedule", number: "04", icon: Calendar },
  { key: "activity", id: "activity", label: "Recent Activity", number: "05", icon: History },
  { key: "content-hub", id: "content-hub", label: "Content Hub", number: "06", icon: Layers },
];

export function DashboardSidebar(props?: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  let ctx: DashboardContextValue | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ctx = useDashboard();
  } catch {
    ctx = null;
  }

  const content = ctx?.content ?? { projects: [], posts: [], skillGroups: [], copy: {} };
  const revision = props?.revision ?? ctx?.revision ?? 0;
  const publishedRevision = props?.publishedRevision ?? ctx?.publishedRevision ?? 0;
  const dirty = props?.dirty ?? ctx?.dirty ?? false;
  const user = props?.user ?? ctx?.user ?? { name: "Admin" };
  const logout = props?.onLogout ?? ctx?.logout ?? (() => Promise.resolve());
  const unreadMessagesCount = ctx?.unreadMessagesCount ?? 0;
  const mediaItems = ctx?.mediaItems ?? [];

  // Prefetch all dashboard routes on mount for instant client transitions
  React.useEffect(() => {
    const routes = [
      "/dashboard",
      "/dashboard/projects",
      "/dashboard/blog",
      "/dashboard/about",
      "/dashboard/skills",
      "/dashboard/home",
      "/dashboard/media",
      "/dashboard/inbox",
      "/dashboard/seo",
      "/dashboard/settings",
    ];
    routes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {
        // Ignore prefetch errors
      }
    });
  }, [router]);

  const navItems: DashboardSidebarNavItem[] = React.useMemo(
    () => [
      {
        key: "overview",
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        group: "core",
      },
      {
        key: "projects",
        label: "Projects",
        href: "/dashboard/projects",
        icon: FolderGit2,
        badge: content.projects.length,
        group: "content",
      },
      {
        key: "blog",
        label: "Blog",
        href: "/dashboard/blog",
        icon: FileText,
        badge: content.posts.length,
        group: "content",
      },
      {
        key: "about",
        label: "About",
        href: "/dashboard/about",
        icon: UserCheck,
        group: "content",
      },
      {
        key: "skills",
        label: "Skills",
        href: "/dashboard/skills",
        icon: Sparkles,
        group: "content",
      },
      {
        key: "home",
        label: "Home",
        href: "/dashboard/home",
        icon: Globe,
        group: "content",
      },
      {
        key: "media",
        label: "Media",
        href: "/dashboard/media",
        icon: ImageIcon,
        badge: mediaItems.length > 0 ? mediaItems.length : undefined,
        group: "assets",
      },
      {
        key: "inbox",
        label: "Inbox",
        href: "/dashboard/inbox",
        icon: Mail,
        badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
        group: "assets",
      },
      {
        key: "seo",
        label: "SEO",
        href: "/dashboard/seo",
        icon: Search,
        group: "system",
      },
      {
        key: "settings",
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings2,
        group: "system",
      },
    ],
    [content.projects.length, content.posts.length, mediaItems.length, unreadMessagesCount],
  );

  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      aria-label="Dashboard primary navigation"
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col justify-between border-r border-white/[0.08] bg-night p-6 select-none"
    >
      <div className="flex flex-col min-h-0 overflow-y-auto no-scrollbar">
        {/* Top Brand & Identity */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] shrink-0">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-mist">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-sky shadow-[0_0_0_3px_rgba(77,182,255,0.2)]"
              />
              <span>PORTFOLIO OS</span>
            </div>
            <div className="mt-1.5 font-display text-lg font-extrabold uppercase tracking-tight text-snow">
              Seif Ayman
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky/25 bg-sky/10 px-2.5 py-1 font-mono text-[10px] font-medium text-sky">
            <Radio className="size-2.5 animate-pulse" />
            <span>ONLINE</span>
          </span>
        </div>

        {/* Live Site Quick Link */}
        <div className="mt-4 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-mist hover:border-white/20 hover:text-snow transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span>theseif.vercel.app</span>
            </span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Navigation Sections */}
        <div className="mt-6 space-y-5 flex-1">
          {/* Core & Overview */}
          <div>
            <div className="mb-2 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-mist/60">
              Workspace
            </div>
            <nav className="space-y-1">
              {navItems
                .filter((item) => item.group === "core")
                .map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-200",
                        active
                          ? "bg-white/[0.08] text-snow border border-sky/30 shadow-sm"
                          : "text-mist hover:bg-white/[0.03] hover:text-snow border border-transparent",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "size-4 transition-colors",
                            active ? "text-sky" : "text-mist group-hover:text-snow",
                          )}
                        />
                        <span className="text-xs font-semibold tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-sky shadow-[0_0_8px_rgba(77,182,255,0.8)]"
                        />
                      ) : null}
                    </button>
                  );
                })}
            </nav>
          </div>

          {/* Content Management */}
          <div>
            <div className="mb-2 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-mist/60">
              Content Collections
            </div>
            <nav className="space-y-1">
              {navItems
                .filter((item) => item.group === "content")
                .map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-200",
                        active
                          ? "bg-white/[0.08] text-snow border border-sky/30 shadow-sm"
                          : "text-mist hover:bg-white/[0.03] hover:text-snow border border-transparent",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "size-4 transition-colors",
                            active ? "text-sky" : "text-mist group-hover:text-snow",
                          )}
                        />
                        <span className="text-xs font-semibold tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      {item.badge !== undefined ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-mono text-[10px] font-medium transition-colors",
                            active
                              ? "bg-sky/20 text-sky"
                              : "bg-white/[0.05] text-mist group-hover:bg-white/10 group-hover:text-snow",
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : active ? (
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-sky shadow-[0_0_8px_rgba(77,182,255,0.8)]"
                        />
                      ) : null}
                    </button>
                  );
                })}
            </nav>
          </div>

          {/* Assets & Comms */}
          <div>
            <div className="mb-2 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-mist/60">
              Assets & Inbox
            </div>
            <nav className="space-y-1">
              {navItems
                .filter((item) => item.group === "assets")
                .map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-200",
                        active
                          ? "bg-white/[0.08] text-snow border border-sky/30 shadow-sm"
                          : "text-mist hover:bg-white/[0.03] hover:text-snow border border-transparent",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "size-4 transition-colors",
                            active ? "text-sky" : "text-mist group-hover:text-snow",
                          )}
                        />
                        <span className="text-xs font-semibold tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      {item.badge !== undefined ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors",
                            item.key === "inbox" && Number(item.badge) > 0
                              ? "bg-sky text-night"
                              : active
                                ? "bg-sky/20 text-sky"
                                : "bg-white/[0.05] text-mist group-hover:bg-white/10 group-hover:text-snow",
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : active ? (
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-sky shadow-[0_0_8px_rgba(77,182,255,0.8)]"
                        />
                      ) : null}
                    </button>
                  );
                })}
            </nav>
          </div>

          {/* System */}
          <div>
            <div className="mb-2 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-mist/60">
              System
            </div>
            <nav className="space-y-1">
              {navItems
                .filter((item) => item.group === "system")
                .map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-200",
                        active
                          ? "bg-white/[0.08] text-snow border border-sky/30 shadow-sm"
                          : "text-mist hover:bg-white/[0.03] hover:text-snow border border-transparent",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "size-4 transition-colors",
                            active ? "text-sky" : "text-mist group-hover:text-snow",
                          )}
                        />
                        <span className="text-xs font-semibold tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-sky shadow-[0_0_8px_rgba(77,182,255,0.8)]"
                        />
                      ) : null}
                    </button>
                  );
                })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Identity & Status */}
      <div className="pt-4 border-t border-white/[0.08] space-y-3 shrink-0">
        {/* Revision Tag Status */}
        <div className="rounded-xl border border-white/[0.08] bg-night-2 p-2.5 font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between text-mist">
            <span>Working draft</span>
            <span className="text-snow font-medium">#{revision}</span>
          </div>
          <div className="flex items-center justify-between text-mist">
            <span>Live revision</span>
            <span className="text-snow font-medium">#{publishedRevision}</span>
          </div>
          <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] text-mist/70">Sync state</span>
            <span
              className={cn(
                "text-[10px] uppercase font-semibold",
                dirty
                  ? "text-amber-300"
                  : revision === publishedRevision
                    ? "text-emerald-400"
                    : "text-sky",
              )}
            >
              {dirty
                ? "Unsaved edits"
                : revision === publishedRevision
                  ? "In sync"
                  : "Unpublished"}
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-night-2 p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-night-3 text-xs font-bold text-snow">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={28}
                  height={28}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                user.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-snow">
                {user.name}
              </div>
              <div className="font-mono text-[9px] text-mist">Verified Admin</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            title="Sign out of workspace"
            aria-label="Sign out of workspace"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-mist hover:text-red-300 hover:border-red-500/30 transition-colors"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
