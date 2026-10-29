import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { moreProjects } from "@/lib/content/projects";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import {
  Accent,
  PillLink,
  SectionHeading,
} from "@/components/system/primitives";
import {
  EditorialVisual,
  ProjectActions,
} from "@/components/system/project-media";

const STACK_PREVIEW = 4;

export function MoreProjects() {
  return (
    <Scene
      name="more"
      as="section"
      id="more-projects"
      aria-labelledby="more-title"
      className="relative bg-night py-24 lg:py-36"
    >
      <div className={container}>
        <SectionHeading
          index="05"
          label="More projects"
          id="more-title"
          title={
            <>
              More <Accent>projects</Accent>
            </>
          }
          aside={
            <div className="flex flex-col items-start gap-5 lg:items-end">
              <p>Selected work across healthcare, analytics and the web.</p>
              <PillLink href="/projects" variant="outline-dark" size="sm">
                All projects
              </PillLink>
            </div>
          }
        />

        <ul
          data-more-grid
          className="mt-14 grid gap-5 md:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-6"
        >
          {moreProjects.map((project, index) => {
            const extraStack = project.stack.length - STACK_PREVIEW;

            return (
              <li key={project.slug} data-more-card className="min-w-0">
                <article
                  data-spotlight
                  data-cursor="preview"
                  aria-labelledby={`more-${project.slug}`}
                  className="group/card relative isolate flex h-full min-w-0 flex-col rounded-[28px] bg-white/[0.07] p-px transition-[translate] duration-500 ease-out-soft hover:-translate-y-1"
                >
                  {/* Border light: visible only through the 1px gap around the inner surface. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(300px_circle_at_var(--spot-x,50%)_var(--spot-y,0px),rgb(255_255_255/0.45),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
                  />

                  <div className="relative flex h-full flex-col overflow-hidden rounded-[27px] bg-night-2 p-2.5">
                    {/* Surface sheen that follows the pointer. */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_var(--spot-x,50%)_var(--spot-y,0px),rgb(255_255_255/0.06),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
                    />

                    <Link
                      href={`/projects/${project.slug}`}
                      data-cursor="project"
                      aria-label={`Read the ${project.title} case study`}
                      className="group/media relative block aspect-[16/10] overflow-hidden rounded-[20px] bg-night ring-1 ring-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                    >
                      {project.image ? (
                        <Image
                          src={project.image.src}
                          alt={project.image.alt}
                          fill
                          priority={index === 0}
                          sizes="(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw"
                          className="object-cover object-top transition-transform duration-[900ms] ease-out-soft group-hover/card:scale-[1.04]"
                        />
                      ) : (
                        <EditorialVisual
                          project={project}
                          className="absolute inset-0 aspect-auto h-full"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-2/70 via-transparent to-transparent"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-3.5 top-3.5 rounded-full bg-night/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-snow ring-1 ring-white/10 backdrop-blur-md"
                      >
                        {String(index + 4).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute right-3.5 top-3.5 inline-flex size-10 items-center justify-center rounded-full bg-snow text-night opacity-0 shadow-lg transition-[opacity,translate,rotate] duration-500 ease-out-soft translate-y-1 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-hover/media:rotate-45"
                      >
                        <ArrowUpRight className="size-4" />
                      </span>
                    </Link>

                    <div className="relative flex flex-1 flex-col px-3.5 pb-3.5 pt-6 sm:px-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className={cn(label, "min-w-0 truncate text-mist")}>
                          {project.category}
                        </p>
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-jp text-sm tracking-[0.2em] text-snow/30"
                        >
                          {project.kanji}
                        </span>
                      </div>

                      <h3
                        id={`more-${project.slug}`}
                        className="mt-3 font-display text-[clamp(1.5rem,2vw,1.85rem)] font-bold leading-[1.05] tracking-[-0.03em] text-snow"
                      >
                        <Link
                          href={`/projects/${project.slug}`}
                          data-cursor="project"
                          className="transition-colors duration-300 hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                        >
                          {project.title}
                        </Link>
                      </h3>

                      <p
                        data-card-summary
                        className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-mist"
                      >
                        {project.summary}
                      </p>

                      <ul
                        aria-label={`${project.title} technologies`}
                        className="mt-5 flex flex-wrap gap-1.5"
                      >
                        {project.stack.slice(0, STACK_PREVIEW).map((item) => (
                          <li
                            key={item}
                            className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-snow/70 ring-1 ring-white/[0.06]"
                          >
                            {item}
                          </li>
                        ))}
                        {extraStack > 0 ? (
                          <li className="rounded-full px-1.5 py-1 text-[11px] text-mist">
                            +{extraStack}
                          </li>
                        ) : null}
                      </ul>

                      <div className="mt-auto pt-7">
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-white/[0.07] pt-5">
                          <ProjectActions project={project} />
                          <Link
                            href={`/projects/${project.slug}`}
                            data-cursor="project"
                            aria-label={`Read the ${project.title} case study`}
                            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-snow ring-1 ring-white/15 transition-[background-color,color,rotate] duration-300 hover:rotate-45 hover:bg-snow hover:text-night focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                          >
                            <ArrowUpRight className="size-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </Scene>
  );
}
