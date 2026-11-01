"use client";

import * as React from "react";
import { useDashboard } from "../dashboard-context";
import { MediaPanel, SectionHeading } from "../dashboard-workspace";

export function MediaPage() {
  const { setNotice, loadMedia } = useDashboard();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Storage / Assets"
        title="Media Library"
        description="Upload images and media assets to Vercel Blob store. Copied stable URLs can be pasted into project image fields and blog articles."
      />

      <MediaPanel
        onUse={(url) => {
          setNotice({
            tone: "info",
            message: `Stable media URL copied to clipboard: ${url}`,
          });
          void navigator.clipboard?.writeText(url);
          void loadMedia();
        }}
      />
    </div>
  );
}

