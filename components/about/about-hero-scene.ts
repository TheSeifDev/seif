import { gsap } from "@/components/motion/gsap";

/** Called inside AboutMotion's motion context; GSAP owns and reverts all state. */
export function aboutHeroScene(root: HTMLElement): () => void {
  const hero = root.querySelector<HTMLElement>("[data-about-hero]");
  if (!hero) return () => undefined;
  const copy = hero.querySelector<HTMLElement>("[data-about-hero-copy]");
  const art = hero.querySelector<HTMLElement>("[data-about-hero-art]");
  const world = hero.querySelector<HTMLElement>("[data-about-hero-world]");
  const kanji = hero.querySelector<HTMLElement>("[data-about-hero-kanji]");

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
  if (copy) timeline.to(copy, { y: () => (window.innerWidth >= 1024 ? -48 : -20) }, 0);
  if (art) timeline.to(art, { y: () => (window.innerWidth >= 1024 ? -72 : -28) }, 0);
  if (world) timeline.to(world, { yPercent: 8, scale: 1.06 }, 0);
  if (kanji) timeline.to(kanji, { rotate: 5, yPercent: -8 }, 0);

  return () => undefined;
}
