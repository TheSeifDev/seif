"use client";

import { useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { label } from "@/lib/ui/layout";

type FeaturedTechFilterProps = {
  technologies: readonly string[];
  total: number;
};

const ALL_TECHNOLOGIES = "all";

function resultLabel(count: number) {
  return `${count} ${count === 1 ? "project" : "projects"}`;
}

/**
 * The controls are hydrated separately from the cards: every project and link
 * is still emitted by the server, while this small client island only toggles
 * visibility and tells the motion scene to rebuild its measured track.
 */
export function FeaturedTechFilter({
  technologies,
  total,
}: FeaturedTechFilterProps) {
  const [selected, setSelected] = useState(ALL_TECHNOLOGIES);
  const [count, setCount] = useState(total);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const technology = event.target.value;
    const scene = event.currentTarget.closest<HTMLElement>('[data-scene="featured"]');
    if (!scene) return;

    const slides = Array.from(scene.querySelectorAll<HTMLElement>("[data-slide]"));
    let visibleCount = 0;

    slides.forEach((slide) => {
      const stack = slide.dataset.techStack?.split("|") ?? [];
      const visible = technology === ALL_TECHNOLOGIES || stack.includes(technology);
      slide.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    setSelected(technology);
    setCount(visibleCount);
    scene.dataset.featuredFilter = technology;
    const totalElement = scene.querySelector<HTMLElement>("[data-featured-total]");
    if (totalElement) totalElement.textContent = String(visibleCount).padStart(2, "0");
    scene.dispatchEvent(
      new CustomEvent("featured-filter-change", {
        detail: { technology, count: visibleCount },
      }),
    );
  };

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3" data-featured-filter>
      <label htmlFor="featured-tech-stack" className={cn(label, "text-slate-ink")}>
        Filter by tech stack
      </label>
      <select
        id="featured-tech-stack"
        value={selected}
        onChange={handleChange}
        className="min-w-44 rounded-full border border-ink/15 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink shadow-sm outline-none transition-colors hover:border-ink/35 focus-visible:border-sky-ink focus-visible:ring-2 focus-visible:ring-sky-ink/30"
        aria-label="Filter featured projects by technology"
      >
        <option value={ALL_TECHNOLOGIES}>All technologies</option>
        {technologies.map((technology) => (
          <option key={technology} value={technology}>
            {technology}
          </option>
        ))}
      </select>
      <p
        aria-live="polite"
        aria-atomic="true"
        className="font-mono text-[11px] tracking-[0.12em] text-slate-ink"
      >
        {resultLabel(count)}
      </p>
    </div>
  );
}
