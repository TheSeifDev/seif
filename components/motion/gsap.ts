"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Mobile URL-bar show/hide must not re-measure every pin.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Media queries shared by every animated component. */
export const motionQueries = {
  /** Wide and tall enough for pinned / horizontal storytelling (Tailwind `stage:`). */
  stage:
    "(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)",
  /** Any viewport that allows motion. */
  motion: "(prefers-reduced-motion: no-preference)",
  /** Motion allowed but the viewport is too small for pinning. */
  compact:
    "(prefers-reduced-motion: no-preference) and ((max-width: 1023px) or (max-height: 759px))",
} as const;

export { gsap, ScrollTrigger, useGSAP };
