"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpRight,
  Calendar,
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
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard, useNow } from "./dashboard-context";

export type NavGroupKey = "overview" | "content" | "operations" | "insights" | "system";

export type SidebarNavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeTone?: "sky" | "amber" | "neutral";
  group: NavGroupKey;
};

export const dashboardNavItems = [
  { key: "command-center", id: "command-center", label: "Command Center", number: "01", icon: LayoutDashboard },
  { key: "metrics", id: "metrics", label: "Overview Metrics", number: "02", icon: TrendingUp },
  { key: "analytics", id: "analytics", label: "Content Analytics", number: "03", icon: TrendingUp },
  { key: "schedule", id: "schedule", label: "Publish Schedule", number: "04", icon: Calendar },
  { key: "activity", id: "activity", label: "Recent Activity", number: "05", icon: LayoutDashboard },
  { key: "content-hub", id: "content-hub", label: "Content Hub", number: "06", icon: FolderGit2 },
];

export function DashboardSidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    content,
    revision,
    publishedRevision,
    dirty,
    user,
    logout,
    unreadMessagesCount,
    mediaItems,
  } = useDashboard();

  // Prefetch all dashboard routes on mount for instant client transitions
  React.useEffect(() => {
    const routes = [
      "/dashboard",
      "/dashboard/home",
      "/dashboard/projects",
      "/dashboard/blog",
      "/dashboard/about",
      "/dashboard/skills",
      "/dashboard/schedule",
      "/dashboard/media",
      "/dashboard/inbox",
      "/dashboard/analytics",
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

  // Current client timestamp via useSyncExternalStore
  const now = useNow();

  // Scheduled count
  const scheduledCount = React.useMemo(() => {
    if (!now) return 0;
    return content.posts.filter(
      (p) =>
        p.status === "published" &&
        p.publishedAt &&
        new Date(p.publishedAt).getTime() > now,
    ).length;
  }, [content.posts, now]);

  // Structured Navigation Groups as demanded by user specification
  const navGroups: Array<{
    key: NavGroupKey;
    label: string;
    items: SidebarNavItem[];
  }> = React.useMemo(
    () => [
      {
        key: "overview",
        label: "OVERVIEW",
        items: [
          {
            key: "overview",
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            group: "overview",
          },
        ],
      },
      {
        key: "content",
        label: "CONTENT",
        items: [
          {
            key: "home",
            label: "Home",
            href: "/dashboard/home",
            icon: Globe,
            group: "content",
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
            badgeTone: content.posts.some((p) => p.reviewRequired) ? "amber" : "neutral",
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
        ],
      },
      {
        key: "operations",
        label: "OPERATIONS",
        items: [
          {
            key: "schedule",
            label: "Schedule",
            href: "/dashboard/schedule",
            icon: Calendar,
            badge: scheduledCount > 0 ? scheduledCount : undefined,
            badgeTone: "sky",
            group: "operations",
          },
          {
            key: "media",
            label: "Media",
            href: "/dashboard/media",
            icon: ImageIcon,
            badge: mediaItems.length > 0 ? mediaItems.length : undefined,
            group: "operations",
          },
          {
            key: "inbox",
            label: "Inbox",
            href: "/dashboard/inbox",
            icon: Mail,
            badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
            badgeTone: "sky",
            group: "operations",
          },
        ],
      },
      {
        key: "insights",
        label: "INSIGHTS",
        items: [
          {
            key: "analytics",
            label: "Analytics",
            href: "/dashboard/analytics",
            icon: TrendingUp,
            group: "insights",
          },
          {
            key: "seo",
            label: "SEO",
            href: "/dashboard/seo",
            icon: Search,
            group: "insights",
          },
        ],
      },
      {
        key: "system",
        label: "SYSTEM",
        items: [
          {
            key: "settings",
            label: "Settings",
            href: "/dashboard/settings",
            icon: Settings2,
            group: "system",
          },
        ],
      },
    ],
    [content.projects.length, content.posts, mediaItems.length, unreadMessagesCount, scheduledCount],
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
      className={cn(
        "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col justify-between border-r border-white/[0.08] bg-night select-none transition-all duration-300 ease-out",
        collapsed ? "w-18 p-3" : "w-64 p-5",
      )}
    >
      <div className="flex flex-col min-h-0 overflow-y-auto no-scrollbar">
        {/* Top Brand & Identity */}
        <div
          className={cn(
            "flex items-center pb-4 border-b border-white/[0.08] shrink-0",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed ? (
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-mist">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-sky shadow-[0_0_0_3px_rgba(77,182,255,0.2)]"
                />
                <span>PORTFOLIO OS</span>
              </div>
              <div className="mt-1 font-display text-base font-extrabold uppercase tracking-tight text-snow">
                Seif Ayman
              </div>
            </div>
          ) : (
            <div
              title="Portfolio OS — Seif Ayman"
              className="size-8 rounded-xl border border-sky/30 bg-sky/10 flex items-center justify-center font-display text-xs font-black text-sky"
            >
              SA
            </div>
          )}

          {!collapsed && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky/25 bg-sky/10 px-2 py-0.5 font-mono text-[9px] font-medium text-sky">
              <Radio className="size-2 animate-pulse" />
              <span>LIVE</span>
            </span>
          )}
        </div>

        {/* Live Site Link */}
        {!collapsed && (
          <div className="mt-3 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-mist hover:border-white/20 hover:text-snow transition-all"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">theseif.vercel.app</span>
              </span>
              <ArrowUpRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="mt-5 space-y-4 flex-1">
          {navGroups.map((group) => (
            <div key={group.key}>
              {!collapsed ? (
                <div className="mb-1 px-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-mist/60">
                  {group.label}
                </div>
              ) : (
                <div className="my-2 border-t border-white/[0.06]" />
              )}

              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <Link
                      href={item.href}
                      role="button"
                      key={item.key}
                      title={collapsed ? item.label : undefined}
                      aria-label={item.label}
                      className={cn(
                        "group relative flex w-full items-center rounded-xl text-left transition-all duration-200",
                        collapsed
                          ? "size-10 justify-center mx-auto"
                          : "justify-between px-3 py-2",
                        active
                          ? "bg-sky/15 text-snow border border-sky/35 shadow-[0_0_16px_-4px_rgba(77,182,255,0.3)] font-semibold"
                          : "text-mist hover:bg-white/[0.04] hover:text-snow border border-transparent font-medium",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            active
                              ? "text-sky"
                              : "text-mist group-hover:text-snow",
                          )}
                        />
                        {!collapsed && (
                          <span className="text-xs tracking-tight truncate">
                            {item.label}
                          </span>
                        )}
                      </div>

                      {/* Badges */}
                      {!collapsed && item.badge !== undefined && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors",
                            item.badgeTone === "sky"
                              ? "bg-sky text-night"
                              : item.badgeTone === "amber"
                                ? "bg-amber-400 text-night"
                                : active
                                  ? "bg-sky/20 text-sky"
                                  : "bg-white/[0.06] text-mist group-hover:bg-white/10 group-hover:text-snow",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Collapsed dot badge */}
                      {collapsed && item.badge !== undefined && (
                        <span
                          className={cn(
                            "absolute top-1 right-1 size-2 rounded-full",
                            item.badgeTone === "sky"
                              ? "bg-sky"
                              : item.badgeTone === "amber"
                                ? "bg-amber-400"
                                : "bg-snow",
                          )}
                        />
                      )}

                      {/* Active indicator bar */}
                      {active && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute rounded-full bg-sky shadow-[0_0_8px_rgba(77,182,255,0.8)]",
                            collapsed
                              ? "left-0 top-2 bottom-2 w-1"
                              : "right-1.5 size-1.5",
                          )}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Identity, Collapse Control & Status */}
      <div className="pt-3 border-t border-white/[0.08] space-y-2.5 shrink-0">
        {/* Collapse toggle button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full items-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-mist hover:text-snow hover:bg-white/[0.05] transition-colors py-1.5",
              collapsed ? "justify-center px-1" : "justify-between px-2.5",
            )}
          >
            {!collapsed && (
              <span className="font-mono text-[10px] uppercase tracking-wider">
                Collapse Rail
              </span>
            )}
            {collapsed ? (
              <ArrowRightToLine className="size-3.5" />
            ) : (
              <ArrowLeftToLine className="size-3.5" />
            )}
          </button>
        )}

        {/* Revision Tag Status */}
        {!collapsed && (
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
        )}

        {/* User Card */}
        <div
          className={cn(
            "flex items-center rounded-xl border border-white/10 bg-night-2",
            collapsed ? "p-1.5 justify-center" : "justify-between gap-2 p-2",
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
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
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-snow">
                  {user.name}
                </div>
                <div className="font-mono text-[9px] text-mist">Verified Admin</div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            title="Sign out of workspace"
            aria-label="Sign out of workspace"
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-mist hover:text-red-300 hover:border-red-500/30 transition-colors",
              collapsed ? "size-7 mt-1" : "size-7",
            )}
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
