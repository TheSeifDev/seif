"use client";

import * as React from "react";
import { Scene } from "@/components/motion/scene";
import { About } from "@/components/home/about";
import { ConnectCta } from "@/components/home/connect-cta";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { Hero } from "@/components/home/hero";
import { Identity } from "@/components/home/identity";
import { Journey } from "@/components/home/journey";
import { MoreProjects } from "@/components/home/more-projects";
import { Process } from "@/components/home/process";
import { Skills } from "@/components/home/skills";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { SiteContentProvider } from "@/components/site/site-content-provider";
import { RouteMotion } from "@/components/motion/route-motion";
import {
  getHomeSections,
  siteContentSchema,
  type HomeSectionId,
  type SiteContent,
} from "@/lib/cms/schema";

const sectionRenderers: Record<
  HomeSectionId,
  (content: SiteContent) => React.ReactNode
> = {
  hero: (content) => (
    <Scene key="hero" name="hero" className="relative">
      <Hero content={content} />
      <About content={content} />
    </Scene>
  ),
  identity: (content) => <Identity key="identity" content={content} />,
  journey: (content) => <Journey key="journey" content={content} />,
  featuredProjects: (content) => (
    <FeaturedProjects key="featuredProjects" content={content} />
  ),
  moreProjects: (content) => (
    <MoreProjects key="moreProjects" content={content} />
  ),
  skills: (content) => <Skills key="skills" content={content} />,
  process: (content) => <Process key="process" content={content} />,
  connectCta: (content) => <ConnectCta key="connectCta" content={content} />,
};

export function LiveHomeRenderer({
  initialContent,
  revision,
}: {
  initialContent: SiteContent;
  revision: number;
}) {
  const [content, setContent] = React.useState<SiteContent>(initialContent);
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 1. Strict Origin check
      if (event.origin !== window.location.origin) return;

      // 2. Strict Source check (must come from parent frame)
      if (event.source !== window.parent) return;

      // 3. Payload size limit (reject > 5MB)
      if (typeof event.data !== "object" || event.data === null) return;
      try {
        const payloadStr = JSON.stringify(event.data);
        if (payloadStr.length > 5 * 1024 * 1024) return;
      } catch {
        return;
      }

      // 4. Type & Schema validation
      if (event.data.type === "PREVIEW_CONTENT_UPDATE" && event.data.content) {
        const parsed = siteContentSchema.safeParse(event.data.content);
        if (parsed.success) {
          setIsSyncing(true);
          setContent(parsed.data);
          setTimeout(() => setIsSyncing(false), 250);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Announce frame readiness to parent editor
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: "PREVIEW_FRAME_READY" },
        window.location.origin,
      );
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sections = getHomeSections(content);

  return (
    <SiteContentProvider content={content}>
      {/* Floating Live Indicator */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <div className="flex items-center gap-2 rounded-full border border-sky/30 bg-night-2/90 px-3.5 py-1.5 shadow-xl backdrop-blur-md">
          <span
            className={`size-2 rounded-full ${
              isSyncing ? "bg-amber-400 animate-ping" : "bg-sky animate-pulse"
            }`}
          />
          <span className="text-[11px] font-mono tracking-wide text-snow">
            LIVE PREVIEW {isSyncing ? "· SYNCING" : `· REV ${revision}`}
          </span>
        </div>
      </div>

      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        {sections
          .filter((section) => section.enabled)
          .map((section) => sectionRenderers[section.id]?.(content))}
      </main>
      <Footer content={content} />
      <RouteMotion />
    </SiteContentProvider>
  );
}

