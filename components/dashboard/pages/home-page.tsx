"use client";

import * as React from "react";
import type { SiteContent } from "@/lib/cms/schema";
import { useDashboard } from "../dashboard-context";
import { EditorSection, SectionHeading, sectionLabels } from "../dashboard-workspace";

export function HomePage() {
  const { content, update } = useDashboard();

  const sections = ["assets", "navigation", "copy"];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Content / Global"
        title="Home & Global Copy"
        description="Stable public asset paths, header/footer navigation items, and editable copy strings rendered across the public website."
      />

      <div className="space-y-5">
        {sections.map((key) => (
          <EditorSection
            key={key}
            title={sectionLabels[key] || key}
            description={
              key === "assets"
                ? "Stable public asset paths and uploaded media URLs."
                : key === "navigation"
                  ? "Header and mobile drawer navigation links."
                  : "Public copy strings for hero, identity, callout headlines, and footer."
            }
            value={content[key as keyof SiteContent]}
            path={[key]}
            update={update}
          />
        ))}
      </div>
    </div>
  );
}

