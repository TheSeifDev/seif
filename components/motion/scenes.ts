"use client";

import {
  IDENTITY_MOON,
  MOON_EVENT,
  type MoonState,
} from "@/lib/visuals/identity-moon-config";
import { gsap, motionQueries } from "./gsap";
import { journeyScene } from "./journey-scene";
import { featuredScene } from "./featured-scene";

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

/** One intentional entrance; existing outer layers still handle the About overlap. */
const hero: SceneSetup = (root) => {
  const mm = gsap.matchMedia();

  // Small screens paint their primary content immediately, without an
  // opacity/clip entrance holding back the largest contentful paint.
  root.dataset.entrance = "complete";
  mm.add(motionQueries.stage, () => {
    const heroRoot = one(root, "[data-hero]");
    if (!heroRoot || window.scrollY > heroRoot.offsetHeight) return;
    root.dataset.entrance = "playing";
    gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => { root.dataset.entrance = "complete"; },
    })
      .fromTo(all(root, "[data-hero-role], [data-hero-meta]"), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0)
      .fromTo(all(root, "[data-hero-title-line]"), { yPercent: 108 }, { yPercent: 0, duration: 0.75, stagger: 0.08 }, 0.12)
      .fromTo(all(root, "[data-hero-copy]"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05 }, 0.38)
      .fromTo(one(root, "[data-hero-actions]"), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.36 }, 0.56)
      .fromTo(one(root, "[data-hero-portrait-reveal]"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.72, ease: "power2.inOut" }, 0.94)
      .fromTo(one(root, "[data-hero-bg-inner]"), { scale: 1.08 }, { scale: 1, duration: 1.4, ease: "power2.out" }, 0)
      .fromTo(one(root, "[data-hero-glow]"), { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power1.out" }, 0);
    return () => { root.dataset.entrance = "complete"; };
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
        { opacity: 0.6 },
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

const journey: SceneSetup = journeyScene;

const featured: SceneSetup = featuredScene;

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
    const steps = all(list, "[data-process-compact-step]");
    let positions: number[] = [];
    let active = -1;
    let frame = 0;
    const syncActive = () => {
      const readingLine = window.scrollY + window.innerHeight * 0.7;
      let index = 0;
      positions.forEach((position, i) => { if (readingLine >= position) index = i; });
      if (active !== index) {
        active = index;
        steps.forEach((step, i) => step.toggleAttribute("data-active", i === index));
      }
    };
    const scheduleSync = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; syncActive(); });
    };
    const measure = () => {
      positions = steps.map((step) => step.getBoundingClientRect().top + window.scrollY);
      scheduleSync();
    };
    measure();
    window.addEventListener("scroll", scheduleSync, { passive: true });
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
          onRefresh: measure,
          onUpdate: syncActive,
        },
      },
    );
    return () => {
      window.removeEventListener("scroll", scheduleSync);
      cancelAnimationFrame(frame);
      steps.forEach((step, i) => step.toggleAttribute("data-active", i === 0));
    };
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

/**
 * Identity: one pinned stage, one scrubbed master timeline (10 units).
 * Statement (0–2.45) → split around the portrait (3–5) → moon depth (4.6–7.4)
 * → exit into The Journey (8–10). The moon state lives inside the same
 * timeline and is published to the Three.js scene on every update.
 */
const identity: SceneSetup = (root) => {
  const mm = gsap.matchMedia();
  const lines = all(root, "[data-identity-line-inner]");
  const kicker = one(root, "[data-identity-kicker]");
  const halfA = one(root, '[data-identity-half="a"]');
  const halfB = one(root, '[data-identity-half="b"]');
  const copyA = one(root, '[data-identity-copy="a"]');
  const copyB = one(root, '[data-identity-copy="b"]');
  const portrait = one(root, "[data-identity-portrait]");
  const portraitImg = one(root, "[data-identity-portrait-img]");
  const moonWrap = one(root, "[data-identity-moon]");
  const disc = one(root, "[data-identity-moon-disc]");
  const caption = one(root, "[data-identity-caption]");
  const next = one(root, "[data-identity-next]");
  const closed = "inset(0% 50% 0% 50%)";
  const open = "inset(0% 0% 0% 0%)";

  mm.add(motionQueries.stage, () => {
    const pin = one(root, "[data-identity-pin]");
    const heading = one(root, "[data-identity-heading]");
    const figure = one(root, "[data-identity-figure]");
    if (
      !pin || !heading || !figure || !kicker || !halfA || !halfB || !copyA ||
      !copyB || !portrait || !portraitImg || !moonWrap || !disc || !caption ||
      !next || lines.length === 0
    ) {
      return;
    }

    root.dataset.sequence = "pinned";

    // Final scale of the two halves: as large as possible (max 0.42) while
    // staying clear of the moon's final disc on both sides.
    const GAP = 28;
    const splitScale = () => {
      const base = pin.getBoundingClientRect();
      const fig = figure.getBoundingClientRect();
      const box = heading.getBoundingClientRect();
      const cx = fig.left - base.left + fig.width * IDENTITY_MOON.headX;
      const r = (fig.width * IDENTITY_MOON.hostScale * IDENTITY_MOON.screenFraction) / 2;
      const maxA = cx - r - (box.left - base.left) - GAP;
      const maxB = box.right - base.left - (cx + r) - GAP;
      const scale = Math.min(0.42, maxA / halfA.offsetWidth, maxB / halfB.offsetWidth);
      return Math.max(0.24, scale);
    };
    // Copy blocks sit just inside each half's final (scaled) footprint.
    const offsetA = () => halfA.offsetHeight * splitScale() + 36;
    const offsetB = () => -(halfB.offsetHeight * splitScale() + 36);
    const lift = () => -Math.round(window.innerHeight * 0.07);

    const moon: MoonState = { rise: 0, exit: 0 };
    let published = "";
    const publish = () => {
      const rise = moon.rise.toFixed(4);
      const exit = moon.exit.toFixed(4);
      const key = `${rise}|${exit}`;
      if (key === published) return;
      published = key;
      root.dataset.moonRise = rise;
      root.dataset.moonExit = exit;
      root.dispatchEvent(new CustomEvent<MoonState>(MOON_EVENT, { detail: { ...moon } }));
    };

    gsap
      .timeline({
        defaults: { ease: "none" },
        onUpdate: publish,
        scrollTrigger: {
          id: "identity-sequence",
          trigger: pin,
          pin: true,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 3.2)}`,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      // 1. Statement
      .fromTo(kicker, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0)
      .fromTo(
        lines,
        { yPercent: 112 },
        { yPercent: 0, duration: 1.1, stagger: 0.45, ease: "power3.out" },
        0,
      )
      .fromTo([halfA, halfB], { y: 40 }, { y: 0, duration: 2.45 }, 0)
      // 2. Split around the portrait
      .fromTo(halfA, { scale: 1 }, { scale: splitScale, duration: 2, ease: "power2.inOut" }, 3)
      .fromTo(halfB, { scale: 1 }, { scale: splitScale, duration: 2, ease: "power2.inOut" }, 3)
      .fromTo(
        portrait,
        { clipPath: closed },
        { clipPath: open, duration: 1.8, ease: "power2.inOut" },
        3.3,
      )
      .fromTo(portraitImg, { yPercent: 6 }, { yPercent: 0, duration: 2.7, ease: "power1.out" }, 3.3)
      .fromTo(
        copyA,
        { opacity: 0, y: () => offsetA() + 28 },
        { opacity: 1, y: offsetA, duration: 1, ease: "power2.out" },
        4.4,
      )
      .fromTo(
        copyB,
        { opacity: 0, y: () => offsetB() + 28 },
        { opacity: 1, y: offsetB, duration: 1, ease: "power2.out" },
        4.65,
      )
      // 3. Depth: the moon rises behind the head
      .fromTo(moonWrap, { opacity: 0 }, { opacity: 1, duration: 1 }, 4.6)
      .fromTo(moon, { rise: 0 }, { rise: 1, duration: 2.8, ease: "power1.inOut" }, 4.6)
      .fromTo(disc, { yPercent: 26 }, { yPercent: 0, duration: 2.8, ease: "power1.inOut" }, 4.6)
      .fromTo(caption, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 5.2)
      // 4. Exit into The Journey (later tweens must not render their start early)
      .fromTo(
        [halfA, halfB],
        { y: 0, opacity: 1 },
        { y: lift, opacity: 0, duration: 1.4, stagger: 0.08, ease: "power2.in", immediateRender: false },
        8,
      )
      .fromTo(
        copyA,
        { y: offsetA, opacity: 1 },
        { y: () => offsetA() + lift(), opacity: 0, duration: 1.2, ease: "power2.in", immediateRender: false },
        8,
      )
      .fromTo(
        copyB,
        { y: offsetB, opacity: 1 },
        { y: () => offsetB() + lift(), opacity: 0, duration: 1.2, ease: "power2.in", immediateRender: false },
        8,
      )
      .fromTo(
        [kicker, caption],
        { opacity: 1 },
        { opacity: 0, duration: 0.8, immediateRender: false },
        8,
      )
      .fromTo(
        portrait,
        { y: 0, opacity: 1 },
        { y: lift, opacity: 0, duration: 1.6, ease: "power2.in", immediateRender: false },
        8.2,
      )
      .fromTo(moon, { exit: 0 }, { exit: 1, duration: 2, ease: "power1.in", immediateRender: false }, 8)
      .fromTo(
        disc,
        { yPercent: 0 },
        { yPercent: -11, duration: 2, ease: "power1.in", immediateRender: false },
        8,
      )
      .fromTo(moonWrap, { opacity: 1 }, { opacity: 0, duration: 1.2, immediateRender: false }, 8.8)
      .fromTo(next, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 8.6);

    return () => {
      delete root.dataset.sequence;
      delete root.dataset.moonRise;
      delete root.dataset.moonExit;
    };
  });

  mm.add(motionQueries.compact, () => {
    if (!portrait || !moonWrap || !disc || !copyA || !copyB || lines.length === 0) return;
    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "identity-reveal",
          trigger: root,
          start: "top 78%",
          end: "bottom 80%",
          scrub: 0.5,
        },
      })
      .fromTo(lines, { yPercent: 112 }, { yPercent: 0, stagger: 0.12, duration: 0.6, ease: "power2.out" }, 0)
      .fromTo(moonWrap, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.35)
      .fromTo(disc, { yPercent: 26 }, { yPercent: 0, duration: 0.9, ease: "power1.out" }, 0.35)
      .fromTo(portrait, { clipPath: closed }, { clipPath: open, duration: 0.8, ease: "power2.inOut" }, 0.45)
      .fromTo(
        [copyA, copyB],
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, stagger: 0.2, duration: 0.6, ease: "power2.out" },
        1,
      );
  });
};

export const scenes = {
  hero,
  about,
  identity,
  journey,
  featured,
  more,
  process,
  connect,
} as const;
export type SceneName = keyof typeof scenes;
