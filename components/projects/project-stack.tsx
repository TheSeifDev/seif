import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  EditorialVisual,
  ProjectActions,
} from "@/components/system/project-media";
import { SectionLabel } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import type { SiteContent, SiteProject } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { isUnoptimizedCmsImage } from "@/components/site/cms-image";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

/** Sticky offsets shared with `projects-scenes.ts` (px from the viewport top). */
export const STACK_TOP = 96;
export const STACK_STEP = 16;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * 03 In focus: the featured case files as dark cards on a paper panel. On
 * stage viewports (with motion) the cards are CSS-sticky and stack; GSAP only
 * scrubs scale/shade and the screenshot reveal.
 */
export function ProjectStack({
  projects,
  content,
}: {
  projects: readonly SiteProject[];
  content: SiteContent;
}) {
  const c = (key: string, fallback: string) =>
    getCopy(content.copy, key, fallback);
  return (
    <section
      aria-labelledby="in-focus-title"
      className={cn(
        "relative mx-2 rounded-[28px] bg-paper text-ink [--accent-text:var(--color-sky-ink)] [color-scheme:light] sm:mx-3",
        "lg:mx-auto lg:w-[min(92vw,1560px)] lg:rounded-[40px]",
        "py-20 lg:py-28",
      )}
    >
      <div className={cn(container, "max-w-none px-5 sm:px-8 lg:px-10 xl:px-12")}>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel index="03" tone="light">
              In focus
            </SectionLabel>
            <h2
              id="in-focus-title"
              data-projects-heading
              className="mt-6 font-display text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]"
            >
              <CmsTitle
                text={c(
                  "projects.focus.title",
                  "Three case files, end to end.",
                )}
                accent="end to end"
              />
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-slate-ink lg:col-span-4 lg:justify-self-end lg:text-right">
            {c(
              "projects.focus.description",
              "The flagship builds, opened up: what each one does, how it is put together and where to see it.",
            )}
          </p>
        </div>

        <ol
          data-stack
          className="mt-14 flex flex-col gap-6 lg:mt-20 stage:motion-safe:gap-0"
        >
          {projects.map((project, index) => (
            <li
              key={project.slug}
              data-stack-card
              className="stage:motion-safe:sticky stage:motion-safe:h-[min(510px,calc(100svh-14rem))] short:stage:motion-safe:h-[min(460px,calc(100svh-10rem))]"
              style={{ top: `${STACK_TOP + index * STACK_STEP}px` }}
            >
              <article
                data-stack-inner
                aria-labelledby={`stack-${project.slug}`}
                className="relative grid h-full origin-top overflow-hidden rounded-[28px] bg-night-2 text-snow ring-1 ring-white/[0.08] lg:grid-cols-12 lg:rounded-[32px]"
              >
                <span
                  data-stack-shade
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 bg-night opacity-0"
                />

                <div className="relative z-10 flex flex-col p-6 sm:p-7 lg:col-span-5 lg:p-7 xl:col-span-5 xl:p-8 short:lg:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p
                      className={cn(label, "flex items-center gap-3 text-mist")}
                    >
                      <span className="text-sky">{pad(index + 1)}</span>
                      <span
                        aria-hidden="true"
                        className="h-px w-8 bg-white/20"
                      />
                      <span>{pad(projects.length)}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-mist">
                      <span
                        aria-hidden="true"
                        className="font-jp text-lg text-sky"
                      >
                        {project.kanji}
                      </span>
                      {project.kanjiMeaning}
                    </p>
                  </div>

                  <div
                    data-stack-copy
                    className="my-auto flex flex-1 flex-col justify-center py-4 lg:py-2.5 short:lg:py-1.5"
                  >
                    <p className={cn(label, "text-sky")}>{project.category}</p>
                    <h3
                      id={`stack-${project.slug}`}
                      className="mt-2.5 font-display text-[clamp(1.75rem,2.3vw,2.4rem)] font-bold uppercase leading-[1.02] tracking-[-0.035em] short:text-[clamp(1.5rem,1.9vw,1.9rem)]"
                    >
                      <Link
                        href={`/projects/${project.slug}`}
                        data-cursor="project"
                        className="transition-colors duration-300 hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                      >
                        {project.title}
                      </Link>
                    </h3>
                    <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-mist sm:line-clamp-3 sm:text-[15px] short:lg:line-clamp-2">
                      {project.summary}
                    </p>
                    <ol className="mt-3.5 space-y-2 border-t border-white/10 pt-3 short:mt-2 short:pt-2">
                      {project.highlights
                        .slice(0, 3)
                        .map((highlight, point) => (
                          <li
                            key={highlight}
                            className="grid grid-cols-[1.5rem_minmax(0,1fr)] text-[13px] leading-snug text-snow/80 short:[&:nth-child(3)]:hidden"
                          >
                            <span className="pt-0.5 font-mono text-[11px] text-sky">
                              {pad(point + 1)}
                            </span>
                            <span className="line-clamp-2">{highlight}</span>
                          </li>
                        ))}
                    </ol>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                    <ProjectActions project={project} tone="dark" />
                    <Link
                      href={`/projects/${project.slug}`}
                      className="group/case ml-auto inline-flex items-center gap-2.5 text-sm font-medium text-snow transition-colors duration-300 hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                    >
                      Case study
                      <span
                        aria-hidden="true"
                        className="grid size-9 place-items-center rounded-full border border-white/15 transition-[rotate,border-color] duration-500 ease-out-soft group-hover/case:rotate-45 group-hover/case:border-sky"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>

                <Link
                  href={`/projects/${project.slug}`}
                  data-cursor="project"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="group/media relative order-first block p-3 lg:order-none lg:col-span-7 lg:h-full lg:p-3 xl:p-3.5"
                >
                  <span
                    data-stack-media
                    className="relative block aspect-[16/10] overflow-hidden rounded-[20px] bg-night ring-1 ring-white/[0.08] lg:aspect-auto lg:h-full lg:rounded-[24px]"
                  >
                    {project.image ? (
                      <Image
                        data-stack-image
                        src={project.image.src}
                        unoptimized={isUnoptimizedCmsImage(project.image.src)}
                        alt=""
                        fill
                        loading="lazy"
                        quality={85}
                        sizes="(min-width: 1280px) 55vw, (min-width: 1024px) 58vw, 100vw"
                        className="object-cover object-top transition-transform duration-[900ms] ease-out-soft group-hover/media:scale-[1.03]"
                      />
                    ) : (
                      <EditorialVisual
                        project={project}
                        className="absolute inset-0 aspect-auto"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/80 via-night/10 to-transparent"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-3 right-4 select-none font-jp text-[clamp(3.5rem,7vw,6.5rem)] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.18)]"
                    >
                      {project.kanji}
                    </span>
                    {project.image ? (
                      <span
                        className={cn(
                          label,
                          "absolute bottom-4 left-4 hidden text-snow/75 sm:block",
                        )}
                      >
                        {project.image.caption}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
