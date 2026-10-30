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

/** Coalesce route/font layout measurements and cancel them on navigation. */
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
    let frame = 0;
    const scheduleRefresh = () => {
      if (cancelled || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!cancelled) ScrollTrigger.refresh();
      });
    };
    scheduleRefresh();
    if (document.fonts?.status !== "loaded") {
      document.fonts?.ready.then(scheduleRefresh);
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
