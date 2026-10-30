import { gsap } from "@/components/motion/gsap";

/** Only subtle scroll motion; the original PageHero composition stays intact. */
export function aboutHeroScene(root: HTMLElement): () => void {
  const hero = root.querySelector<HTMLElement>("[data-about-hero] section");
  if (!hero) return () => undefined;
  const title = hero.querySelector<HTMLElement>("h1");
  const copy = title?.nextElementSibling;
  const background = hero.querySelector<HTMLImageElement>("img");

  const timeline = gsap.timeline({
    defaults: { ease: "none", duration: 1 },
    scrollTrigger: {
      id: "about-page-hero-scroll",
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: 0.65,
      invalidateOnRefresh: true,
    },
  });
  if (title) timeline.to(title, { y: () => (window.innerWidth >= 1024 ? -24 : -12) }, 0);
  if (copy) timeline.to(copy, { y: () => (window.innerWidth >= 1024 ? -16 : -8) }, 0);
  if (background) {
    timeline.fromTo(background, { scale: 1.04, yPercent: -2 }, { scale: 1.08, yPercent: 2 }, 0);
  }
  return () => undefined;
}
