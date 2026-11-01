"use client";

import * as React from "react";
import { useDashboard } from "../dashboard-context";
import { BlogEditor, SectionHeading } from "../dashboard-workspace";

export function BlogPage() {
  const { content, updateContent, deleteItem } = useDashboard();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Content / Collection"
        title="Blog Articles"
        description="Write structured technical articles with ordered blocks and explicit draft/public states. Private previews are available for drafts."
      />
      <BlogEditor
        posts={content.posts}
        update={(value) =>
          updateContent((current) => ({ ...current, posts: value }))
        }
        onDelete={(index) => deleteItem("posts", index)}
      />
    </div>
  );
}

