"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type ProjectRailProps = {
  children: ReactNode;
};

export function ProjectRail({ children }: ProjectRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const maxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0);
    setCanScrollPrevious(rail.scrollLeft > 1);
    setCanScrollNext(rail.scrollLeft < maxScrollLeft - 1);
  }, []);

  const getScrollBehavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  const scrollProjects = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.8, 1),
      behavior: getScrollBehavior(),
    });
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const handleScroll = () => updateControls();
    const resizeObserver = new ResizeObserver(updateControls);

    rail.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateControls);
    resizeObserver.observe(rail);
    updateControls();

    return () => {
      rail.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateControls);
      resizeObserver.disconnect();
    };
  }, [children, updateControls]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    scrollProjects(event.key === "ArrowLeft" ? -1 : 1);
  };

  return (
    <div className="project-rail-wrap">
      <div className="rail-controls" aria-label="Project rail controls">
        <button
          className="prev"
          type="button"
          aria-label="Scroll previous projects"
          disabled={!canScrollPrevious}
          onClick={() => scrollProjects(-1)}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <button
          className="next"
          type="button"
          aria-label="Scroll next projects"
          disabled={!canScrollNext}
          onClick={() => scrollProjects(1)}
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div
        ref={railRef}
        className="project-rail"
        tabIndex={0}
        aria-label="Project previews"
        role="region"
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
}
