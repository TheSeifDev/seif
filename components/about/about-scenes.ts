import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { SplitText } from "@/components/motion/split-text";

/**
 * GSAP scenes for the /about chapters (02 Experience → 05 Principles).
 * Every function runs inside the `AboutMotion` matchMedia context, so tweens,
 * ScrollTriggers and `gsap.set` calls are reverted automatically. Each one
 * returns a cleanup for the side effects GSAP does not own (SplitText
 * instances, text content, data attributes).
 */

type Cleanup = () => void;

const all = <T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string) =>
  Array.from(root.querySelectorAll<T>(selector));
const one = <T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string) =>
  root.querySelector<T>(selector);
const pad = (value: number) => String(value).padStart(2, "0");

/** Reversible enter: plays forward on the way down, rewinds on the way back up. */
const enter = (trigger: Element, id: string, start = "top 86%"): ScrollTrigger.Vars => ({
  id,
  trigger,
  start,
  toggleActions: "play none none reverse",
});

/** Chapter titles: SplitText line masks + label/aside rise. */
export function chapterTitles(root: HTMLElement): Cleanup {
  const splits: SplitText[] = [];

  all(root, "[data-about-chapter]").forEach((chapter, index) => {
    const name = chapter.dataset.aboutChapter ?? String(index + 1);
    const heading = one(chapter, "h2");
    if (!heading) return;

    splits.push(
      SplitText.create(heading, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 118,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: enter(heading, `about-page-${name}-title`),
          }),
      }),
    );

    const labelEl = heading.previousElementSibling;
    const aside = heading.parentElement?.nextElementSibling;
    const meta = [labelEl, aside].filter((el): el is Element => Boolean(el));
    if (meta.length) {
      gsap.from(meta, {
        y: 18,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: enter(heading, `about-page-${name}-meta`, "top 88%"),
      });
    }
  });

  return () => splits.forEach((split) => split.revert());
}

/** 02 Experience: drifting outline name, reading highlight, progress rail. */
export function experienceScene(root: HTMLElement): Cleanup {
  const counters: HTMLElement[] = [];

  all(root, "[data-role]").forEach((role, roleIndex) => {
    const id = `about-page-role-${roleIndex + 1}`;
    const marquee = one(role, "[data-role-marquee]");
    const header = one(role, "header");
    const list = one(role, "[data-role-points]");
    const points = all(role, "[data-role-point]");
    const fill = one(role, "[data-role-fill]");
    const counter = one(role, "[data-role-counter]");
    const stack = one(role, "[data-role-stack]");

    if (marquee) {
      const toLeft = role.dataset.roleDirection !== "right";
      gsap.fromTo(
        marquee,
        { xPercent: toLeft ? 0 : -22 },
        {
          xPercent: toLeft ? -22 : 0,
          ease: "none",
          scrollTrigger: {
            id: `${id}-marquee`,
            trigger: role,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    }

    if (header) {
      gsap.from(header.firstElementChild ?? header, {
        y: 36,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: enter(role, `${id}-meta`, "top 72%"),
      });
    }

    points.forEach((point, pointIndex) => {
      const text = one(point, "[data-role-point-text]");
      const index = one(point, "[data-role-point-index]");
      gsap
        .timeline({
          scrollTrigger: {
            id: `${id}-point-${pointIndex + 1}`,
            trigger: point,
            start: "top 84%",
            end: "top 50%",
            scrub: 0.5,
          },
        })
        .fromTo(text, { opacity: 0.16, y: 14 }, { opacity: 1, y: 0, ease: "none" }, 0)
        .fromTo(index, { opacity: 0.25 }, { opacity: 1, ease: "none" }, 0);
    });

    if (list && fill && counter) {
      counters.push(counter);
      let last = 1;
      gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });
      gsap.to(fill, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          id: `${id}-progress`,
          trigger: list,
          start: "top 60%",
          end: "bottom 60%",
          scrub: 0.4,
          onUpdate: (self) => {
            const active = Math.min(points.length, Math.max(1, Math.ceil(self.progress * points.length)));
            if (active !== last) {
              last = active;
              counter.textContent = pad(active);
            }
          },
        },
      });
    }

    if (stack) {
      gsap.from(all(stack, "[data-role-chip]"), {
        y: 16,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.035,
        scrollTrigger: enter(stack, `${id}-stack`, "top 92%"),
      });
    }
  });

  return () => counters.forEach((counter) => (counter.textContent = "01"));
}

/** 03 Education: card unmask, kanji parallax, degree lines, ledger rows. */
export function educationScene(root: HTMLElement): Cleanup {
  const splits: SplitText[] = [];
  const card = one(root, "[data-edu-card]");

  if (card) {
    gsap.fromTo(
      card,
      { clipPath: "inset(16% 5% 0% 5% round 32px)", y: 70 },
      {
        clipPath: "inset(0% 0% 0% 0% round 32px)",
        y: 0,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: enter(card, "about-page-edu-card", "top 88%"),
      },
    );

    const kanji = one(card, "[data-edu-kanji]");
    if (kanji) {
      gsap.fromTo(
        kanji,
        { yPercent: -12, rotate: -5 },
        {
          yPercent: 16,
          rotate: 3,
          ease: "none",
          scrollTrigger: {
            id: "about-page-edu-kanji",
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    }

    const degree = one(card, "[data-edu-degree]");
    if (degree) {
      splits.push(
        SplitText.create(degree, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.08,
              delay: 0.25,
              scrollTrigger: enter(card, "about-page-edu-degree", "top 80%"),
            }),
        }),
      );
    }
  }

  all(root, "[data-edu-group]").forEach((group, index) => {
    const title = one(group, "h3");
    gsap
      .timeline({ scrollTrigger: enter(group, `about-page-edu-group-${index + 1}`) })
      .from(title, { yPercent: 50, autoAlpha: 0, duration: 0.9, ease: "expo.out" })
      .from(
        all(group, "[data-edu-row]"),
        { x: -28, autoAlpha: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 },
        "-=0.6",
      );
  });

  return () => splits.forEach((split) => split.revert());
}

/** 04 Capabilities: hairline draw, masked name rise, skill stagger. */
export function capabilitiesScene(root: HTMLElement): Cleanup {
  all(root, "[data-cap-row]").forEach((row, index) => {
    const line = one(row, "[data-cap-line]");
    const name = one(row, "[data-cap-name]");
    if (line) gsap.set(line, { scaleX: 0, transformOrigin: "left center" });

    gsap
      .timeline({ scrollTrigger: enter(row, `about-page-cap-${index + 1}`, "top 90%") })
      .to(line, { scaleX: 1, duration: 1.1, ease: "expo.inOut" }, 0)
      .from(name, { yPercent: 110, duration: 0.9, ease: "expo.out" }, 0.12)
      .from(
        all(row, "[data-cap-skill]"),
        { y: 10, autoAlpha: 0, duration: 0.5, ease: "power2.out", stagger: 0.025 },
        0.3,
      );
  });

  return () => undefined;
}

/** 05 Principles entrance — every motion viewport. */
export function principlesEntrance(root: HTMLElement): Cleanup {
  const row = one(root, "[data-principles-row]");
  if (row) {
    gsap.from(all(row, "[data-principle]"), {
      y: 70,
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: enter(row, "about-page-principles-enter", "top 88%"),
    });
  }
  return () => undefined;
}

/**
 * 05 Principles — stage only. One pinned, scrubbed timeline expands the
 * panels in turn (flex-grow), cross-fades body/collapsed label and glow, and
 * snaps to each principle.
 */
export function principlesPinned(root: HTMLElement): Cleanup {
  const section = one(root, '[data-about-chapter="principles"]');
  const pin = section && one(section, "[data-principles-pin]");
  if (!section || !pin) return () => undefined;

  const items = all(section, "[data-principle]");
  const bodies = all(section, "[data-principle-body]");
  const collapsed = all(section, "[data-principle-collapsed]");
  const glows = all(section, "[data-principle-glow]");
  const counter = one(section, "[data-principles-counter]");
  const fill = one(section, "[data-principles-fill]");
  const count = items.length;
  if (count < 2) return () => undefined;

  section.dataset.enhanced = "true";
  const GROW = 3.4;
  let active = -1;

  const setActive = (next: number) => {
    if (next === active) return;
    active = next;
    items.forEach((item, index) => item.toggleAttribute("data-active", index === next));
    if (counter) counter.textContent = pad(next + 1);
  };

  gsap.set(items, { flexGrow: (index: number) => (index === 0 ? GROW : 1) });
  gsap.set(bodies, { opacity: (index: number) => (index === 0 ? 1 : 0) });
  gsap.set(collapsed, { opacity: (index: number) => (index === 0 ? 0 : 1) });
  gsap.set(glows, { opacity: (index: number) => (index === 0 ? 1 : 0) });
  if (fill) gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });
  setActive(0);

  const timeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      id: "about-page-principles",
      trigger: pin,
      pin: true,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 0.75 * (count - 1))}`,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      snap: {
        snapTo: "labels",
        inertia: false,
        duration: { min: 0.2, max: 0.6 },
        delay: 0.08,
        ease: "power2.inOut",
      },
      onUpdate: (self) => setActive(Math.round(self.progress * (count - 1))),
    },
  });

  timeline.addLabel("principle-1");
  for (let index = 1; index < count; index += 1) {
    const at = `step-${index}`;
    timeline
      .addLabel(at)
      .to(items[index - 1], { flexGrow: 1, duration: 1 }, at)
      .to(items[index], { flexGrow: GROW, duration: 1 }, at)
      .to(bodies[index - 1], { opacity: 0, duration: 0.35, ease: "power1.out" }, at)
      .to(collapsed[index - 1], { opacity: 1, duration: 0.4 }, `${at}+=0.55`)
      .to(collapsed[index], { opacity: 0, duration: 0.3 }, at)
      .fromTo(
        bodies[index],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        `${at}+=0.5`,
      )
      .to(glows[index - 1], { opacity: 0, duration: 1 }, at)
      .to(glows[index], { opacity: 1, duration: 1 }, at)
      .addLabel(`principle-${index + 1}`);
  }
  if (fill) timeline.to(fill, { scaleX: 1, duration: timeline.duration(), ease: "none" }, 0);

  return () => {
    delete section.dataset.enhanced;
    items.forEach((item) => item.removeAttribute("data-active"));
    if (counter) counter.textContent = "01";
  };
}
