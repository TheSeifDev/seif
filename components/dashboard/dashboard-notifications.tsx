"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  FileText,
  Mail,
  RefreshCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useDashboard, useNow } from "./dashboard-context";

export function DashboardNotifications({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    unreadMessagesCount,
    content,
    dirty,
    save,
    saving,
    configured,
  } = useDashboard();

  const now = useNow();

  // Find posts requiring review
  const reviewRequiredPosts = content.posts.filter((p) => p.reviewRequired);

  // Scheduled posts (future date or draft with scheduledAt)
  const scheduledPosts = React.useMemo(() => {
    if (!now) return [];
    return content.posts.filter(
      (p) =>
        p.status === "published" &&
        p.publishedAt &&
        new Date(p.publishedAt).getTime() > now,
    );
  }, [content.posts, now]);

  const notificationsCount =
    unreadMessagesCount +
    reviewRequiredPosts.length +
    (dirty ? 1 : 0) +
    (!configured ? 1 : 0);

  if (!open) return null;

  return (
    <div
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-white/10 bg-night-2 p-4 text-snow shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-md"
      role="region"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-sky" />
          <span className="font-display text-sm font-bold tracking-tight text-snow">
            Notifications
          </span>
          {notificationsCount > 0 && (
            <span className="rounded-full bg-sky/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky">
              {notificationsCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-mist hover:text-snow hover:bg-white/[0.05] transition-colors"
          aria-label="Close notifications"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
        {/* Unsaved changes alert */}
        {dirty && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 flex items-start gap-2.5">
            <CircleAlert className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-amber-200">
                Unsaved working draft
              </div>
              <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                You have draft changes that have not yet been saved to PostgreSQL.
              </p>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-night hover:bg-amber-300 disabled:opacity-50"
              >
                {saving && <RefreshCcw className="size-2.5 animate-spin" />}
                <span>Save draft now</span>
              </button>
            </div>
          </div>
        )}

        {/* CMS readiness alert */}
        {!configured && (
          <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 flex items-start gap-2.5">
            <CircleAlert className="size-4 text-red-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-red-200">
                CMS readiness incomplete
              </div>
              <p className="text-[11px] text-red-200/80 mt-0.5">
                Check Settings to verify PostgreSQL and Vercel Blob readiness.
              </p>
              <Link
                href="/dashboard/settings"
                onClick={onClose}
                className="mt-2 inline-block text-[10px] font-mono text-red-300 underline"
              >
                View system readiness →
              </Link>
            </div>
          </div>
        )}

        {/* Unread Contact Messages */}
        {unreadMessagesCount > 0 && (
          <div className="rounded-xl border border-sky/25 bg-sky/10 p-3 flex items-start gap-2.5">
            <Mail className="size-4 text-sky shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-snow">
                {unreadMessagesCount} unread message{unreadMessagesCount > 1 ? "s" : ""}
              </div>
              <p className="text-[11px] text-mist mt-0.5">
                New contact inquiries awaiting review in the Inbox.
              </p>
              <Link
                href="/dashboard/inbox"
                onClick={onClose}
                className="mt-2 inline-block text-[10px] font-mono text-sky hover:underline"
              >
                Open Inbox →
              </Link>
            </div>
          </div>
        )}

        {/* Articles requiring review */}
        {reviewRequiredPosts.length > 0 && (
          <div className="rounded-xl border border-white/[0.08] bg-night-3/70 p-3 flex items-start gap-2.5">
            <FileText className="size-4 text-mist shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-snow">
                {reviewRequiredPosts.length} article{reviewRequiredPosts.length > 1 ? "s" : ""} need review
              </div>
              <p className="text-[11px] text-mist mt-0.5">
                Articles marked &ldquo;review required&rdquo; cannot be published until reviewed.
              </p>
              <Link
                href="/dashboard/blog"
                onClick={onClose}
                className="mt-2 inline-block text-[10px] font-mono text-sky hover:underline"
              >
                Review articles →
              </Link>
            </div>
          </div>
        )}

        {/* Scheduled Articles */}
        {scheduledPosts.length > 0 && (
          <div className="rounded-xl border border-white/[0.08] bg-night-3/70 p-3 flex items-start gap-2.5">
            <Sparkles className="size-4 text-sky shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-snow">
                {scheduledPosts.length} scheduled article{scheduledPosts.length > 1 ? "s" : ""}
              </div>
              <p className="text-[11px] text-mist mt-0.5">
                Content queued with future publication dates.
              </p>
              <Link
                href="/dashboard/schedule"
                onClick={onClose}
                className="mt-2 inline-block text-[10px] font-mono text-sky hover:underline"
              >
                View calendar →
              </Link>
            </div>
          </div>
        )}

        {/* All Clear state */}
        {notificationsCount === 0 && (
          <div className="p-6 text-center">
            <CheckCircle2 className="size-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-snow">All systems nominal</div>
            <p className="text-[11px] text-mist mt-1">
              No unread messages, review requirements, or unsaved changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
