"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const QUERY =
  "(min-width:1024px) and (min-height:760px) and (prefers-reduced-motion:no-preference)";
const labels = ["Foundation", "Products", "Leadership"];
const stops = [0, 1.15 / 1.85, 1];

export function JourneyPin({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = root?.querySelector<HTMLElement>(".journey-stage");
    const panels = root
      ? Array.from(root.querySelectorAll<HTMLElement>("[data-journey-panel]"))
      : [];
    const progress = root?.querySelector<HTMLElement>(
      "[data-journey-progress]",
    );
    const buttons = root
      ? Array.from(
          root.querySelectorAll<HTMLButtonElement>("[data-journey-goto]"),
        )
      : [];
    if (!root || !stage || panels.length !== 3 || !progress) return;
    const media = gsap.matchMedia();
    media.add(
      QUERY,
      () => {
        const previous = panels.map((p) => ({
          mode: p.dataset.mode,
          aria: p.getAttribute("aria-hidden"),
          inert: p.inert,
        }));
        const priorRootMode = root.dataset.mode,
          priorStageMode = stage.dataset.mode;
        root.dataset.mode = stage.dataset.mode = "desktop";
        panels.forEach((p) => (p.dataset.mode = "desktop"));
        let active = -1;
        const expose = (p: number) => {
          const index = p < 0.75 / 1.85 ? 0 : p < 1.45 / 1.85 ? 1 : 2;
          if (active === index) return;
          active = index;
          panels.forEach((panel, i) => {
            panel.inert = i !== index;
            panel.setAttribute("aria-hidden", String(i !== index));
          });
          buttons.forEach((button, i) => {
            button.dataset.active = String(i === index);
            if (i === index) button.setAttribute("aria-current", "step");
            else button.removeAttribute("aria-current");
          });
        };
        let trigger: ScrollTrigger | undefined;
        const context = gsap.context(() => {
          gsap.set(panels, { yPercent: 100 });
          gsap.set(panels[0], { yPercent: 0 });
          const tl = gsap
            .timeline({ defaults: { ease: "none" } })
            .to(panels[1], { yPercent: 0, duration: 0.8 }, 0.35)
            .to(panels[2], { yPercent: 0, duration: 0.8 }, 1.05)
            .fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: 1.85 }, 0);
          trigger = ScrollTrigger.create({
            id: "journey-story",
            trigger: root,
            pin: stage,
            pinType: "transform",
            pinSpacing: true,
            start: "top 100px",
            end: () => `+=${Math.round(innerHeight * 1.6)}`,
            scrub: true,
            animation: tl,
            invalidateOnRefresh: true,
            onUpdate: (self) => expose(self.progress),
            onRefresh: (self) => {
              root.dataset.scrollStart = String(self.start);
              root.dataset.scrollEnd = String(self.end);
              root.dataset.stageHeight = String(stage.offsetHeight);
              expose(self.progress);
            },
          });
        }, root);
        const navigate = (event: MouseEvent) => {
          const target =
            event.target instanceof Element
              ? event.target.closest<HTMLButtonElement>("[data-journey-goto]")
              : null;
          if (!target || !trigger) return;
          const i = Number(target.dataset.journeyGoto);
          window.scrollTo({
            top: trigger.start + (trigger.end - trigger.start) * stops[i],
            behavior: "auto",
          });
          trigger.update();
        };
        root.addEventListener("click", navigate);
        return () => {
          root.removeEventListener("click", navigate);
          context.revert();
          if (priorRootMode === undefined) delete root.dataset.mode;
          else root.dataset.mode = priorRootMode;
          if (priorStageMode === undefined) delete stage.dataset.mode;
          else stage.dataset.mode = priorStageMode;
          panels.forEach((p, i) => {
            const old = previous[i];
            if (old.mode === undefined) delete p.dataset.mode;
            else p.dataset.mode = old.mode;
            p.inert = old.inert;
            if (old.aria === null) p.removeAttribute("aria-hidden");
            else p.setAttribute("aria-hidden", old.aria);
          });
          buttons.forEach((b) => {
            delete b.dataset.active;
            b.removeAttribute("aria-current");
          });
          delete root.dataset.scrollStart;
          delete root.dataset.scrollEnd;
          delete root.dataset.stageHeight;
        };
      },
      root,
    );
    return () => media.revert();
  }, []);
  return (
    <div
      ref={rootRef}
      className="journey-pin-root group/story relative min-w-0"
    >
      <div className="journey-stage relative grid min-w-0 gap-5 data-[mode=desktop]:block data-[mode=desktop]:h-[min(620px,_calc(100vh_-_140px))] data-[mode=desktop]:min-h-0 data-[mode=desktop]:overflow-clip">
        {children}
        <div
          data-journey-progress
          className="pointer-events-none absolute right-5 bottom-12 left-5 z-20 h-px origin-left scale-x-0 bg-identity-bright sm:right-8 sm:left-8 lg:right-12 lg:left-12"
          aria-hidden="true"
        />
        <div
          className="absolute right-5 bottom-3 z-30 hidden gap-2 group-data-[mode=desktop]/story:flex"
          role="group"
          aria-label="Journey stages"
        >
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              data-journey-goto={i}
              aria-label={`Show ${label.toLowerCase()} stage`}
              aria-controls={`journey-${label.toLowerCase()}-panel`}
              className="grid size-7 place-items-center rounded-full border border-white/25 bg-[#080b0d] font-mono text-[10px] text-slate-300 data-[active=true]:border-identity data-[active=true]:text-identity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-identity"
            >
              0{i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
