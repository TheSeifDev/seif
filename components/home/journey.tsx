import { journey } from "@/lib/content/profile";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import { Accent, SectionHeading } from "@/components/system/primitives";

/** Four factual chapters on an open editorial spread, not a stack of cards. */
export function Journey() {
  return (
    <Scene
      name="journey"
      as="section"
      id="journey"
      aria-labelledby="journey-title"
      className="relative bg-night py-24 lg:py-36"
    >
      <div className={container}>
        <SectionHeading
          index="03"
          label="The journey"
          id="journey-title"
          title={<>Built through <Accent>every layer.</Accent></>}
          aside="Five-plus years — from first interfaces to leading a cross-functional engineering team."
        />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <aside className="hidden lg:col-span-3 lg:block" aria-label="Journey chapter index">
            <div className="sticky top-32">
              <p className={cn(label, "text-mist")}>A continuous practice</p>
              <p aria-hidden="true" className="mt-7 font-display text-[6.5rem] font-extrabold leading-none tracking-[-0.06em] text-snow">
                <span data-rail-counter>01</span>
                <span className="ml-3 align-top font-mono text-xs font-normal tracking-normal text-mist">/ 04</span>
              </p>
              <ol className="relative mt-10 space-y-7 pl-6">
                <li aria-hidden="true" className="absolute bottom-1 left-0 top-1 w-px bg-white/10">
                  <span data-rail-fill className="absolute inset-0 origin-top scale-y-0 bg-sky motion-reduce:scale-y-100" />
                </li>
                {journey.map((chapter, index) => (
                  <li
                    key={chapter.id}
                    data-rail-item
                    data-active={index === 0 ? "" : undefined}
                    className="group/rail relative text-mist transition-colors duration-300 data-active:text-snow motion-reduce:text-snow"
                  >
                    <span aria-hidden="true" className="absolute -left-[27px] top-1 size-[7px] rounded-full border border-white/25 bg-night transition-colors duration-300 group-data-active/rail:border-sky group-data-active/rail:bg-sky" />
                    <a href={`#chapter-${chapter.id}`} className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky">
                      <span className="font-mono text-[10px] uppercase tracking-[0.17em]">{chapter.index} / {chapter.meaning}</span>
                      <span className="mt-1.5 block text-sm leading-snug">{chapter.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <ol data-chapters className="min-w-0 lg:col-span-9">
            {journey.map((chapter, index) => (
              <li
                key={chapter.id}
                data-chapter
                data-active={index === 0 ? "" : undefined}
                className="group/chapter relative border-t border-white/12 py-10 first:pt-8 last:pb-0 sm:py-14 lg:min-h-[440px] lg:py-16"
              >
                <article data-chapter-inner aria-labelledby={`chapter-${chapter.id}`} className="grid gap-7 sm:grid-cols-[4.5rem_minmax(0,1fr)] lg:gap-10">
                  <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start">
                    <p className="font-mono text-xs tracking-[0.16em] text-mist transition-colors duration-300 group-data-active/chapter:text-sky">{chapter.index}</p>
                    <span lang="ja" aria-hidden="true" className="font-jp text-[2.75rem] font-medium leading-none text-snow/40 transition-colors duration-300 group-data-active/chapter:text-sky/80 sm:mt-12 sm:text-5xl">{chapter.kanji}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className={cn(label, "text-mist")}>{chapter.period}</p>
                      <p aria-hidden="true" className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">{chapter.reading} / {chapter.meaning}</p>
                    </div>
                    <h3 id={`chapter-${chapter.id}`} className="mt-5 max-w-2xl scroll-mt-32 font-display text-[clamp(2rem,3.6vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.035em] text-snow text-balance">{chapter.title}</h3>
                    <p className="mt-6 max-w-[37rem] text-base leading-[1.8] text-mist">{chapter.body}</p>
                    <dl className="mt-8 grid gap-6 border-t border-white/8 pt-6 sm:grid-cols-3 lg:mt-10">
                      {chapter.facts.map((fact) => (
                        <div key={fact.label} className="min-w-0">
                          <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">{fact.label}</dt>
                          <dd className="mt-2 text-[13px] leading-relaxed text-snow/90">{fact.value}</dd>
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
