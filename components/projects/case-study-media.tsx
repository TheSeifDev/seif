"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { type Project } from "@/lib/content/projects";
import {
  BrowserFrame,
  EditorialVisual,
} from "@/components/system/project-media";
import { gsap, motionQueries, useGSAP } from "@/components/motion/gsap";

export function CaseStudyMedia({ project }: { project: Project }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mediaQuery = gsap.matchMedia();

      mediaQuery.add(motionQueries.motion, () => {
        if (!scope.current) return;
        const frame = scope.current.querySelector<HTMLElement>(
          "[data-case-media-frame]",
        );
        if (!frame) return;

        gsap.set(frame, {
          scale: 0.86,
          transformOrigin: "50% 50%",
        });

        gsap.to(frame, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            id: `case-media-${project.slug}`,
            trigger: scope.current,
            start: "top 82%",
            end: "bottom 52%",
            scrub: true,
          },
        });
      });

      return () => mediaQuery.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="mx-auto w-full max-w-[1280px]">
      <div
        data-case-media-frame
        className={cn(
          "origin-center overflow-hidden rounded-[28px] border border-white/10 bg-night-3 shadow-[0_30px_80px_-48px_rgba(0,0,0,0.9)] lg:rounded-[40px]",
        )}
      >
        {project.image ? (
          <BrowserFrame
            src={project.image.src}
            alt={project.image.alt}
            url={project.live?.url}
            sizes="(min-width: 1280px) 1180px, 92vw"
            preload
            tone="dark"
            className="rounded-none border-0"
          />
        ) : (
          <EditorialVisual project={project} />
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 px-1 text-xs text-mist sm:px-2">
        <p>{project.image?.caption ?? "Editorial visual — no public product preview"}</p>
        {project.availability ? <p>{project.availability}</p> : null}
      </div>
    </div>
  );
}
