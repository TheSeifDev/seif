"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "./gsap";

declare global {
  interface Window {
    /** Read-only inspection hook for QA scripts. */
    __motion?: { triggers: () => string[]; pins: () => number };
  }
}

/**
 * Pages own their triggers through scoped useGSAP hooks, which revert on
 * unmount. This component only re-measures once the new route has painted
 * and once web fonts finish loading, so pin spacing reflects final layout.
 */
export function RouteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    window.__motion = {
      triggers: () =>
        ScrollTrigger.getAll().map((trigger) => String(trigger.vars.id ?? "")),
      pins: () => document.querySelectorAll(".pin-spacer").length,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
