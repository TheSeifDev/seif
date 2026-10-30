import { ScrollTrigger } from "@/components/motion/gsap";

/** Native disclosure changes affect the downstream CTA/footer trigger offsets. */
export function faqLayoutScene(root: HTMLElement): () => void {
  const faq = root.querySelector<HTMLElement>("#about-faq");
  if (!faq) return () => undefined;
  let frame = 0;
  const refresh = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      ScrollTrigger.refresh();
    });
  };
  faq.addEventListener("toggle", refresh, true);
  return () => {
    cancelAnimationFrame(frame);
    faq.removeEventListener("toggle", refresh, true);
  };
}
