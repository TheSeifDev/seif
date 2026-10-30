import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { SplitText } from "@/components/motion/split-text";
import { STACK_STEP, STACK_TOP } from "@/components/projects/project-stack";

/**
 * GSAP scenes for /projects. Each runs inside the `ProjectsMotion`
 * matchMedia context (tweens, ScrollTriggers and sets revert automatically)
 * and returns a cleanup for what GSAP does not own (SplitText, text content).
 * Entrance reveals animate `opacity` only (never `visibility`), so content
 * below the fold stays focusable for keyboard users before it is revealed.
 */
type Cleanup = () => void;

const noop: Cleanup = () => {};
const all = <T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string) =>
  Array.from(root.querySelectorAll<T>(selector));
const one = <T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string) =>
  root.querySelector<T>(selector);
const pad = (value: number) => String(value).padStart(2, "0");

/** Reversible enter: plays on the way down, rewinds on the way back up. */
const enter = (trigger: Element, id: string, start = "top 85%"): ScrollTrigger.Vars => ({
  id,
  trigger,
  start,
  toggleActions: "play none none reverse",
});

/** 01 Hero: masked character rise, ledger fade, count-up, scrubbed line drift. */
export function heroScene(root: HTMLElement): Cleanup {
  const hero = one(root, "[data-projects-hero]");
  if (!hero) return noop;

  const splits = all(hero, "[data-hero-split]").map((element, index) =>
    SplitText.create(element, {
      type: "chars",
      mask: "chars",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.chars, {
          yPercent: 118,
          rotate: 7,
          duration: 1.25,
          ease: "expo.out",
          stagger: 0.045,
          delay: 0.1 + index * 0.16,
        }),
    }),
  );

  gsap.from(all(hero, "[data-hero-fade]"), {
    y: 22,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.08,
    delay: 0.55,
  });

  const counters = all(hero, "[data-count]");
  counters.forEach((counter) => {
    const target = Number(counter.dataset.count ?? 0);
    const state = { value: 0 };
    counter.textContent = pad(0);
    gsap.to(state, {
      value: target,
      duration: 1.6,
      delay: 0.7,
      ease: "power2.out",
      onUpdate: () => {
        counter.textContent = pad(Math.round(state.value));
      },
    });
  });

  const [first, second] = all(hero, "[data-hero-line]");
  const drift = gsap.timeline({
    scrollTrigger: {
      id: "projects-page-hero-drift",
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
    },
  });
  if (first) drift.to(first, { xPercent: -8, ease: "none" }, 0);
  if (second) drift.to(second, { xPercent: 6, ease: "none" }, 0);
  const kanji = one(hero, "[data-hero-kanji]");
  if (kanji) drift.to(kanji, { yPercent: -40, opacity: 0, ease: "none" }, 0);

  return () => {
    splits.forEach((split) => split.revert());
    counters.forEach((counter) => {
      counter.textContent = pad(Number(counter.dataset.count ?? 0));
    });
  };
}

/** Section headings: SplitText line masks, reversible. */
export function headingScene(root: HTMLElement): Cleanup {
  const splits = all(root, "[data-projects-heading], [data-cta-title]").map((heading, index) =>
    SplitText.create(heading, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 118,
          duration: 1.15,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: enter(heading, `projects-page-heading-${index + 1}`, "top 88%"),
        }),
    }),
  );
  return () => splits.forEach((split) => split.revert());
}

/** 02 Index: filter rail and rows rise in sequence. */
export function indexScene(root: HTMLElement): Cleanup {
  const list = one(root, "[data-index-list]");
  const rail = one(root, "[data-filter-rail]");
  if (rail) {
    gsap.from(all(rail, "button"), {
      y: 16,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.04,
      scrollTrigger: enter(rail, "projects-page-filters", "top 90%"),
    });
  }
  if (list) {
    gsap.from(all(list, "[data-row-reveal]"), {
      y: 48,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.07,
      scrollTrigger: enter(list, "projects-page-index"),
    });
  }
  return noop;
}

function stackParts(root: HTMLElement) {
  const stack = one(root, "[data-stack]");
  const cards = stack ? all(stack, "[data-stack-card]") : [];
  return { stack, cards };
}

function revealCard(
  card: HTMLElement,
  index: number,
  start: ScrollTrigger.Vars["start"],
  end: ScrollTrigger.Vars["end"],
  trigger: Element,
) {
  const media = one(card, "[data-stack-media]");
  const image = one(card, "[data-stack-image]");
  const copy = all(card, "[data-stack-copy] > *");

  const reveal = gsap.timeline({
    scrollTrigger: {
      id: `projects-page-card-${index + 1}-media`,
      trigger,
      start,
      end,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  if (media) {
    reveal.fromTo(
      media,
      { clipPath: "inset(12% 9% 12% 9% round 24px)" },
      { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none" },
      0,
    );
  }
  if (image) reveal.fromTo(image, { scale: 1.16 }, { scale: 1, ease: "none" }, 0);

  if (copy.length) {
    gsap.from(copy, {
      y: 26,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.07,
      scrollTrigger: {
        id: `projects-page-card-${index + 1}-copy`,
        trigger,
        start,
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });
  }
}

/**
 * 03 In focus, stage viewports: cards are CSS-sticky, so every trigger is
 * measured from the (non-sticky) list plus each card's flow offset.
 */
export function stackStage(root: HTMLElement): Cleanup {
  const { stack, cards } = stackParts(root);
  if (!stack || !cards.length) return noop;
  const height = () => cards[0].offsetHeight;
  const stickyTop = (index: number) => STACK_TOP + index * STACK_STEP;

  cards.forEach((card, index) => {
    revealCard(
      card,
      index,
      () => `top+=${index * height()} bottom`,
      () => `top+=${index * height()} ${stickyTop(index) + 120}px`,
      stack,
    );

    const next = cards[index + 1];
    const inner = one(card, "[data-stack-inner]");
    const shade = one(card, "[data-stack-shade]");
    if (!next || !inner) return;
    const settle = gsap.timeline({
      scrollTrigger: {
        id: `projects-page-stack-${index + 1}`,
        trigger: stack,
        start: () => `top+=${(index + 1) * height()} bottom`,
        end: () => `top+=${(index + 1) * height()} ${stickyTop(index + 1)}px`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    settle.to(inner, { scale: 0.92, ease: "none" }, 0);
    if (shade) settle.to(shade, { opacity: 0.55, ease: "none" }, 0);
  });
  return noop;
}

/** 03 In focus, compact viewports: normal flow, per-card reveal. */
export function stackCompact(root: HTMLElement): Cleanup {
  const { cards } = stackParts(root);
  cards.forEach((card, index) => revealCard(card, index, "top bottom", "top 35%", card));
  return noop;
}
