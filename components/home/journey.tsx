import Image from "next/image";
import type { CSSProperties } from "react";
import { assets, journey } from "@/lib/content/profile";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import { Accent, SectionHeading } from "@/components/system/primitives";

const landscapeFocus = ["12%", "38%", "64%", "90%"];

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
          index="02"
          label="Journey"
          id="journey-title"
          title={
            <>
              A journey through <Accent>every layer</Accent>
            </>
          }
          aside="Five-plus years — from first interfaces to leading a cross-functional engineering team."
        />

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12">
          <aside aria-hidden="true" className="hidden lg:col-span-4 stage:block">
            <div className="sticky top-32">
              <p className="font-display text-[7rem] font-extrabold leading-none tracking-[-0.05em]">
                <span data-rail-counter>01</span>
                <span className="ml-2 align-top font-mono text-sm font-medium tracking-normal text-mist">
                  / {String(journey.length).padStart(2, "0")}
                </span>
              </p>
              <ol className="relative mt-10 space-y-7 pl-7">
                <span className="absolute bottom-1 left-0 top-1 w-px bg-white/10">
                  <span
                    data-rail-fill
                    className="absolute inset-0 origin-top scale-y-0 bg-sky"
                  />
                </span>
                {journey.map((chapter, index) => (
                  <li
                    key={chapter.id}
                    data-rail-item
                    data-active={index === 0 ? "" : undefined}
                    className="group/rail relative text-mist transition-colors duration-500 data-active:text-snow"
                  >
                    <span className="absolute -left-[31px] top-1.5 size-2 rounded-full border border-white/25 bg-night transition-colors duration-500 group-data-active/rail:border-sky group-data-active/rail:bg-sky" />
                    <span className="font-mono text-[11px] tracking-[0.18em]">
                      {chapter.index} · {chapter.meaning.toUpperCase()}
                    </span>
                    <span className="mt-1 block text-[15px] font-medium">
                      {chapter.title}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <ol data-chapters className="space-y-6 lg:col-span-12 stage:col-span-8 stage:space-y-0">
            {journey.map((chapter, index) => (
              <li
                key={chapter.id}
                data-chapter
                style={{ "--stack-offset": `${index * 14}px` } as CSSProperties}
                className="stage:sticky stage:top-[calc(7rem+var(--stack-offset))] stage:mb-[14vh] stage:h-[min(540px,calc(100svh-10rem))] stage:last:mb-0"
              >
                <article
                  data-chapter-inner
                  aria-labelledby={`chapter-${chapter.id}`}
                  className="relative grid h-full origin-top overflow-hidden rounded-[32px] border border-white/[0.08] bg-night-2 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
                >
                  <div className="flex flex-col p-7 sm:p-10 lg:p-12">
                    <div className="flex items-center justify-between gap-4">
                      <p className={cn(label, "flex items-center gap-3 text-mist")}>
                        <span>Chapter {chapter.index}</span>
                        <span aria-hidden="true" className="size-1 rounded-full bg-sky" />
                        <span className="text-sky">{chapter.period}</span>
                      </p>
                      <span
                        lang="ja"
                        aria-hidden="true"
                        className="font-jp text-4xl font-bold text-sky/80 md:hidden"
                      >
                        {chapter.kanji}
                      </span>
                    </div>
                    <h3
                      id={`chapter-${chapter.id}`}
                      className="mt-6 font-display text-[clamp(2rem,3.2vw,3rem)] font-bold leading-[1] tracking-[-0.03em] text-balance"
                    >
                      {chapter.title}
                    </h3>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-mist">
                      {chapter.body}
                    </p>
                    <dl className="mt-8 divide-y divide-white/[0.08] border-t border-white/[0.08] md:mt-auto">
                      {chapter.facts.map((fact) => (
                        <div
                          key={fact.label}
                          className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 py-3"
                        >
                          <dt className={cn(label, "self-center text-mist")}>
                            {fact.label}
                          </dt>
                          <dd className="text-[15px] text-snow/90">{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div
                    aria-hidden="true"
                    className="relative hidden overflow-hidden border-l border-white/[0.06] md:block"
                  >
                    <Image
                      src={assets.heroBackground}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 26vw, 40vw"
                      className="object-cover opacity-30"
                      style={{ objectPosition: `${landscapeFocus[index]} 50%` }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(77,182,255,0.16),transparent_70%),linear-gradient(180deg,rgba(11,14,19,0.2),#0b0e13)]" />
                    <span
                      lang="ja"
                      className="absolute inset-0 flex items-center justify-center font-jp text-[clamp(8rem,14vw,12rem)] font-bold leading-none text-sky/[0.06] [-webkit-text-stroke:1.5px_rgba(77,182,255,0.7)]"
                    >
                      {chapter.kanji}
                    </span>
                    <p className="absolute inset-x-8 bottom-7 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
                      <span>{chapter.reading}</span>
                      <span className="h-px flex-1 bg-white/10 mx-4" />
                      <span className="text-snow/80">{chapter.meaning}</span>
                    </p>
                  </div>

                  <span
                    data-chapter-shade
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-night opacity-0"
                  />
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Scene>
  );
}
