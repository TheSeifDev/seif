"use client";

import { JOURNEY_STACK_STEP, JOURNEY_STACK_TOP } from "@/lib/ui/journey-stack";
import { gsap, motionQueries } from "./gsap";

const one = (root: Element, selector: string) => root.querySelector<HTMLElement>(selector);
const all = (root: Element, selector: string) => [...root.querySelectorAll<HTMLElement>(selector)];
const stickyTop = (index: number) => JOURNEY_STACK_TOP + index * JOURNEY_STACK_STEP;

/** Match Projects: CSS owns stacking; GSAP scrubs each previous card's depth. */
export function journeyScene(root: HTMLElement) {
  const mm = gsap.matchMedia();
  const list = one(root, "[data-chapters]");
  const chapters = all(root, "[data-chapter]");
  if (!list || !chapters.length) return;
  const railItems = all(root, "[data-rail-item]");
  const counter = one(root, "[data-rail-counter]");
  const height = () => chapters[0].offsetHeight;
  const listTop = () => list.getBoundingClientRect().top + window.scrollY;
  const flowTop = (index: number) => root.dataset.stacked === "true"
    ? listTop() + index * height()
    : chapters[index].getBoundingClientRect().top + window.scrollY;

  const setActive = (index: number) => {
    railItems.forEach((item, i) => {
      item.toggleAttribute("data-active", i === index);
      const link = item.querySelector("a");
      if (i === index) link?.setAttribute("aria-current", "step");
      else link?.removeAttribute("aria-current");
    });
    chapters.forEach((chapter, i) => chapter.toggleAttribute("data-active", i === index));
    if (counter) counter.textContent = String(index + 1).padStart(2, "0");
  };
  setActive(0);

  mm.add(motionQueries.stage, () => {
    root.dataset.stacked = "true";
    // Setup-only: responsive gap utilities must not alter measured stack offsets.
    gsap.set(list, { gap: 0 });
    chapters.forEach((chapter, index) => {
      const card = one(chapter, "[data-journey-card]");
      const shade = one(chapter, "[data-journey-shade]");
      if (!card) return;
      gsap.fromTo(card,
        { y: 70, clipPath: "inset(16% 5% 0% 5% round 32px)" },
        {
          y: 0,
          clipPath: "inset(0% 0% 0% 0% round 32px)",
          ease: "none",
          scrollTrigger: {
            id: `journey-card-${index + 1}`,
            trigger: list,
            start: () => `top+=${index * height()} bottom`,
            end: () => `top+=${index * height()} ${stickyTop(index) + 120}px`,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
      if (chapters[index + 1]) {
        const settle = gsap.timeline({
          scrollTrigger: {
            id: `journey-stack-${index + 1}`,
            trigger: list,
            start: () => `top+=${(index + 1) * height()} bottom`,
            end: () => `top+=${(index + 1) * height()} ${stickyTop(index + 1)}px`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        settle.to(card, { scale: 0.92, ease: "none" }, 0);
        if (shade) settle.to(shade, { opacity: 0.55, ease: "none" }, 0);
      }
    });

    // Native hrefs work without JS; enhanced clicks target non-sticky flow.
    const onRailClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = (event.target as Element).closest<HTMLAnchorElement>("[data-rail-item] a");
      if (!target) return;
      const index = chapters.findIndex((chapter) => one(chapter, "h3")?.id === target.hash.slice(1));
      if (index < 0) return;
      event.preventDefault();
      window.history.replaceState(window.history.state, "", target.hash);
      window.scrollTo({ top: flowTop(index) - stickyTop(index) + 1 });
    };
    root.addEventListener("click", onRailClick);
    return () => {
      root.removeEventListener("click", onRailClick);
      delete root.dataset.stacked;
    };
  });

  mm.add(motionQueries.compact, () => {
    chapters.forEach((chapter, index) => {
      const card = one(chapter, "[data-journey-card]");
      if (!card) return;
      gsap.fromTo(card,
        { y: 70, clipPath: "inset(16% 5% 0% 5% round 32px)" },
        {
          y: 0,
          clipPath: "inset(0% 0% 0% 0% round 32px)",
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { id: `journey-card-${index + 1}`, trigger: chapter, start: "top 88%", toggleActions: "play none none reverse" },
        },
      );
    });
  });

  mm.add(motionQueries.motion, () => {
    const fill = one(root, "[data-rail-fill]");
    let active = -1;
    let positions: number[] = [];
    let frame = 0;
    const syncActive = () => {
      const readingLine = window.scrollY + window.innerHeight * 0.35 + 2;
      let index = 0;
      positions.forEach((position, i) => { if (readingLine >= position) index = i; });
      if (index !== active) { active = index; setActive(index); }
    };
    const scheduleSync = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; syncActive(); });
    };
    const measure = () => { positions = chapters.map((_, i) => flowTop(i)); scheduleSync(); };
    measure();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    if (fill) gsap.fromTo(fill, { scaleY: 0 }, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        id: "journey-rail",
        trigger: list,
        start: "top 35%",
        end: () => flowTop(chapters.length - 1) - window.innerHeight * 0.35,
        scrub: 0.25,
        invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate: syncActive,
      },
    });
    return () => {
      window.removeEventListener("scroll", scheduleSync);
      cancelAnimationFrame(frame);
      setActive(0);
    };
  });
}
