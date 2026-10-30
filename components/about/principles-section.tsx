import { Box, Code2, Layers, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/system/primitives";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
const pad = (value: number) => String(value).padStart(2, "0");
const principleIcons: Record<string, typeof Box> = {
  box: Box,
  code: Code2,
  layers: Layers,
  user: UserRound,
};
export function PrinciplesSection({ content }: { content: SiteContent }) {
  const { principles, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  return (
    <section
      id="principles"
      data-about-chapter="principles"
      className="group/principles relative bg-night text-snow"
      aria-labelledby="principles-heading"
    >
      <div data-principles-pin className="py-24 lg:py-36">
        <div className={cn(container, "w-full")}>
          <SectionHeading
            index="05"
            label={c("about.principles.sectionLabel", "Principles")}
            title={c(
              "about.principles.title",
              "The standard behind the output.",
            )}
            id="principles-heading"
            aside={c(
              "about.principles.aside",
              "Approach matters: these are working principles, not claims about outcomes.",
            )}
          />
          <ol
            data-principles-row
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20"
          >
            {principles.map((principle, index) => {
              const Icon = principleIcons[principle.icon] ?? Box;
              const id = `principle-${index + 1}`;
              return (
                <li
                  key={principle.title}
                  data-principle
                  className="relative isolate min-w-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-night-2"
                >
                  <div
                    aria-hidden="true"
                    data-principle-collapsed
                    className="absolute inset-0 hidden flex-col items-center justify-between py-8"
                  >
                    <span className="font-mono text-[12px] tracking-[0.16em] text-mist">
                      {pad(index + 1)}
                    </span>
                    <span className="rotate-180 whitespace-nowrap font-display text-[1.35rem] font-bold tracking-[-0.02em] text-snow/75 [writing-mode:vertical-rl]">
                      {principle.title}
                    </span>
                    <Icon className="size-5 text-sky/70" strokeWidth={1.5} />
                  </div>
                  <article
                    data-principle-body
                    aria-labelledby={id}
                    className="relative flex h-full min-h-[300px] flex-col p-7 sm:p-9"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <span
                        aria-hidden="true"
                        className="font-display text-[clamp(3.5rem,6vw,5.75rem)] font-extrabold leading-[0.8] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_rgb(77_182_255/0.65)]"
                      >
                        {pad(index + 1)}
                      </span>
                      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border border-sky/20 bg-sky/10 text-sky">
                        <Icon
                          className="size-6"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <h3
                      id={id}
                      className="mt-auto pt-14 font-display text-[clamp(1.75rem,2.6vw,2.6rem)] font-bold leading-[1.02] tracking-[-0.035em] text-snow"
                    >
                      {principle.title}
                    </h3>
                    <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mist">
                      {principle.body}
                    </p>
                  </article>
                </li>
              );
            })}
          </ol>
          <div aria-hidden="true" className="mt-6 hidden items-center gap-5">
            <span className="font-mono text-[12px] tabular-nums tracking-[0.12em] text-snow">
              01
            </span>
            <span className={cn(label, "text-mist")}>
              {c("about.principles.scrollLabel", "Scroll")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
