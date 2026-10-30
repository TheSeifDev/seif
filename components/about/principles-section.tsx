import { Box, Code2, Layers, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
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
      <div
        data-principles-pin
        className="py-24 lg:py-36 group-data-[enhanced=true]/principles:flex group-data-[enhanced=true]/principles:h-[100svh] group-data-[enhanced=true]/principles:flex-col group-data-[enhanced=true]/principles:justify-center group-data-[enhanced=true]/principles:pb-10 group-data-[enhanced=true]/principles:pt-[5.5rem]"
      >
        <div className={cn(container, "w-full")}>
          <SectionHeading
            index="05"
            label={c("about.principles.sectionLabel", "Principles")}
            title={
              <CmsTitle
                text={c(
                  "about.principles.title",
                  "The standard behind the output.",
                )}
                accent="output"
              />
            }
            id="principles-heading"
            aside={c(
              "about.principles.aside",
              "Approach matters: these are working principles, not claims about outcomes.",
            )}
          />
          <ol
            data-principles-row
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 group-data-[enhanced=true]/principles:mt-10 group-data-[enhanced=true]/principles:flex group-data-[enhanced=true]/principles:h-[min(480px,calc(100svh-23rem))] group-data-[enhanced=true]/principles:gap-3 short:group-data-[enhanced=true]/principles:mt-8"
          >
            {principles.map((principle, index) => {
              const Icon = principleIcons[principle.icon] ?? Box;
              const id = `principle-${index + 1}`;
              return (
                <li
                  key={principle.title}
                  data-principle
                  className="relative isolate min-w-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-night-2 group-data-[enhanced=true]/principles:flex-1"
                >
                  <span
                    aria-hidden="true"
                    data-principle-glow
                    className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-[radial-gradient(85%_100%_at_30%_100%,rgb(77_182_255/0.2),transparent_70%)] group-data-[enhanced=true]/principles:opacity-0"
                  />
                  <div
                    aria-hidden="true"
                    data-principle-collapsed
                    className="absolute inset-0 hidden flex-col items-center justify-between py-8 group-data-[enhanced=true]/principles:flex"
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
                    className="relative flex h-full min-h-[300px] flex-col p-7 sm:p-9 group-data-[enhanced=true]/principles:w-[min(560px,46vw)] group-data-[enhanced=true]/principles:min-h-0"
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
          <div
            aria-hidden="true"
            className="mt-6 hidden items-center gap-5 group-data-[enhanced=true]/principles:flex"
          >
            <span
              data-principles-counter
              className="w-6 font-mono text-[12px] tabular-nums tracking-[0.12em] text-snow"
            >
              01
            </span>
            <span className="relative h-px flex-1 overflow-hidden bg-white/10">
              <span
                data-principles-fill
                className="absolute inset-0 origin-left bg-sky [transform:scaleX(0)]"
              />
            </span>
            <span className="font-mono text-[12px] tabular-nums tracking-[0.12em] text-mist">
              {pad(principles.length)}
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
