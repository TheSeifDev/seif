"use client";

import { gsap, motionQueries, ScrollTrigger } from "./gsap";

type SceneSetup = (root: HTMLElement) => void;

const all = (root: HTMLElement, selector: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(selector));

const one = (root: HTMLElement, selector: string) =>
  root.querySelector<HTMLElement>(selector);

/**
 * Featured: vertical scroll drives a horizontal track of case studies.
 *
 * The filter keeps every card in the server-rendered DOM and marks excluded
 * cards hidden. A filter event then rebuilds the measured pin from the
 * remaining cards, which avoids stale triggers, pin spacers, or snap points.
 */
export const featuredScene: SceneSetup = (root) => {
  const mm = gsap.matchMedia();

  mm.add(motionQueries.stage, () => {
    const pin = one(root, "[data-featured-pin]");
    const track = one(root, "[data-featured-track]");
    const viewport = track?.parentElement;
    if (!pin || !track || !viewport) return;

    const fill = one(root, "[data-featured-fill]");
    const counter = one(root, "[data-featured-counter]");
    const total = one(root, "[data-featured-total]");
    let slides: HTMLElement[] = [];
    let current = -1;
    let tween: gsap.core.Tween | undefined;
    let refreshFrame = 0;

    const visibleSlides = () =>
      all(root, "[data-slide]").filter((slide) => !slide.hidden);

    const setCurrent = (index: number) => {
      const next = slides.length === 0 ? -1 : Math.max(0, Math.min(index, slides.length - 1));
      if (next === current && slides.every((slide, i) => slide.hasAttribute("data-current") === (i === next))) {
        return;
      }
      current = next;
      slides.forEach((slide, i) => slide.toggleAttribute("data-current", i === next));
      if (counter && next >= 0) counter.textContent = String(next + 1).padStart(2, "0");
    };

    const killTrack = () => {
      const trigger = tween?.scrollTrigger;
      trigger?.kill();
      tween?.kill();
      tween = undefined;
      all(root, "[data-slide]").forEach((slide) => slide.removeAttribute("data-current"));
      gsap.set(track, { clearProps: "transform" });
    };

    const scheduleRefresh = (
      wasPinned: boolean,
      restoreProgress: number,
      restoreRoot: boolean,
    ) => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = 0;
        ScrollTrigger.refresh();

        if (!wasPinned) return;
        const trigger = tween?.scrollTrigger;
        if (trigger && root.dataset.enhanced === "true") {
          const target = trigger.start + (trigger.end - trigger.start) * restoreProgress;
          window.scrollTo({ top: target });
          trigger.update();
        } else if (restoreRoot) {
          const rootTop = root.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: Math.max(0, rootTop - 24) });
        }
      });
    };

    const rebuild = () => {
      const previousTrigger = tween?.scrollTrigger;
      const wasPinned = Boolean(previousTrigger?.isActive);
      const previousProgress = previousTrigger?.progress ?? 0;
      const previousIndex = current;
      const previousSlug = slides[previousIndex]?.dataset.projectSlug;

      killTrack();
      slides = visibleSlides();
      if (total) total.textContent = String(slides.length).padStart(2, "0");

      const canPin = slides.length >= 2;
      if (!canPin) {
        delete root.dataset.enhanced;
        setCurrent(0);
        if (fill) gsap.set(fill, { scaleX: 0 });
        scheduleRefresh(wasPinned, 0, true);
        return;
      }

      root.dataset.enhanced = "true";
      const restoredIndex = previousSlug
        ? slides.findIndex((slide) => slide.dataset.projectSlug === previousSlug)
        : -1;
      const nextIndex = restoredIndex >= 0
        ? restoredIndex
        : Math.min(slides.length - 1, Math.max(0, previousIndex));
      const restoreProgress = wasPinned
        ? nextIndex / (slides.length - 1)
        : previousProgress;
      const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

      setCurrent(nextIndex);
      tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          id: "featured-horizontal",
          trigger: pin,
          pin: true,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          snap: {
            snapTo: 1 / (slides.length - 1),
            duration: { min: 0.25, max: 0.6 },
            delay: 0.08,
            ease: "power2.inOut",
            inertia: false,
          },
          onUpdate(self) {
            if (fill) gsap.set(fill, { scaleX: self.progress });
            setCurrent(Math.round(self.progress * (slides.length - 1)));
          },
        },
      });
      scheduleRefresh(wasPinned, restoreProgress, false);
    };

    root.dataset.enhanced = "true";
    slides = visibleSlides();
    rebuild();

    // Keyboard users: focusing a control inside an off-screen slide scrolls
    // the page to the point where that slide is in view.
    const onFocusIn = (event: FocusEvent) => {
      const slide = (event.target as HTMLElement).closest<HTMLElement>("[data-slide]");
      const trigger = tween?.scrollTrigger;
      if (!slide || !trigger || slides.length < 2) return;
      const index = slides.indexOf(slide);
      if (index < 0) return;
      const target = trigger.start + (trigger.end - trigger.start) * (index / (slides.length - 1));
      if (Math.abs(window.scrollY - target) > 4) window.scrollTo({ top: target });
    };
    track.addEventListener("focusin", onFocusIn);

    const onFilterChange = () => rebuild();
    root.addEventListener("featured-filter-change", onFilterChange);

    return () => {
      root.removeEventListener("featured-filter-change", onFilterChange);
      track.removeEventListener("focusin", onFocusIn);
      cancelAnimationFrame(refreshFrame);
      killTrack();
      slides.forEach((slide) => slide.removeAttribute("data-current"));
      delete root.dataset.enhanced;
    };
  });

  mm.add(motionQueries.compact, () => {
    const slides = all(root, "[data-slide]");
    let reveals: gsap.core.Tween[] = [];
    let frame = 0;
    const clearReveals = () => {
      reveals.forEach((reveal) => { reveal.scrollTrigger?.kill(); reveal.kill(); });
      reveals = [];
      gsap.set(slides, { clearProps: "transform,opacity" });
    };
    const rebuild = () => {
      clearReveals();
      reveals = slides.filter((slide) => !slide.hidden).map((slide, i) => gsap.fromTo(slide,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            id: `featured-reveal-${i + 1}`,
            trigger: slide,
            start: "top 92%",
            end: "top 62%",
            scrub: 0.5,
          },
        },
      ));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { frame = 0; ScrollTrigger.refresh(); });
    };
    rebuild();
    root.addEventListener("featured-filter-change", rebuild);
    return () => {
      root.removeEventListener("featured-filter-change", rebuild);
      cancelAnimationFrame(frame);
      clearReveals();
    };
  });
};
