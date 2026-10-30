import { gsap } from "@/components/motion/gsap";

type Cleanup = () => void;

const one = <T extends Element = HTMLElement>(root: ParentNode, selector: string) =>
  root.querySelector<T>(selector);
const all = <T extends Element = HTMLElement>(root: ParentNode, selector: string) =>
  Array.from(root.querySelectorAll<T>(selector));

/**
 * 01 Introduction: a readable, reversible section reveal plus restrained
 * portrait drift. The parent owns the matchMedia scope and GSAP cleanup.
 */
export function introductionScene(root: HTMLElement): Cleanup {
  const section = one<HTMLElement>(root, "[data-about-intro-root]");
  if (!section) return () => undefined;

  const heading = one<HTMLElement>(section, "h2");
  const reveals = all<HTMLElement>(section, "[data-about-intro-reveal]");
  const portrait = one<HTMLElement>(section, "[data-about-intro-portrait]");
  if (!heading && !reveals.length && !portrait) return () => undefined;

  if (heading) {
    gsap.fromTo(heading, { y: 40, opacity: 0.88 }, {
      y: 0, opacity: 1, ease: "none",
      scrollTrigger: {
        id: "about-page-introduction-heading",
        trigger: section,
        start: "top 88%",
        end: "top 48%",
        scrub: 0.6,
      },
    });
  }

  if (reveals.length) {
    gsap.fromTo(
      reveals,
      { y: 20, opacity: 0.84 },
      {
        y: 0,
        opacity: 1,
        ease: "none",
        stagger: 0.12,
        scrollTrigger: {
          id: "about-page-introduction-reveal",
          trigger: section,
          start: "top 86%",
          end: "bottom 52%",
          scrub: 0.65,
        },
      },
    );
  }

  if (portrait) {
    gsap.to(portrait, {
      yPercent: -4,
      ease: "none",
      scrollTrigger: {
        id: "about-page-introduction-portrait",
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      },
    });
  }

  return () => undefined;
}
