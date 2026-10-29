"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import {
  capabilitiesScene,
  chapterTitles,
  educationScene,
  experienceScene,
  principlesEntrance,
  principlesPinned,
} from "@/components/about/about-scenes";
import { gsap, motionQueries, useGSAP } from "@/components/motion/gsap";

/**
 * Owns every animation on /about. One useGSAP scope + matchMedia: leaving the
 * route or changing the media state reverts all tweens, ScrollTriggers and
 * SplitText instances, so nothing leaks between routes.
 */
export function AboutMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const media = gsap.matchMedia();

      // Stage first: it changes the Principles layout (pin height) before the
      // remaining triggers measure the page.
      media.add(motionQueries.stage, () => principlesPinned(root));

      media.add(motionQueries.motion, () => {
        const reveals = gsap.utils.toArray<HTMLElement>("[data-about-reveal]");

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

        gsap.to("[data-about-portrait]", {
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-about-portrait-wrap]",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            id: "about-portrait",
          },
        });

        const cleanups = [
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
