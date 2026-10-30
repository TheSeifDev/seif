import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { container, label } from "@/lib/ui/layout";
import { JOURNEY_STACK_STEP, JOURNEY_STACK_TOP } from "@/lib/ui/journey-stack";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import { SectionHeading } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";

/** Four factual cards, borrowing Education's quiet light and raised surface. */
export function Journey({ content }: { content: SiteContent }) {
  const { journey, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  return (
    <Scene
      name="journey"
      as="section"
      id="journey"
      aria-labelledby="journey-title"
      className="group/journey relative bg-night py-24 lg:py-36"
    >
      <div className={container}>
        <SectionHeading
          index="03"
          label={c("home.journey.sectionLabel", "The journey")}
          id="journey-title"
          title={
            <CmsTitle
              text={c("home.journey.title", "Built through every layer.")}
              accent="every layer"
            />
          }
          aside={c(
            "home.journey.aside",
            "Five-plus years — from first interfaces to leading a cross-functional engineering team.",
          )}
        />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <aside
            className="hidden lg:col-span-3 lg:block"
            aria-label={c(
              "home.journey.chapterIndexLabel",
              "Journey chapter index",
            )}
          >
            <div className="sticky top-32">
              <p className={cn(label, "text-mist")}>
                {c("home.journey.practiceLabel", "A continuous practice")}
              </p>
              <p
                aria-hidden="true"
                className="mt-7 font-display text-[6.5rem] font-extrabold leading-none tracking-[-0.06em] text-snow"
              >
                <span data-rail-counter>01</span>
                <span className="ml-3 align-top font-mono text-xs font-normal tracking-normal text-mist">
                  / {String(journey.length).padStart(2, "0")}
                </span>
              </p>
              <ol className="relative mt-10 space-y-7 pl-6">
                <li
                  aria-hidden="true"
                  className="absolute bottom-1 left-0 top-1 w-px bg-white/10"
                >
                  <span
                    data-rail-fill
                    className="absolute inset-0 origin-top scale-y-0 bg-sky motion-reduce:scale-y-100"
                  />
                </li>
                {journey.map((chapter, index) => (
                  <li
                    key={chapter.id}
                    data-rail-item
                    data-active={index === 0 ? "" : undefined}
                    className="group/rail relative text-mist transition-colors duration-300 data-active:text-snow motion-reduce:text-snow"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[27px] top-1 size-[7px] rounded-full border border-white/25 bg-night transition-colors duration-300 group-data-active/rail:border-sky group-data-active/rail:bg-sky"
                    />
                    <a
                      href={`#chapter-${chapter.id}`}
                      className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.17em]">
                        {chapter.index} / {chapter.meaning}
                      </span>
                      <span className="mt-1.5 block text-sm leading-snug">
                        {chapter.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <ol
            data-chapters
            className="flex min-w-0 flex-col gap-6 sm:gap-8 lg:col-span-9 lg:gap-10 stage:group-data-[stacked=true]/journey:gap-0"
          >
            {journey.map((chapter, index) => (
              <li
                key={chapter.id}
                data-chapter
                data-active={index === 0 ? "" : undefined}
                className="group/chapter group-data-[stacked=true]/journey:sticky group-data-[stacked=true]/journey:h-[calc(100svh-10rem)]"
                style={{
                  top: `${JOURNEY_STACK_TOP + index * JOURNEY_STACK_STEP}px`,
                }}
              >
                <article
                  data-chapter-inner
                  data-journey-card
                  data-spotlight
                  data-cursor="preview"
                  aria-labelledby={`chapter-${chapter.id}`}
                  className="group/card relative isolate origin-top rounded-[32px] bg-white/[0.07] p-px transition-colors duration-500 group-data-active/chapter:bg-sky/25 group-data-[stacked=true]/journey:h-full"
                >
                  <span
                    data-journey-shade
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20 rounded-[32px] bg-night opacity-0"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] bg-[radial-gradient(300px_circle_at_var(--spot-x,30%)_var(--spot-y,0px),rgb(125_200_255/0.22),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
                  />
                  <div className="relative flex min-h-[400px] flex-col overflow-hidden rounded-[31px] bg-night-2 p-6 sm:min-h-[440px] sm:p-9 lg:min-h-[480px] lg:p-10 group-data-[stacked=true]/journey:h-full group-data-[stacked=true]/journey:min-h-0 short:lg:p-7">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(70%_90%_at_90%_100%,rgb(77_182_255/0.12),transparent_70%)]"
                    />
                    <span
                      data-journey-kanji
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 top-7 select-none font-jp text-[clamp(8rem,16vw,13rem)] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgb(77_182_255/0.16)] sm:-right-1"
                    >
                      {chapter.kanji}
                    </span>

                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                      <p
                        className={cn(
                          label,
                          "flex items-center gap-3 text-sky",
                        )}
                      >
                        <span>{chapter.index}</span>
                        <span
                          aria-hidden="true"
                          className="h-px w-7 bg-sky/30"
                        />
                        <span>{chapter.meaning}</span>
                      </p>
                      <p className={cn(label, "text-mist")}>{chapter.period}</p>
                    </div>
                    <div className="relative flex-1">
                      <h3
                        id={`chapter-${chapter.id}`}
                        className="mt-14 max-w-2xl scroll-mt-32 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.035em] text-snow text-balance"
                      >
                        {chapter.title}
                      </h3>
                      <p className="mt-6 max-w-[37rem] text-base leading-[1.8] text-mist">
                        {chapter.body}
                      </p>
                    </div>
                    <dl className="relative mt-9 grid gap-5 border-t border-white/[0.08] pt-6 sm:grid-cols-3 lg:mt-10">
                      {chapter.facts.map((fact) => (
                        <div key={fact.label} className="min-w-0">
                          <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                            {fact.label}
                          </dt>
                          <dd className="mt-2 text-[13px] leading-relaxed text-snow/90">
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Scene>
  );
}
