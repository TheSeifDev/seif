"use client";

import * as React from "react";
import Image from "next/image";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Command,
  History,
  Layers,
  LogOut,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardSectionKey, DashboardUser, NavItem } from "./dashboard-types";

export const dashboardNavItems: NavItem[] = [
  {
    key: "command-center",
    id: "command-center",
    label: "Command Center",
    number: "01",
    icon: Command,
  },
  {
    key: "metrics",
    id: "metrics",
    label: "Overview Metrics",
    number: "02",
    icon: BarChart3,
  },
  {
    key: "analytics",
    id: "analytics",
    label: "Content Analytics",
    number: "03",
    icon: Activity,
  },
  {
    key: "schedule",
    id: "schedule",
    label: "Publish Schedule",
    number: "04",
    icon: Calendar,
  },
  {
    key: "activity",
    id: "activity",
    label: "Recent Activity",
    number: "05",
    icon: History,
  },
  {
    key: "content-hub",
    id: "content-hub",
    label: "Content Hub",
    number: "06",
    icon: Layers,
  },
];

type DashboardSidebarProps = {
  activeSection: DashboardSectionKey;
  onNavigate: (sectionKey: DashboardSectionKey) => void;
  user: DashboardUser;
  onLogout: () => void;
  revision: number;
  publishedRevision: number;
  dirty: boolean;
};

export function DashboardSidebar({
  activeSection,
  onNavigate,
  user,
  onLogout,
  revision,
  publishedRevision,
  dirty,
}: DashboardSidebarProps) {
  return (
    <aside
      aria-label="Dashboard primary navigation"
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col justify-between border-r border-white/[0.08] bg-night p-6 select-none"
    >
      {/* Top Brand & Identity */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-mist">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-sky shadow-[0_0_0_3px_rgba(77,182,255,0.2)]"
              />
              <span>PORTFOLIO OS</span>
            </div>
            <div className="mt-2 font-display text-xl font-extrabold uppercase tracking-tight text-snow">
              Seif Ayman
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky/25 bg-sky/10 px-2.5 py-1 font-mono text-[10px] font-medium text-sky">
            <Radio className="size-2.5 animate-pulse" />
            <span>ACTIVE</span>
          </span>
        </div>

        {/* Live Site Quick Link */}
        <div className="mt-5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-mist hover:border-white/20 hover:text-snow transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span>theseif.vercel.app</span>
            </span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Navigation Sections */}
        <div className="mt-8">
          <div className="mb-3 px-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-mist/60">
            Navigation Index
          </div>
          <nav className="space-y-1.5">
            {dashboardNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={cn(
                    "group relative flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-all duration-200",
                    isActive
                      ? "bg-white/[0.08] text-snow border border-sky/30 shadow-sm"
                      : "text-mist hover:bg-white/[0.03] hover:text-snow border border-transparent",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "font-mono text-[11px] font-medium tracking-wider transition-colors",
                        isActive ? "text-sky" : "text-mist/50 group-hover:text-mist",
                      )}
                    >
                      {item.number}
                    </span>
                    <Icon
                      className={cn(
                        "size-4 transition-colors",
                        isActive ? "text-sky" : "text-mist group-hover:text-snow",
                      )}
                    />
                    <span className="text-xs font-medium tracking-tight">
                      {item.label}
                    </span>
                  </div>

                  {isActive ? (
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

      {/* Bottom Identity & Status */}
      <div className="pt-6 border-t border-white/[0.08] space-y-4">
        {/* Revision Tag Status */}
        <div className="rounded-2xl border border-white/[0.08] bg-night-2 p-3 font-mono text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-mist">
            <span>Working draft</span>
            <span className="text-snow font-medium">#{revision}</span>
          </div>
          <div className="flex items-center justify-between text-mist">
            <span>Live revision</span>
            <span className="text-snow font-medium">#{publishedRevision}</span>
          </div>
          <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between">
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
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-night-2 p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-night-3 text-xs font-bold text-snow">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={32}
                  height={32}
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
              <div className="font-mono text-[10px] text-mist">Verified Admin</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out of workspace"
            aria-label="Sign out of workspace"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-mist hover:text-red-300 hover:border-red-500/30 transition-colors"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
