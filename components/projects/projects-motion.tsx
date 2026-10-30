"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { gsap, motionQueries, useGSAP } from "@/components/motion/gsap";
import {
  headingScene,
  heroScene,
  indexScene,
  stackCompact,
  stackStage,
} from "@/components/projects/projects-scenes";

/**
 * Owns every scroll/entrance animation on /projects. One useGSAP scope +
 * matchMedia: leaving the route or changing media state reverts all tweens,
 * ScrollTriggers and SplitText instances. (Filter Flip and the hover preview
 * live in `ProjectsIndex`, scoped to that component.)
 */
export function ProjectsMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const media = gsap.matchMedia();

      media.add(motionQueries.stage, () => stackStage(root));
      media.add(motionQueries.compact, () => stackCompact(root));
      media.add(motionQueries.motion, () => {
        const cleanups = [heroScene(root), headingScene(root), indexScene(root)];
        return () => cleanups.forEach((cleanup) => cleanup());
      });

      return () => media.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
