"use client";

import * as React from "react";
import {
  Menu,
  Radio,
  X,
  Send,
  Save,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentHubKey, DashboardSectionKey, DashboardUser } from "./dashboard-types";
import { dashboardNavItems } from "./dashboard-sidebar";

type DashboardMobileNavProps = {
  activeSection: DashboardSectionKey;
  onNavigate: (sectionKey: DashboardSectionKey) => void;
  onOpenContentHub: (hubKey: ContentHubKey) => void;
  user: DashboardUser;
  onLogout: () => void;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  configured: boolean;
  onSave: () => void;
  onPublish: () => void;
};

const contentShortcuts: Array<{ key: ContentHubKey; label: string }> = [
  { key: "projects", label: "Projects" },
  { key: "blog", label: "Blog" },
  { key: "about", label: "About" },
  { key: "skills", label: "Skills" },
  { key: "home", label: "Home" },
  { key: "media", label: "Media" },
  { key: "inbox", label: "Inbox" },
  { key: "seo", label: "SEO" },
  { key: "settings", label: "Settings" },
];

export function DashboardMobileNav({
  activeSection,
  onNavigate,
  onOpenContentHub,
  user,
  onLogout,
  dirty,
  saving,
  publishing,
  configured,
  onSave,
  onPublish,
}: DashboardMobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="lg:hidden sticky top-0 z-40 border-b border-white/[0.08] bg-night/90 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        {/* Left Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-night-2 border border-white/10 text-xs font-bold text-snow">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
              <span className="size-1 rounded-full bg-sky" />
              <span>CMS OS</span>
            </div>
            <div className="font-display text-sm font-bold text-snow">
              Seif Ayman
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !configured}
              aria-label="Save working changes"
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-snow px-3 text-[11px] font-semibold text-night"
            >
              <Save className="size-3" />
              <span>{saving ? "Saving" : "Save"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || !configured}
            aria-label="Publish working changes"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-sky px-3 text-[11px] font-semibold text-night"
          >
            <Send className="size-3" />
            <span>Publish</span>
          </button>

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-night-2 text-snow hover:border-sky/50 transition-colors"
            aria-label="Open admin navigation"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      {/* Slide-in Mobile Drawer */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin Navigation Drawer"
          className="fixed inset-0 z-50 flex flex-col bg-night/95 backdrop-blur-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
              <Radio className="size-3 text-sky animate-pulse" />
              <span>ADMIN NAVIGATION</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-snow hover:bg-white/10"
              aria-label="Close admin navigation"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Section Links */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
                Dashboard Chapters
              </div>
              <div className="space-y-1">
                {dashboardNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => {
                        onNavigate(item.key);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl px-4 py-3 text-left font-display text-base font-bold uppercase tracking-tight transition-colors",
                        isActive
                          ? "bg-white/[0.08] text-sky border border-sky/30"
                          : "text-snow hover:bg-white/[0.03] border border-transparent",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className={cn("size-4", isActive ? "text-sky" : "text-mist")}
                        />
                        <span>{item.label}</span>
                      </span>
                      <span aria-hidden="true" className="font-mono text-xs text-mist">{item.number}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Hub Fast Jump Shortcuts */}
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
                Content Hub Editors
              </div>
              <div className="grid grid-cols-2 gap-2">
                {contentShortcuts.map((shortcut) => (
                  <button
                    type="button"
                    key={shortcut.key}
                    onClick={() => {
                      onOpenContentHub(shortcut.key);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-night-2 p-3 text-left text-xs font-medium text-snow hover:border-sky/40 hover:text-sky transition-colors"
                  >
                    <span>{shortcut.label}</span>
                    <span aria-hidden="true" className="font-mono text-[10px] text-mist/60">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-mist">
            <span className="truncate max-w-[180px]">{user.name}</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 text-red-300 hover:text-red-200"
            >
              <LogOut className="size-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
