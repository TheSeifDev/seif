"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { aboutHeroScene } from "@/components/about/about-hero-scene";
import { introductionScene } from "@/components/about/introduction-scene";
import {
  capabilitiesScene,
  chapterTitles,
  educationScene,
  experienceScene,
  principlesEntrance,
  principlesPinned,
} from "@/components/about/about-scenes";
import { gsap, motionQueries, useGSAP } from "@/components/motion/gsap";

/** One route/media scope owns all About motion and restores static content. */
export function AboutMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const media = gsap.matchMedia();

      // Reserve existing Principles pin spacing before measuring other scenes.
      media.add(motionQueries.stage, () => principlesPinned(root));

      media.add(motionQueries.motion, () => {
        const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-about-reveal]"));
        reveals.forEach((element, index) => {
          gsap.from(element, {
            y: 24,
            autoAlpha: 0,
            duration: 0.75,
            delay: index * 0.035,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
              id: `about-reveal-${index + 1}`,
            },
          });
        });

        const cleanups = [
          aboutHeroScene(root),
          introductionScene(root),
          chapterTitles(root),
          experienceScene(root),
          educationScene(root),
          capabilitiesScene(root),
          principlesEntrance(root),
        ];
        return () => cleanups.forEach((cleanup) => cleanup());
      });

      return () => media.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
