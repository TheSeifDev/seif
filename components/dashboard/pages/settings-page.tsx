"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { useDashboard } from "../dashboard-context";
import { NotchedPanel, SectionHeading, SettingsPanel } from "../dashboard-workspace";

export function SettingsPage() {
  const {
    configured,
    revision,
    publishedRevision,
    savedContent,
    applyRestoredRevision,
    setNotice,
  } = useDashboard();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="System / Maintenance"
        title="Settings & Revision History"
        description="Inspect Neon PostgreSQL connection health, Vercel Blob readiness, OAuth authentication identity, omnichannel notifications, and audit the complete revision history."
      />

      <NotchedPanel className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky/30 bg-sky/10 text-sky">
              <Bell className="size-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                Omnichannel Alerting
              </div>
              <h3 className="mt-0.5 text-base font-semibold text-snow">
                Notification Channels, Web Push PWA & Delivery Outbox
              </h3>
              <p className="mt-1 text-xs text-mist max-w-2xl">
                Configure Gmail (Resend), Chrome Web Push on Windows & Android,
                and WhatsApp Business Cloud API alerts, manage subscribed
                devices, and retry failed deliveries.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/notifications"
            className="inline-flex items-center gap-2 rounded-xl bg-sky px-4 py-2.5 text-xs font-bold text-night hover:bg-sky/90 transition-colors"
          >
            Open Notification Settings <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </NotchedPanel>

      <SettingsPanel
        configured={configured}
        revision={revision}
        publishedRevision={publishedRevision}
        savedContent={savedContent}
        onRestore={(nextContent, nextRevision, nextPublished) => {
          applyRestoredRevision(nextContent, nextRevision, nextPublished);
        }}
        onNotice={setNotice}
      />
    </div>
  );
}
