"use client";

import * as React from "react";
import type { SiteContent } from "@/lib/cms/schema";
import { useDashboard } from "../dashboard-context";
import { EditorSection, SectionHeading, sectionLabels } from "../dashboard-workspace";

export function AboutPage() {
  const { content, update } = useDashboard();

  const sections = [
    "profile",
    "identity",
    "experience",
    "education",
    "training",
    "principles",
    "journey",
    "processSteps",
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Content / Profile"
        title="About & Identity"
        description="Edit the personal biography, career experience timeline, education, training certifications, core principles, journey milestones, and process steps."
      />

      <div className="space-y-5">
        {sections.map((key) => (
          <EditorSection
            key={key}
            title={sectionLabels[key] || key}
            description={`Edit the ${key.toLowerCase()} records used by the public site.`}
            value={content[key as keyof SiteContent]}
            path={[key]}
            update={update}
          />
        ))}
      </div>
    </div>
  );
}

