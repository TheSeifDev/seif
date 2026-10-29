"use client";

import { useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The root owns identity, not every animation. Pin and scene controllers own
// their refs/timelines. Never observe the page height: pinSpacing changes it.
export function ScrollExperience({ children }: { children: ReactNode }) {
  useEffect(() => {
    let disposed = false;
    let frame = 0;
    document.fonts.ready.then(() => {
      if (!disposed)
        frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="portfolio bg-[#080b0d] text-[#f4f5f2] [--accent:#49baf1] [--accent-on-light:#076c9b] [--accent-on-dark:#49baf1] [--page-gutter:20px] [--shell-margin:8px] [--section-radius:26px] [--surface-pad:calc(var(--page-gutter)_-_var(--shell-margin))] sm:[--page-gutter:32px] sm:[--shell-margin:12px] sm:[--section-radius:34px] lg:[--page-gutter:48px] xl:[--page-gutter:64px] xl:[--shell-margin:18px] xl:[--section-radius:42px] 2xl:[--page-gutter:72px]"
      data-identity="blue"
    >
      {children}
    </div>
  );
}
