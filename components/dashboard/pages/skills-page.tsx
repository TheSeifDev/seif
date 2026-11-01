"use client";

import * as React from "react";
import type { SiteContent } from "@/lib/cms/schema";
import { useDashboard } from "../dashboard-context";
import { EditorSection, SectionHeading, sectionLabels } from "../dashboard-workspace";

export function SkillsPage() {
  const { content, update } = useDashboard();

  const sections = ["skillGroups", "marqueeRows"];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Content / Taxonomy"
        title="Skills & Marquee Rows"
        description="Configure categorized skill groups and infinite marquee tickers rendered across public Home and About pages."
      />

      <div className="space-y-5">
        {sections.map((key) => (
          <EditorSection
            key={key}
            title={sectionLabels[key] || key}
            description="Keep this collection ordered; the public site renders it in this exact sequence."
            value={content[key as keyof SiteContent]}
            path={[key]}
            update={update}
          />
        ))}
      </div>
    </div>
  );
}

