"use client";

import { gsap, motionQueries } from "./gsap";

/**
 * Scroll scenes for the Home page. Each scene receives its root element and
 * runs inside the useGSAP context of <Scene>, so every tween, trigger and
 * matchMedia branch is reverted when the route unmounts.
 *
 * Markup is server-rendered and fully readable without JavaScript; scenes
 * only add motion (and, for pinned layouts, an `data-enhanced` flag that
 * switches the section into its pinned arrangement).
 */

type SceneSetup = (root: HTMLElement) => void;

const all = (root: HTMLElement, selector: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(selector));
const one = (root: HTMLElement, selector: string) =>
  root.querySelector<HTMLElement>(selector);

/** Hero settles on load; on wide screens it recedes while About slides over it. */
const hero: SceneSetup = (root) => {
  const mm = gsap.matchMedia();

  mm.add(motionQueries.motion, () => {
    gsap.from(all(root, "[data-hero-bg-inner]"), {
      scale: 1.08,
      duration: 1.8,
      ease: "power2.out",
    });
    gsap.from(all(root, "[data-hero-glow]"), {
      opacity: 0,
      duration: 1.6,
      ease: "power1.out",
    });
  });

  mm.add(motionQueries.stage, () => {
    const about = one(root, "[data-about]");
    if (!about) return;
    gsap
      .timeline({
        scrollTrigger: {
          id: "hero-overlap",
          trigger: about,
          start: "top bottom",
          end: "top top",
          scrub: 0.4,
        },
      })
      .to(one(root, "[data-hero-content]"), { y: -110, opacity: 0.2, ease: "none" }, 0)
      .to(one(root, "[data-hero-portrait]"), { y: 70, scale: 0.94, ease: "none" }, 0)
      .to(one(root, "[data-hero-bg]"), { yPercent: 8, scale: 1.05, ease: "none" }, 0)
      .to(all(root, "[data-hero-card]"), { y: -50, opacity: 0, ease: "none" }, 0)
      .to(one(root, "[data-hero-shade]"), { opacity: 0.75, ease: "none" }, 0);
  });

  mm.add(motionQueries.compact, () => {
    const section = one(root, "[data-hero]");
    if (!section) return;
    gsap.to(one(root, "[data-hero-bg]"), {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        id: "hero-parallax",
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  });
};

/** About: headline unmasks, ink landscape opens, statement fills word by word. */
const about: SceneSetup = (root) => {
  const mm = gsap.matchMedia();

  mm.add(motionQueries.motion, () => {
    gsap
      .timeline({
        scrollTrigger: {
          id: "about-heading",
          trigger: root,
          start: "top 85%",
          end: "top 15%",
          scrub: 0.5,
        },
      })
      .from(all(root, "[data-about-line]"), {
        yPercent: 110,
        stagger: 0.12,
        ease: "power2.out",
      }, 0)
      .fromTo(
        one(root, "[data-about-art]"),
        { clipPath: "inset(18% 14% 18% 0% round 32px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.out" },
        0,
      )
      .from(one(root, "[data-about-art-img]"), { scale: 1.18, ease: "power2.out" }, 0);

    const statement = one(root, "[data-about-statement]");
    if (statement) {
      gsap.fromTo(
        all(statement, "[data-word]"),
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            id: "about-statement",
            trigger: statement,
            start: "top 82%",
            end: "bottom 50%",
            scrub: true,
          },
        },
      );
    }

    const principles = one(root, "[data-about-principles]");
    if (principles) {
      gsap.from(all(principles, "[data-about-principle]"), {
        y: 48,
        opacity: 0,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          id: "about-principles",
          trigger: principles,
          start: "top 90%",
          end: "top 55%",
          scrub: 0.5,
        },
      });
    }
  });
};

/** Journey: chapters stack (CSS sticky); the covered one recedes, the rail tracks progress. */
const journey: SceneSetup = (root) => {
  const mm = gsap.matchMedia();
  const chapters = all(root, "[data-chapter]");
  const railItems = all(root, "[data-rail-item]");
  const counter = one(root, "[data-rail-counter]");

  const setActive = (index: number) => {
    railItems.forEach((item, i) => item.toggleAttribute("data-active", i === index));
    if (counter) counter.textContent = String(index + 1).padStart(2, "0");
  };

  mm.add(motionQueries.stage, () => {
    chapters.forEach((chapter, i) => {
      const next = chapters[i + 1];
      if (!next) return;
      gsap
        .timeline({
          scrollTrigger: {
            id: `journey-stack-${i + 1}`,
            trigger: next,
            start: "top bottom",
            end: "top 30%",
            scrub: true,
          },
        })
        .to(one(chapter, "[data-chapter-inner]"), { scale: 0.92, ease: "none" }, 0)
        .to(one(chapter, "[data-chapter-shade]"), { opacity: 0.6, ease: "none" }, 0);
    });

    let active = 0;
    const list = one(root, "[data-chapters]");
    gsap.fromTo(
      one(root, "[data-rail-fill]"),
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          id: "journey-rail",
          trigger: list,
          start: "top 30%",
          end: "bottom 80%",
          scrub: true,
          onUpdate(self) {
            const index = Math.min(
              chapters.length - 1,
              Math.floor(self.progress * chapters.length),
            );
            if (index !== active) {
              active = index;
              setActive(index);
            }
          },
        },
      },
    );

    return () => setActive(0);
  });

  mm.add(motionQueries.compact, () => {
    chapters.forEach((chapter, i) => {
      gsap.from(one(chapter, "[data-chapter-inner]"), {
        y: 56,
        opacity: 0,
        ease: "power2.out",
        scrollTrigger: {
          id: `journey-reveal-${i + 1}`,
          trigger: chapter,
          start: "top 92%",
          end: "top 60%",
          scrub: 0.5,
        },
      });
    });
  });
};

/** Featured: vertical scroll drives a horizontal track of case studies. */
const featured: SceneSetup = (root) => {
  const mm = gsap.matchMedia();

  mm.add(motionQueries.stage, () => {
    const pin = one(root, "[data-featured-pin]");
    const track = one(root, "[data-featured-track]");
    const viewport = track?.parentElement;
    if (!pin || !track || !viewport) return;

    root.dataset.enhanced = "true";
    const slides = all(root, "[data-slide]");
    const fill = one(root, "[data-featured-fill]");
    const counter = one(root, "[data-featured-counter]");
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

    let current = -1;
    const setCurrent = (index: number) => {
      if (index === current) return;
      current = index;
      slides.forEach((slide, i) => slide.toggleAttribute("data-current", i === index));
      if (counter) counter.textContent = String(index + 1).padStart(2, "0");
    };
    setCurrent(0);

    const tween = gsap.to(track, {
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
        // Settle on whole case studies instead of stopping mid-card.
        snap:
          slides.length > 1
            ? {
                snapTo: 1 / (slides.length - 1),
                duration: { min: 0.25, max: 0.6 },
                delay: 0.08,
                ease: "power2.inOut",
                inertia: false,
              }
            : undefined,
        onUpdate(self) {
          if (fill) gsap.set(fill, { scaleX: self.progress });
          setCurrent(Math.round(self.progress * (slides.length - 1)));
        },
      },
    });

    // Keyboard users: focusing a control inside an off-screen slide scrolls
    // the page to the point where that slide is in view.
    const onFocusIn = (event: FocusEvent) => {
      const slide = (event.target as HTMLElement).closest<HTMLElement>("[data-slide]");
      const trigger = tween.scrollTrigger;
      if (!slide || !trigger || slides.length < 2) return;
      const index = slides.indexOf(slide);
      const target = trigger.start + (trigger.end - trigger.start) * (index / (slides.length - 1));
      if (Math.abs(window.scrollY - target) > 4) window.scrollTo({ top: target });
    };
    track.addEventListener("focusin", onFocusIn);

    return () => {
      track.removeEventListener("focusin", onFocusIn);
      slides.forEach((slide) => slide.removeAttribute("data-current"));
      delete root.dataset.enhanced;
    };
  });

  mm.add(motionQueries.compact, () => {
    all(root, "[data-slide]").forEach((slide, i) => {
      gsap.from(slide, {
        y: 60,
        opacity: 0,
        ease: "power2.out",
        scrollTrigger: {
          id: `featured-reveal-${i + 1}`,
          trigger: slide,
          start: "top 92%",
          end: "top 62%",
          scrub: 0.5,
        },
      });
    });
  });
};

/** More projects: the three cards rise in sequence with scroll. */
const more: SceneSetup = (root) => {
  const mm = gsap.matchMedia();
  mm.add(motionQueries.motion, () => {
    const grid = one(root, "[data-more-grid]");
    if (!grid) return;
    gsap.from(all(grid, "[data-more-card]"), {
      y: 72,
      opacity: 0,
      stagger: 0.14,
      ease: "power2.out",
      scrollTrigger: {
        id: "more-cards",
        trigger: grid,
        start: "top 92%",
        end: "top 50%",
        scrub: 0.5,
      },
    });
  });
};

/** Process: a pinned path fills with scroll and activates each stage. */
const process: SceneSetup = (root) => {
  const mm = gsap.matchMedia();
  const HOLD = 0.15; // last share of the pin that holds the final stage

  mm.add(motionQueries.stage, () => {
    const pin = one(root, "[data-process-pin]");
    const fill = one(root, "[data-process-fill]");
    if (!pin || !fill) return;

    root.dataset.enhanced = "true";
    const nodes = all(root, "[data-process-node]");
    const panels = all(root, "[data-process-panel]");
    const count = nodes.length;

    let active = -1;
    const setActive = (index: number) => {
      if (index === active) return;
      active = index;
      nodes.forEach((node, i) => {
        node.toggleAttribute("data-active", i === index);
        node.toggleAttribute("data-done", i < index);
      });
      panels.forEach((panel, i) => {
        panel.toggleAttribute("data-active", i === index);
        panel.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
    };
    setActive(0);

    gsap
      .timeline({
        scrollTrigger: {
          id: "process-pin",
          trigger: pin,
          pin: true,
          start: "top top",
          end: "+=240%",
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate(self) {
            const progress = Math.min(1, self.progress / (1 - HOLD));
            setActive(Math.min(count - 1, Math.floor(progress * (count - 1) + 0.02)));
          },
        },
      })
      .fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 - HOLD })
      .to({}, { duration: HOLD });

    return () => {
      nodes.forEach((node, i) => {
        node.toggleAttribute("data-active", i === 0);
        node.removeAttribute("data-done");
      });
      panels.forEach((panel) => {
        panel.removeAttribute("data-active");
        panel.removeAttribute("aria-hidden");
      });
      delete root.dataset.enhanced;
    };
  });

  mm.add(motionQueries.compact, () => {
    const list = one(root, "[data-process-list]");
    if (!list) return;
    gsap.fromTo(
      one(list, "[data-process-vfill]"),
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          id: "process-line",
          trigger: list,
          start: "top 70%",
          end: "bottom 70%",
          scrub: true,
        },
      },
    );
  });
};

/** Let's Connect: the moonlit gate drifts and the headline rises into place. */
const connect: SceneSetup = (root) => {
  const mm = gsap.matchMedia();
  mm.add(motionQueries.motion, () => {
    gsap.fromTo(
      one(root, "[data-connect-bg]"),
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          id: "connect-parallax",
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
    gsap.from(all(root, "[data-connect-line]"), {
      yPercent: 110,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        id: "connect-heading",
        trigger: root,
        start: "top 80%",
        end: "top 30%",
        scrub: 0.5,
      },
    });
  });
};

export const scenes = { hero, about, journey, featured, more, process, connect } as const;
export type SceneName = keyof typeof scenes;
