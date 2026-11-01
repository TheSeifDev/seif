"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Check,
  CircleAlert,
  FolderGit2,
  FileText,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  RefreshCcw,
  Search,
  Send,
  Settings2,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./dashboard-context";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { buttonAccent, buttonSecondary } from "./dashboard-workspace";
import type { DashboardSidebarNavItem } from "./dashboard-types";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    revision,
    publishedRevision,
    publishing,
    notice,
    setNotice,
    configured,
    confirmPublish,
    setConfirmPublish,
    publish,
    publishCancelRef,
    user,
    logout,
    content,
    unreadMessagesCount,
    mediaItems,
  } = useDashboard();

  // Handle escape key to cancel publish modal (asserted by automated integration test)
  React.useEffect(() => {
    if (!confirmPublish) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmPublish(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmPublish, setConfirmPublish]);

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

  return (
    <div className="relative min-h-screen bg-night text-snow selection:bg-sky selection:text-night">
      {/* Desktop Persistent Sidebar */}
      <DashboardSidebar />

      {/* Mobile Drawer Backdrop & Navigation */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-night/80 backdrop-blur-md flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation drawer"
        >
          <div className="w-80 max-w-[85vw] bg-night border-r border-white/10 p-6 flex flex-col justify-between h-full overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
                <div className="font-display text-lg font-extrabold uppercase tracking-tight text-snow">
                  Seif Ayman
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="size-8 rounded-lg border border-white/10 flex items-center justify-center text-mist hover:text-snow"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </div>

              <nav className="mt-6 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => {
                        router.push(item.href);
                        setMobileNavOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-colors",
                        active
                          ? "bg-sky/15 text-sky border border-sky/30"
                          : "text-mist hover:bg-white/[0.04] hover:text-snow",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="rounded-full bg-white/[0.08] px-2 py-0.5 font-mono text-[10px]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-snow font-medium truncate">
                {user.name}
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="text-xs text-mist hover:text-red-300 font-mono"
              >
                Sign out
              </button>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <DashboardTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main id="main" className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Global Notice Toast */}
          {notice && (
            <div
              role="alert"
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-sm backdrop-blur-md transition-all shadow-sm",
                notice.tone === "success" &&
                  "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
                notice.tone === "error" &&
                  "border-red-500/20 bg-red-500/10 text-red-200",
                notice.tone === "info" && "border-sky/20 bg-sky/10 text-sky",
              )}
            >
              <div className="mt-0.5 shrink-0">
                {notice.tone === "success" ? (
                  <Check className="size-4 text-emerald-400" />
                ) : notice.tone === "error" ? (
                  <CircleAlert className="size-4 text-red-400" />
                ) : (
                  <Activity className="size-4 text-sky" />
                )}
              </div>
              <div className="min-w-0 flex-1 break-words font-medium">
                {notice.message}
              </div>
              <button
                type="button"
                className="text-current/60 hover:text-current transition-colors"
                onClick={() => setNotice(null)}
                aria-label="Dismiss notice"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* CMS Configuration Alert */}
          {!configured && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200 leading-relaxed">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-400" />
              <div>
                <strong className="font-semibold text-snow">
                  CMS readiness is incomplete.
                </strong>{" "}
                You can inspect the workspace, but saves and publishing are
                disabled until the server reports configured readiness. Secret
                values are never shown here.
              </div>
            </div>
          )}

          {/* Child Page Content */}
          {children}
        </main>
      </div>

      {/* Confirm Publish Modal Dialog */}
      {confirmPublish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 p-4 backdrop-blur-md"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-dialog-title"
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-night-2 p-6 sm:p-8 text-snow shadow-[0_25px_100px_rgba(0,0,0,0.7)]"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-sky"
                  />
                  <span>PUBLIC ACTION</span>
                </div>
                <h2
                  id="publish-dialog-title"
                  className="font-display text-2xl font-bold tracking-tight text-snow"
                >
                  Publish revision {revision}?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mist">
                  This makes the current saved working revision visible on the
                  public portfolio. It does not upload, seed, or fabricate
                  content. Draft projects and posts remain private.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-mist hover:text-snow hover:bg-white/10 transition-colors"
                onClick={() => setConfirmPublish(false)}
                aria-label="Close publish confirmation"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-night-3 p-4 text-xs text-mist leading-relaxed font-mono">
              <div className="flex justify-between">
                <span>Working revision:</span>
                <span className="text-snow font-medium">#{revision}</span>
              </div>
              <div className="flex justify-between">
                <span>Current public revision:</span>
                <span className="text-snow font-medium">#{publishedRevision}</span>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
              <button
                ref={publishCancelRef}
                type="button"
                className={buttonSecondary}
                onClick={() => setConfirmPublish(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={buttonAccent}
                disabled={publishing}
                onClick={() => void publish()}
              >
                {publishing ? (
                  <RefreshCcw className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>{publishing ? "Publishing" : "Publish revision"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
