"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { useSiteContent } from "@/components/site/site-content-provider";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { TechnologyIcon } from "@/components/system/technology-icon";

const durations = ["64s", "76s", "70s"];

/**
 * Three CSS-driven rows (left, right, left). Rows pause on hover/focus,
 * when the section leaves the viewport, and via the explicit toggle.
 * prefers-reduced-motion shows a static, wrapped list instead.
 */
export function SkillsMarquee({ rows }: { rows: SiteContent["marqueeRows"] }) {
  const { copy } = useSiteContent();
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const rootRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const running = !paused && visible;

  return (
    <div
      ref={rootRef}
      data-marquee-state={running ? "running" : "paused"}
      className="group/marquee"
    >
      <div className={cn(container, "flex justify-end motion-reduce:hidden")}>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-[13px] font-medium text-snow transition-colors hover:border-sky/50 hover:text-sky focus-visible:outline-2 focus-visible:outline-sky"
        >
          {paused ? (
            <Play className="size-3.5 fill-current" aria-hidden="true" />
          ) : (
            <Pause className="size-3.5 fill-current" aria-hidden="true" />
          )}
          {paused
            ? c("home.skills.playMotion", "Play motion")
            : c("home.skills.pauseMotion", "Pause motion")}
        </button>
      </div>

      <div className="mt-8 space-y-10">
        {rows.map((row, rowIndex) => (
          <div key={row.label}>
            <div className={cn(container, "mb-4 flex items-center gap-4")}>
              <p className={cn(label, "text-snow/90")}>
                <span className="text-mist">0{rowIndex + 1}</span>
                <span className="ml-3">{row.label}</span>
              </p>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-white/[0.08]"
              />
              <p className="text-[13px] text-mist">{row.caption}</p>
            </div>
            <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] motion-reduce:[mask-image:none]">
              <div
                style={
                  {
                    "--marquee-duration":
                      durations[rowIndex % durations.length],
                  } as React.CSSProperties
                }
                className={cn(
                  "flex w-max hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] group-data-[marquee-state=paused]/marquee:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none",
                  row.direction === "left"
                    ? "animate-marquee-left"
                    : "animate-marquee-right",
                )}
              >
                {[0, 1].map((copy) => (
                  <ul
                    key={copy}
                    aria-hidden={copy === 1 ? true : undefined}
                    aria-label={
                      copy === 0
                        ? c(
                            "home.skills.technologiesAriaLabel",
                            "{label} technologies",
                          ).replace("{label}", row.label)
                        : undefined
                    }
                    className={cn(
                      "flex shrink-0 gap-3 pr-3 motion-reduce:flex-wrap motion-reduce:px-5 motion-reduce:sm:px-8 motion-reduce:lg:px-12",
                      copy === 1 && "motion-reduce:hidden",
                    )}
                  >
                    {row.items.map((item) => (
                      <li
                        key={item}
                        className="group/chip flex h-14 items-center gap-3 rounded-full border border-white/[0.08] bg-night-2 px-5 text-[15px] font-medium text-snow/85 transition-colors duration-300 hover:border-sky/40 hover:text-snow"
                      >
                        <span className="inline-flex text-mist transition-colors duration-300 group-hover/chip:text-sky">
                          <TechnologyIcon name={item} size={18} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
