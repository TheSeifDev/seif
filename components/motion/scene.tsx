"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { useGSAP } from "./gsap";
import { scenes, type SceneName } from "./scenes";

type SceneProps = {
  name: SceneName;
  as?: "div" | "section";
} & ComponentPropsWithoutRef<"section">;

/**
 * Wraps server-rendered markup and runs one named scroll scene inside a
 * scoped GSAP context. Unmounting (route change) reverts every tween,
 * ScrollTrigger and pin created by the scene.
 */
export function Scene({ name, as = "div", children, ...rest }: SceneProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (ref.current) scenes[name](ref.current);
    },
    { scope: ref },
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
