"use client";

import * as React from "react";
import { useDashboard } from "../dashboard-context";
import { ProjectEditor, SectionHeading } from "../dashboard-workspace";

export function ProjectsPage() {
  const { content, updateContent, deleteItem } = useDashboard();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Content / Collection"
        title="Projects"
        description="Manage case studies, featured state, visibility, and structured project detail. Changes save to your working draft."
      />
      <ProjectEditor
        projects={content.projects}
        update={(value) =>
          updateContent((current) => ({ ...current, projects: value }))
        }
        onDelete={(index) => deleteItem("projects", index)}
      />
    </div>
  );
}

