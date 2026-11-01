"use client";

import * as React from "react";
import { useDashboard } from "../dashboard-context";
import { EditorSection, SectionHeading } from "../dashboard-workspace";

export function SeoPage() {
  const { content, update } = useDashboard();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="System / Indexing"
        title="Search Appearance & SEO"
        description="Public meta titles, descriptions, canonical URL rules, and robots indexing controls. Changes take effect on the public site after Save and Publish."
      />

      <EditorSection
        title="Search appearance"
        description="Public metadata and robots controls. Changes still require Save, then Publish."
        value={content.seo}
        path={["seo"]}
        update={update}
      />
    </div>
  );
}

