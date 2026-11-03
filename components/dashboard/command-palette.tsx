"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  FileText,
  FolderGit2,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Settings2,
  Sparkles,
  TrendingUp,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./dashboard-context";

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  console.log("COMMAND PALETTE RENDER, open=", open);
  if (!open) return null;
  return <CommandPaletteModal onClose={onClose} />;
}

function CommandPaletteModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { content, save, openPublishModal, discard, dirty } = useDashboard();

  React.useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, []);

  // Global escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const items = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      category: "Navigation" | "Actions" | "Projects" | "Articles";
      icon: React.ComponentType<{ className?: string }>;
      shortcut?: string;
      run: () => void;
    }> = [
      // Navigation
      {
        id: "nav-overview",
        title: "Go to Dashboard Overview",
        category: "Navigation",
        icon: LayoutDashboard,
        run: () => router.push("/dashboard"),
      },
      {
        id: "nav-projects",
        title: "Go to Projects Management",
        category: "Navigation",
        icon: FolderGit2,
        run: () => router.push("/dashboard/projects"),
      },
      {
        id: "nav-blog",
        title: "Go to Blog Articles",
        category: "Navigation",
        icon: FileText,
        run: () => router.push("/dashboard/blog"),
      },
      {
        id: "nav-about",
        title: "Go to About & Identity",
        category: "Navigation",
        icon: UserCheck,
        run: () => router.push("/dashboard/about"),
      },
      {
        id: "nav-skills",
        title: "Go to Skills & Taxonomy",
        category: "Navigation",
        icon: Sparkles,
        run: () => router.push("/dashboard/skills"),
      },
      {
        id: "nav-home",
        title: "Go to Home & Site Copy",
        category: "Navigation",
        icon: Globe,
        run: () => router.push("/dashboard/home"),
      },
      {
        id: "nav-schedule",
        title: "Go to Schedule & Calendar",
        category: "Navigation",
        icon: Calendar,
        run: () => router.push("/dashboard/schedule"),
      },
      {
        id: "nav-media",
        title: "Go to Media Library",
        category: "Navigation",
        icon: ImageIcon,
        run: () => router.push("/dashboard/media"),
      },
      {
        id: "nav-inbox",
        title: "Go to Messages Inbox",
        category: "Navigation",
        icon: Mail,
        run: () => router.push("/dashboard/inbox"),
      },
      {
        id: "nav-analytics",
        title: "Go to Analytics & Telemetry",
        category: "Navigation",
        icon: TrendingUp,
        run: () => router.push("/dashboard/analytics"),
      },
      {
        id: "nav-seo",
        title: "Go to SEO & Search Engine Config",
        category: "Navigation",
        icon: Search,
        run: () => router.push("/dashboard/seo"),
      },
      {
        id: "nav-settings",
        title: "Go to Settings & System Revisions",
        category: "Navigation",
        icon: Settings2,
        run: () => router.push("/dashboard/settings"),
      },
      {
        id: "nav-notifications",
        title: "Go to Notification Channels & Outbox Settings",
        category: "Navigation",
        icon: Bell,
        run: () => router.push("/dashboard/settings/notifications"),
      },
      // Quick Actions
      {
        id: "act-save",
        title: "Save Current Draft",
        category: "Actions",
        icon: RefreshCcw,
        shortcut: "Save",
        run: () => void save(),
      },
      {
        id: "act-publish",
        title: "Publish Working Revision to Production",
        category: "Actions",
        icon: Send,
        shortcut: "Publish",
        run: () => openPublishModal(),
      },
      ...(dirty
        ? [
            {
              id: "act-discard",
              title: "Discard In-Memory Draft Edits",
              category: "Actions" as const,
              icon: X,
              run: () => discard(),
            },
          ]
        : []),
      {
        id: "act-new-project",
        title: "Create New Project Case Study",
        category: "Actions",
        icon: Plus,
        run: () => router.push("/dashboard/projects"),
      },
      {
        id: "act-new-post",
        title: "Write New Technical Article",
        category: "Actions",
        icon: Plus,
        run: () => router.push("/dashboard/blog"),
      },
      // Content items
      ...content.projects.map((p) => ({
        id: `project-${p.slug}`,
        title: `Project: ${p.title}`,
        category: "Projects" as const,
        icon: FolderGit2,
        run: () => router.push("/dashboard/projects"),
      })),
      ...content.posts.map((post) => ({
        id: `post-${post.slug}`,
        title: `Article: ${post.title}`,
        category: "Articles" as const,
        icon: FileText,
        run: () => router.push("/dashboard/blog"),
      })),
    ];

    if (!query.trim()) return list.slice(0, 10);
    const q = query.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [content.projects, content.posts, query, router, save, openPublishModal, discard, dirty]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = items[selectedIndex];
      if (current) {
        current.run();
        onClose();
      }
    }
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-night/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-night-2 text-snow shadow-[0_25px_100px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-night-3/50">
          <Search className="size-4 text-mist shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, page name, project, or action..."
            className="w-full bg-transparent text-sm text-snow placeholder:text-mist/50 outline-none font-sans"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-mist">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-white/[0.04]">
          {items.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-mist">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      item.run();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition-colors",
                      isSelected
                        ? "bg-sky/15 text-snow border border-sky/30 shadow-sm"
                        : "text-mist hover:bg-white/[0.03] hover:text-snow border border-transparent",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={cn("size-4 shrink-0", isSelected ? "text-sky" : "text-mist")} />
                      <span className="font-medium text-snow truncate">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-mist/60 rounded px-1.5 py-0.5 bg-white/[0.04]">
                        {item.category}
                      </span>
                      {item.shortcut && (
                        <span className="font-mono text-[10px] text-sky font-semibold">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-night-3/30 flex items-center justify-between font-mono text-[10px] text-mist">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span>Portfolio Control Center</span>
        </div>
      </div>
    </div>
  );
}
