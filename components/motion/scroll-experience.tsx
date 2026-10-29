"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type ScrollExperienceProps = {
  children: ReactNode;
};

export function ScrollExperience({ children }: ScrollExperienceProps) {
  const portfolioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const portfolio = portfolioRef.current;
    if (!portfolio) return;

    gsap.registerPlugin(ScrollTrigger);

    let isUnmounted = false;
    let media: ReturnType<typeof gsap.matchMedia> | undefined;
    const context = gsap.context(() => {
      media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          portfolio,
          {
            "--accent": "#49baf1",
            "--accent-on-light": "#076c9b",
            "--accent-on-dark": "#49baf1",
          },
          {
            "--accent": "#dc143c",
            "--accent-on-light": "#c9193c",
            "--accent-on-dark": "#ff5b73",
            ease: "none",
            scrollTrigger: {
              trigger: "#about",
              start: "top 70%",
              endTrigger: "#process",
              end: "bottom 70%",
              scrub: 1,
            },
          },
        );

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.from(element, {
            y: 24,
            opacity: 0,
            duration: 0.75,
            ease: "power2.out",
            immediateRender: false,
            clearProps: "transform,opacity",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              once: true,
            },
          });
        });
      });

      media.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 901px)",
        () => {
          gsap.utils
            .toArray<HTMLElement>("[data-parallax]")
            .forEach((element) => {
              gsap.to(element, {
                yPercent: 8,
                ease: "none",
                scrollTrigger: {
                  trigger: element,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              });
            });
        },
      );
    }, portfolio);

    const refresh = () => {
      if (!isUnmounted) ScrollTrigger.refresh();
    };

    window.addEventListener("load", refresh);
    document.fonts.ready.then(refresh).catch(() => undefined);

    return () => {
      isUnmounted = true;
      window.removeEventListener("load", refresh);
      media?.revert();
      context.revert();
    };
  }, []);

  return (
    <div ref={portfolioRef} className="portfolio">
      {children}
    </div>
  );
}
