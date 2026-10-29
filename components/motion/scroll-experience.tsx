"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";

type ScrollExperienceProps = {
  children: ReactNode;
};

type ElementSelector = string;

const BLUE_VARS = {
  "--accent": "#49baf1",
  "--accent-on-light": "#076c9b",
  "--accent-on-dark": "#49baf1",
  "--identity-mix": 0,
};

const RED_VARS = {
  "--accent": "#dc143c",
  "--accent-on-light": "#be1235",
  "--accent-on-dark": "#ff526f",
  "--identity-mix": 1,
};

const PARALLAX_FALLBACKS: Array<[ElementSelector, number]> = [
  [".hero-landscape", 8],
  [".hero-moon", 14],
  [".hero-fog", 20],
  [".ink-landscape", 6],
  [".ink-sun", 12],
  [".contact-art", 10],
  [".contact-fog", 16],
  [".torii-layer", 10],
];

export function ScrollExperience({ children }: ScrollExperienceProps) {
  const portfolioRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const portfolio = portfolioRef.current;
    if (!portfolio) return;

    gsap.registerPlugin(ScrollTrigger);
    portfolio.dataset.motion = "ready";

    let isUnmounted = false;
    let refreshFrame = 0;
    let media: ReturnType<typeof gsap.matchMedia> | undefined;
    const imageListeners: Array<{
      image: HTMLImageElement;
      event: "load" | "error";
      handler: () => void;
    }> = [];
    const interactionCleanups: Array<() => void> = [];

    const scoped = <T extends Element>(selector: string) =>
      Array.from(portfolio.querySelectorAll<T>(selector));

    const scheduleRefresh = () => {
      if (isUnmounted || refreshFrame) return;
      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = 0;
        if (!isUnmounted) ScrollTrigger.refresh();
      });
    };

    const context = gsap.context(() => {
      media = gsap.matchMedia();

      const hero = portfolio.querySelector<HTMLElement>(".hero, #home");
      const process = portfolio.querySelector<HTMLElement>("#process");
      const contact = portfolio.querySelector<HTMLElement>("#contact");

      const addProgress = () => {
        gsap.to(portfolio, {
          "--scroll-progress": 1,
          ease: "none",
          scrollTrigger: {
            trigger: portfolio,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      };

      const addIdentityTransition = () => {
        if (!hero || !process) return;

        gsap.fromTo(portfolio, BLUE_VARS, {
          ...RED_VARS,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "bottom 80%",
            endTrigger: process,
            end: "bottom 65%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      };

      const addHeroEntrance = () => {
        const nav = scoped<HTMLElement>(".nav-shell");
        const heroWords = scoped<HTMLElement>("[data-hero-word], .hero-word");
        const eyebrow = scoped<HTMLElement>(".hero-eyebrow, .hero .eyebrow");
        const portrait = scoped<HTMLElement>(".portrait-wrap");
        const moon = scoped<HTMLElement>(".hero-moon");
        const heroMeta = scoped<HTMLElement>(
          ".hero-meta, .hero-actions, .hero-bottom, .hero-side",
        );

        const heroTimeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            // Only the completed mount entrance discards its temporary inline
            // values. Scroll-reversible animations retain theirs while active.
            gsap.set(
              [
                ...nav,
                ...heroWords,
                ...eyebrow,
                ...portrait,
                ...moon,
                ...heroMeta,
              ],
              { clearProps: "transform,opacity" },
            );
          },
        });

        if (nav.length) {
          heroTimeline.fromTo(
            nav,
            { y: -12, opacity: 0.6 },
            { y: 0, opacity: 1, duration: 0.55 },
            0,
          );
        }
        if (heroWords.length) {
          heroTimeline.fromTo(
            heroWords,
            { yPercent: 105 },
            { yPercent: 0, duration: 0.72, stagger: 0.1 },
            0.16,
          );
        }
        if (eyebrow.length) {
          heroTimeline.fromTo(
            eyebrow,
            { y: 12, opacity: 0.4 },
            { y: 0, opacity: 1, duration: 0.5 },
            0.38,
          );
        }
        if (portrait.length) {
          heroTimeline.fromTo(
            portrait,
            { y: 30, scale: 1.03, opacity: 0.85 },
            { y: 0, scale: 1, opacity: 1, duration: 0.9 },
            0.2,
          );
        }
        if (moon.length) {
          heroTimeline.fromTo(
            moon,
            { scale: 0.9 },
            { scale: 1, duration: 1.05 },
            0.08,
          );
        }
        if (heroMeta.length) {
          heroTimeline.fromTo(
            heroMeta,
            { y: 12, opacity: 0.6 },
            { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 },
            0.62,
          );
        }
      };

      const addReveals = () => {
        const grouped = new Set<HTMLElement>();
        scoped<HTMLElement>("[data-reveal-group]").forEach((group) => {
          const items = Array.from(group.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
          );
          if (!items.length) return;
          items.forEach((item) => grouped.add(item));
          gsap.fromTo(
            items,
            { y: 36, opacity: 0.6 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: group,
                start: "top 84%",
                toggleActions: "play none none reverse",
                invalidateOnRefresh: true,
              },
            },
          );
        });

        scoped<HTMLElement>("[data-reveal]")
          .filter(
            (element) =>
              !grouped.has(element) && !element.closest("[data-reveal-group]"),
          )
          .forEach((element) => {
            gsap.fromTo(
              element,
              { y: 16, opacity: 0.5 },
              {
                y: 0,
                opacity: 1,
                duration: 0.7,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: element,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                  invalidateOnRefresh: true,
                },
              },
            );
          });
      };

      const addContactTimeline = () => {
        if (!contact) return;
        const lines = scoped<HTMLElement>("#contact [data-contact-line]");
        const card = contact.querySelector<HTMLElement>(".contact-card");
        if (!lines.length && !card) return;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: contact,
            start: "top 85%",
            end: "top 15%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        if (lines.length) {
          timeline.fromTo(
            lines,
            { yPercent: 15, opacity: 0.7 },
            { yPercent: 0, opacity: 1, stagger: 0.08, ease: "none" },
            0,
          );
        }
        if (card) {
          timeline.fromTo(
            card,
            { y: 20, opacity: 0.7 },
            { y: 0, opacity: 1, ease: "none" },
            0,
          );
        }
      };

      const addProcessMotion = () => {
        if (!process) return;
        const progress =
          process.querySelector<HTMLElement>(".process-progress");
        if (progress) {
          gsap.fromTo(
            progress,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              transformOrigin: "left center",
              scrollTrigger: {
                trigger: process,
                start: "top 80%",
                end: "bottom 65%",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            },
          );
        }

        const processNodes = scoped<HTMLElement>("#process .process-node");
        processNodes.forEach((node) => {
          gsap.fromTo(
            node,
            { y: 26, opacity: 0.6 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: {
                trigger: node,
                start: "top 86%",
                toggleActions: "play none none reverse",
                invalidateOnRefresh: true,
              },
            },
          );
        });
      };

      const addLightSurfaceMotion = () => {
        scoped<HTMLElement>(
          ".light-section [data-surface], .light-section .section-surface",
        ).forEach((surface) => {
          gsap.fromTo(
            surface,
            { y: 18 },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: surface.closest(".light-section") ?? surface,
                start: "top 90%",
                end: "bottom 10%",
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      };

      const getParallaxElements = () => {
        const elements = new Map<HTMLElement, number>();
        scoped<HTMLElement>("[data-depth]").forEach((element) => {
          const depth = Number(element.dataset.depth);
          if (Number.isFinite(depth)) elements.set(element, depth);
        });
        PARALLAX_FALLBACKS.forEach(([selector, depth]) => {
          scoped<HTMLElement>(selector).forEach((element) => {
            if (!elements.has(element)) elements.set(element, depth);
          });
        });
        return Array.from(elements.entries());
      };

      const addParallax = (mobile: boolean) => {
        getParallaxElements().forEach(([element, depth]) => {
          const amount = mobile
            ? Math.min(Math.abs(depth) * 0.5, 6) * Math.sign(depth)
            : Math.min(Math.abs(depth), 12) * Math.sign(depth);
          const section = element.closest<HTMLElement>("section") ?? portfolio;
          gsap.to(element, {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        });
      };

      const addCardHover = () => {
        scoped<HTMLElement>("[data-card], .project-card").forEach((card) => {
          const visual =
            card.querySelector<HTMLElement>("[data-card-visual]") ?? card;
          const arrow = card.querySelector<HTMLElement>(
            ".work-action svg, .work-arrow, .project-footer svg",
          );
          let active = false;

          const activate = () => {
            if (active) return;
            active = true;
            gsap.to(visual, {
              y: -5,
              scale: 1.015,
              duration: 0.24,
              ease: "power2.out",
              overwrite: "auto",
            });
            if (arrow) {
              gsap.to(arrow, {
                x: 2,
                y: -2,
                duration: 0.24,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
          };

          const deactivate = () => {
            if (!active) return;
            active = false;
            gsap.to(visual, {
              y: 0,
              scale: 1,
              duration: 0.24,
              ease: "power2.out",
              overwrite: "auto",
              onComplete: () => gsap.set(visual, { clearProps: "transform" }),
            });
            if (arrow) {
              gsap.to(arrow, {
                x: 0,
                y: 0,
                duration: 0.24,
                ease: "power2.out",
                overwrite: "auto",
                onComplete: () => gsap.set(arrow, { clearProps: "transform" }),
              });
            }
          };

          const onPointerEnter = () => activate();
          const onPointerLeave = () => {
            if (!card.matches(":focus-within")) deactivate();
          };
          const onFocusIn = () => activate();
          const onFocusOut = (event: FocusEvent) => {
            const nextTarget = event.relatedTarget;
            if (nextTarget instanceof Node && card.contains(nextTarget)) return;
            if (!card.matches(":hover")) deactivate();
          };

          card.addEventListener("pointerenter", onPointerEnter);
          card.addEventListener("pointerleave", onPointerLeave);
          card.addEventListener("focusin", onFocusIn);
          card.addEventListener("focusout", onFocusOut);
          interactionCleanups.push(() => {
            card.removeEventListener("pointerenter", onPointerEnter);
            card.removeEventListener("pointerleave", onPointerLeave);
            card.removeEventListener("focusin", onFocusIn);
            card.removeEventListener("focusout", onFocusOut);
            const targets = arrow ? [visual, arrow] : [visual];
            gsap.killTweensOf(targets);
            gsap.set(targets, { clearProps: "transform" });
          });
        });
      };

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(portfolio, BLUE_VARS);
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        addProgress();
        addIdentityTransition();
        addHeroEntrance();
        addReveals();
        addContactTimeline();
        addProcessMotion();
        addLightSurfaceMotion();
        addCardHover();
        return () =>
          interactionCleanups.splice(0).forEach((cleanup) => cleanup());
      });

      media.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 901px)",
        () => addParallax(false),
      );
      media.add(
        "(prefers-reduced-motion: no-preference) and (max-width: 900px)",
        () => addParallax(true),
      );
    }, portfolio);

    const refresh = () => scheduleRefresh();
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(portfolio);

    window.addEventListener("load", refresh, { once: true });
    document.fonts.ready.then(refresh).catch(() => undefined);

    portfolio.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      const onImageReady = () => refresh();
      image.addEventListener("load", onImageReady);
      image.addEventListener("error", onImageReady);
      imageListeners.push({ image, event: "load", handler: onImageReady });
      imageListeners.push({ image, event: "error", handler: onImageReady });
      if (image.complete) onImageReady();
    });

    return () => {
      isUnmounted = true;
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
      resizeObserver.disconnect();
      window.removeEventListener("load", refresh);
      imageListeners.forEach(({ image, event, handler }) => {
        image.removeEventListener(event, handler);
      });
      interactionCleanups.splice(0).forEach((cleanup) => cleanup());
      portfolio.removeAttribute("data-motion");
      media?.revert();
      context.revert();
    };
  }, []);

  return (
    <div
      ref={portfolioRef}
      className="portfolio bg-[#080b0d] text-[#f4f5f2] [--accent:#49baf1] [--accent-on-light:#076c9b] [--accent-on-dark:#49baf1] [--identity-mix:0] [--scroll-progress:0] [--page-gutter:20px] [--shell-margin:8px] [--section-radius:22px] [--surface-pad:calc(var(--page-gutter)_-_var(--shell-margin))] sm:[--page-gutter:32px] sm:[--shell-margin:12px] sm:[--section-radius:28px] lg:[--page-gutter:48px] xl:[--page-gutter:64px] xl:[--shell-margin:18px] xl:[--section-radius:38px] 2xl:[--page-gutter:72px]"
    >
      {children}
    </div>
  );
}
