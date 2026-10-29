"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { gsap, motionQueries, useGSAP } from "@/components/motion/gsap";

export function AboutMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

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
      });

      return () => media.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
