"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteContent } from "@/lib/cms/schema";

type SiteContentContextValue = SiteContent;

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: ReactNode;
}) {
  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): SiteContentContextValue {
  const content = useContext(SiteContentContext);
  if (!content) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return content;
}
