"use client";

import * as React from "react";
import { useDashboard } from "../dashboard-context";
import { SectionHeading, SettingsPanel } from "../dashboard-workspace";

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
        description="Inspect Neon PostgreSQL connection health, Vercel Blob readiness, OAuth authentication identity, and audit the complete revision history."
      />

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

