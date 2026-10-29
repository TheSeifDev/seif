"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function HomeScenes({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const media = gsap.matchMedia();
    media.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width:1024px)",
        processWide: "(min-width:768px)",
      },
      (ctx) => {
        if (!ctx.conditions?.motion) return;
        const select = gsap.utils.selector(el);
        const hero = el.querySelector<HTMLElement>("#home");
        const about = el.querySelector<HTMLElement>("#about");
        const process = el.querySelector<HTMLElement>("#process");
        const contact = el.querySelector<HTMLElement>("#contact");
        const desktop = ctx.conditions.desktop;
        const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
        entrance.fromTo(
          select("[data-hero-word]"),
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 0.75,
            stagger: 0.1,
            clearProps: "transform",
          },
        );
        if (hero) {
          const exit = gsap.timeline({
            scrollTrigger: {
              id: "hero-departure",
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
          exit
            .to(
              select(".hero-landscape"),
              { y: desktop ? 60 : 20, ease: "none" },
              0,
            )
            .to(
              select(".hero-moon"),
              { y: desktop ? 110 : 30, ease: "none" },
              0,
            )
            .to(
              select(".hero-fog"),
              { y: desktop ? -40 : -12, ease: "none" },
              0,
            )
            .to(
              select(".portrait-wrap"),
              { y: desktop ? -20 : -8, ease: "none" },
              0,
            );
        }
        if (about) {
          const tl = gsap.timeline({
            scrollTrigger: {
              id: "about-reveal",
              trigger: about,
              start: "top 85%",
              end: "top 22%",
              scrub: true,
            },
          });
          tl.fromTo(
            select("[data-about-line]"),
            { yPercent: 100 },
            { yPercent: 0, stagger: 0.12, ease: "none" },
            0,
          )
            .fromTo(
              select("[data-about-copy]"),
              { y: 22 },
              { y: 0, stagger: 0.1, ease: "none" },
              0.1,
            )
            .fromTo(
              select("[data-about-mask]"),
              { clipPath: "inset(14% 10% 10% 0 round 24px)" },
              { clipPath: "inset(0% 0% 0% 0 round 0px)", ease: "none" },
              0,
            )
            .fromTo(
              select(".ink-landscape"),
              { y: 12 },
              { y: -10, ease: "none" },
              0,
            );
        }
        if (process) {
          const tl = gsap.timeline({
            scrollTrigger: {
              id: "process-progress",
              trigger: process,
              start: "top 75%",
              end: "bottom 45%",
              scrub: true,
            },
          });
          const wide = ctx.conditions.processWide;
          tl.fromTo(
            select("[data-process-progress]"),
            wide ? { scaleX: 0 } : { scaleY: 0 },
            wide ? { scaleX: 1, ease: "none" } : { scaleY: 1, ease: "none" },
            0,
          ).fromTo(
            select("[data-process-step]"),
            { y: 18 },
            { y: 0, stagger: 0.1, ease: "none" },
            0,
          );
        }
        if (contact) {
          gsap
            .timeline({
              scrollTrigger: {
                id: "contact-finale",
                trigger: contact,
                start: "top 90%",
                end: "top 20%",
                scrub: true,
              },
            })
            .fromTo(
              select("[data-contact-line]"),
              { yPercent: 100 },
              { yPercent: 0, stagger: 0.1, ease: "none" },
              0,
            )
            .fromTo(
              select("[data-contact-mask]"),
              { clipPath: "inset(12% 0% 0% 0 round 40px)" },
              { clipPath: "inset(0% 0% 0% 0 round 0px)", ease: "none" },
              0,
            )
            .fromTo(
              select(".contact-card"),
              { y: 22 },
              { y: 0, ease: "none" },
              0.1,
            )
            .fromTo(
              select(".contact-fog"),
              { y: 18 },
              { y: -18, ease: "none" },
              0,
            );
        }
      },
      el,
    );
    el.dataset.scenes = "ready";
    return () => {
      media.revert();
      delete el.dataset.scenes;
    };
  }, []);
  return (
    <div ref={root} className="home-scenes">
      {children}
    </div>
  );
}
