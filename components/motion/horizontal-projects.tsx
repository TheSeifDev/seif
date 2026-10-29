"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_QUERY =
  "(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)";

type HorizontalProjectsProps = {
  children: ReactNode;
};

export function HorizontalProjects({ children }: HorizontalProjectsProps) {
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;

    if (!root || !viewport || !track) return;

    const media = gsap.matchMedia();

    media.add(DESKTOP_QUERY, () => {
      const slides = Array.from(
        track.querySelectorAll<HTMLElement>("[data-project-slide]"),
      );

      if (!slides.length) return undefined;

      root.dataset.motion = "enhanced";
      viewport.dataset.motion = "enhanced";
      track.dataset.motion = "enhanced";

      let disposed = false;
      let focusFrame = 0;
      let scrollTrigger: ScrollTrigger | undefined;
      let setupCleanup: (() => void) | undefined;

      const getDistance = () =>
        Math.max(0, track.scrollWidth - viewport.clientWidth);

      const context = gsap.context(() => {
        gsap.set(track, { x: 0 });
        if (progress) gsap.set(progress, { scaleX: 0 });

        const movement = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            id: "featured-horizontal",
            trigger: root,
            pin: viewport,
            pinType: "transform",
            pinSpacing: true,
            start: "top 100px",
            end: () => `+=${getDistance()}`,
            scrub: true,
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              root.dataset.scrollStart = String(self.start);
              root.dataset.scrollEnd = String(self.end);
              root.dataset.scrollDistance = String(getDistance());
            },
            onUpdate: (self) => {
              if (progress) gsap.set(progress, { scaleX: self.progress });
            },
          },
        });

        scrollTrigger = movement.scrollTrigger ?? undefined;
        // Share the horizontal progress; no extra ScrollTrigger per screenshot.
        const images = track.querySelectorAll("[data-project-image]");
        const depth = gsap.fromTo(
          images,
          { xPercent: -1.5 },
          { xPercent: 1.5, ease: "none", paused: true },
        );
        movement.eventCallback("onUpdate", () =>
          depth.progress(movement.progress()),
        );

        const onFocusIn = (event: FocusEvent) => {
          const target = event.target;
          if (!(target instanceof HTMLElement) || !scrollTrigger) return;

          const slide = target.closest<HTMLElement>("[data-project-slide]");
          if (!slide || !root.contains(slide)) return;

          const slideIndex = slides.indexOf(slide);
          if (slideIndex < 0) return;

          const viewportBounds = viewport.getBoundingClientRect();
          const slideBounds = slide.getBoundingClientRect();
          const isVisible =
            slideBounds.left >= viewportBounds.left - 1 &&
            slideBounds.right <= viewportBounds.right + 1;

          if (isVisible || slides.length < 2) return;

          const targetProgress = slideIndex / (slides.length - 1);
          const targetScroll =
            scrollTrigger.start +
            (scrollTrigger.end - scrollTrigger.start) * targetProgress;

          // Focus can trigger browser ancestor scrolling before focusin. A
          // frame-late correction keeps the focused CTA on its pin progress.
          if (focusFrame) window.cancelAnimationFrame(focusFrame);
          focusFrame = window.requestAnimationFrame(() => {
            focusFrame = 0;
            if (disposed || !scrollTrigger) return;
            window.scrollTo({
              top: Math.max(0, targetScroll),
              left: window.scrollX,
              behavior: "auto",
            });
            scrollTrigger.update();
          });
        };

        root.addEventListener("focusin", onFocusIn);

        setupCleanup = () => {
          disposed = true;
          root.removeEventListener("focusin", onFocusIn);
          if (focusFrame) window.cancelAnimationFrame(focusFrame);
          focusFrame = 0;
          scrollTrigger = undefined;
          gsap.set([track, progress].filter(Boolean), {
            clearProps: "transform",
          });
        };
      }, root);

      return () => {
        setupCleanup?.();
        setupCleanup = undefined;
        context.revert();
        root.removeAttribute("data-motion");
        viewport.removeAttribute("data-motion");
        track.removeAttribute("data-motion");
        delete root.dataset.scrollStart;
        delete root.dataset.scrollEnd;
        delete root.dataset.scrollDistance;
      };
    });

    return () => {
      media.revert();
      root.removeAttribute("data-motion");
      viewport.removeAttribute("data-motion");
      track.removeAttribute("data-motion");
    };
  }, []);

  return (
    <section
      id="featured-horizontal"
      ref={rootRef}
      className="featured-horizontal relative min-w-0"
      aria-label="Featured project case studies"
    >
      <div
        ref={viewportRef}
        className="featured-viewport relative min-w-0 overflow-visible lg:min-h-[min(650px,calc(100svh_-_140px))] data-[motion=enhanced]:overflow-clip"
      >
        <div
          ref={trackRef}
          className="featured-track flex w-full flex-col gap-4 data-[motion=enhanced]:flex-row data-[motion=enhanced]:gap-0"
        >
          {children}
        </div>
        <div
          className="featured-progress pointer-events-none absolute right-5 bottom-3 left-5 h-px bg-identity-ink/15"
          aria-hidden="true"
        >
          <span
            ref={progressRef}
            data-featured-progress
            className="block h-full origin-left scale-x-0 bg-identity-ink"
          />
        </div>
      </div>
    </section>
  );
}
