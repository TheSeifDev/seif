"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

const HOVER_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Decorative contour only. The original portrait is never filtered or transformed. */
export function PortraitShield({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const spotlight = useRef<SVGRadialGradientElement>(null);
  const uid = useId().replace(/:/g, "");
  const edgeId = `shield-edge-${uid}`;
  const glowId = `shield-glow-${uid}`;
  const maskId = `shield-spot-${uid}`;
  const gradientId = `shield-gradient-${uid}`;

  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const media = window.matchMedia(HOVER_QUERY);
    let teardown = () => {};
    const configure = () => {
      teardown();
      host.dataset.tracking = media.matches ? "true" : "false";
      host.dataset.active = "false";
      host.style.setProperty("--shield-energy", media.matches ? "0.08" : "0.12");
      if (!media.matches) return;

      let bounds: DOMRect | null = null;
      let frame = 0;
      let x = 0.5;
      let y = 0.4;
      const paint = () => {
        frame = 0;
        spotlight.current?.setAttribute("cx", String(x * 1200));
        spotlight.current?.setAttribute("cy", String(y * 1600));
        host.style.setProperty("--shield-x", `${((x - 0.5) * 2.5).toFixed(2)}px`);
        host.style.setProperty("--shield-y", `${((y - 0.5) * 2.5).toFixed(2)}px`);
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
      const enter = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        bounds = host.getBoundingClientRect();
        host.dataset.active = "true";
        host.style.setProperty("--shield-energy", "0.85");
        move(event);
      };
      const move = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        if (!bounds) bounds = host.getBoundingClientRect();
        x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
        schedule();
      };
      const leave = () => {
        host.dataset.active = "false";
        host.style.setProperty("--shield-energy", "0.08");
        x = 0.5; y = 0.4;
        schedule();
        bounds = null;
      };
      const invalidate = () => { bounds = null; };
      const observer = new ResizeObserver(invalidate);
      observer.observe(host);
      host.addEventListener("pointerenter", enter, { passive: true });
      host.addEventListener("pointermove", move, { passive: true });
      host.addEventListener("pointerleave", leave, { passive: true });
      window.addEventListener("scroll", invalidate, { passive: true });
      window.addEventListener("blur", leave);
      teardown = () => {
        host.removeEventListener("pointerenter", enter);
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerleave", leave);
        window.removeEventListener("scroll", invalidate);
        window.removeEventListener("blur", leave);
        observer.disconnect();
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        host.style.removeProperty("--shield-x");
        host.style.removeProperty("--shield-y");
        host.dataset.active = "false";
      };
    };
    configure();
    media.addEventListener("change", configure);
    return () => {
      media.removeEventListener("change", configure);
      teardown();
      host.style.removeProperty("--shield-energy");
    };
  }, []);

  return (
    <div ref={root} data-portrait-shield data-active="false" data-tracking="false" className="pointer-events-auto absolute inset-0 isolate">
      <svg aria-hidden="true" viewBox="0 0 1200 1600" preserveAspectRatio="xMidYMax meet" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <filter id={edgeId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="expanded" />
            <feComposite in="expanded" in2="SourceAlpha" operator="out" result="edge" />
            <feFlood floodColor="#8fd5ff" />
            <feComposite in2="edge" operator="in" />
          </filter>
          <filter id={glowId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="expanded" />
            <feComposite in="expanded" in2="SourceAlpha" operator="out" result="edge" />
            <feGaussianBlur in="edge" stdDeviation="6" result="soft" />
            <feFlood floodColor="#4db6ff" />
            <feComposite in2="soft" operator="in" />
          </filter>
          <radialGradient ref={spotlight} id={gradientId} gradientUnits="userSpaceOnUse" cx="600" cy="640" r="590">
            <stop offset="0" stopColor="white" />
            <stop offset="0.42" stopColor="white" stopOpacity="0.75" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-60" y="-80" width="1320" height="1760">
            <rect x="-60" y="-80" width="1320" height="1760" fill={`url(#${gradientId})`} />
          </mask>
        </defs>
        <image href="/images/portrait-silhouette.png" width="1200" height="1600" filter={`url(#${edgeId})`} opacity="0.12" />
        <g mask={`url(#${maskId})`} className="opacity-(--shield-energy,0.12) transition-opacity duration-250 motion-reduce:transition-none">
          <image href="/images/portrait-silhouette.png" width="1200" height="1600" filter={`url(#${glowId})`} opacity="0.6" />
          <image href="/images/portrait-silhouette.png" width="1200" height="1600" filter={`url(#${edgeId})`} className="[transform:translate(var(--shield-x,0px),var(--shield-y,0px))]" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0">{children}</div>
    </div>
  );
}
