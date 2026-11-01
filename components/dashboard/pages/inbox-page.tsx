"use client";

import * as React from "react";
import { InboxPanel, SectionHeading } from "../dashboard-workspace";

export function InboxPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Communications / Leads"
        title="Messages Inbox"
        description="Inspect visitor inquiries submitted via the public contact form. Mark submissions as read, archive resolved threads, or purge spam."
      />

      <InboxPanel />
    </div>
  );
}

