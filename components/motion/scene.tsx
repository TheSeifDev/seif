"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { motionQueries, ScrollTrigger, useGSAP } from "./gsap";
import { scenes, type SceneName } from "./scenes";

type SceneProps = {
  name: SceneName;
  as?: "div" | "section";
} & ComponentPropsWithoutRef<"section">;

/**
 * Keep all markup server-rendered; only initialize below-fold motion as the
 * section approaches the viewport. Every deferred tween stays in this scoped
 * GSAP context and is reverted on navigation/media changes.
 */
export function Scene({ name, as = "div", children, ...rest }: SceneProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = ref.current;
      if (!root || !contextSafe) return;
      let initialized = false;
      let refreshFrame = 0;
      const initialize = contextSafe(() => {
        if (initialized) return;
        initialized = true;
        root.dataset.motionReady = "true";
        scenes[name](root);
      });

      const needsInitialPinLayout = ["identity", "featured", "process"].includes(name) &&
        window.matchMedia(motionQueries.stage).matches;
      // Establish desktop pin spacing before the first paint; delaying it
      // would move downstream anchors when a user jumps between sections.
      if (name === "hero" || needsInitialPinLayout || typeof IntersectionObserver === "undefined") {
        initialize();
        return () => { delete root.dataset.motionReady; };
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          observer.disconnect();
          initialize();
          // A newly enabled pin changes downstream positions, so refresh once
          // after its layout has been applied, never on every pointer/scroll.
          refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        },
        { rootMargin: "50% 0px" },
      );
      observer.observe(root);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(refreshFrame);
        delete root.dataset.motionReady;
      };
    },
    { scope: ref, dependencies: [name], revertOnUpdate: true },
  );

  if (as === "section") {
    return (
      <section ref={ref} data-scene={name} {...rest}>
        {children}
      </section>
    );
  }
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} data-scene={name} {...rest}>
      {children}
    </div>
  );
}
