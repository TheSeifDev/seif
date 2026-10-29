import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects } from "@/lib/content/projects";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import { Accent, PillLink, SectionHeading } from "@/components/system/primitives";
import { EditorialVisual, ProjectActions } from "@/components/system/project-media";

export function FeaturedProjects() {
  const total = String(featuredProjects.length).padStart(2, "0");

  return (
    <Scene
      name="featured"
      as="section"
      id="work"
      aria-labelledby="work-title"
      data-cursor-tone="light"
      className="group/featured relative bg-white text-ink [--accent-text:var(--color-sky-ink)] [color-scheme:light]"
    >
      <div
        data-featured-pin
        className={cn(
          "overflow-hidden py-24 lg:py-32",
          "group-data-[enhanced=true]/featured:flex group-data-[enhanced=true]/featured:h-[100svh] group-data-[enhanced=true]/featured:flex-col group-data-[enhanced=true]/featured:justify-center group-data-[enhanced=true]/featured:pb-6 group-data-[enhanced=true]/featured:pt-[5.5rem]",
        )}
      >
        <div className={container}>
          <SectionHeading
            index="04"
            label="Featured projects"
            id="work-title"
            tone="light"
            title={
              <>
                Some things <Accent>I&apos;ve built</Accent>
              </>
            }
            aside={
              <div className="flex flex-col items-start gap-5 lg:items-end">
                <p>
                  Real products, end to end — interface, API, data and
                  deployment.
                </p>
                <PillLink href="/projects" variant="outline-light" size="sm">
                  View all projects
                </PillLink>
              </div>
            }
          />

          <div className={cn("mt-12", "group-data-[enhanced=true]/featured:mt-8")}>
            <ol
              data-featured-track
              data-cursor="scroll"
              aria-label="Featured projects"
              className={cn(
                "flex flex-col gap-8",
                "group-data-[enhanced=true]/featured:w-max group-data-[enhanced=true]/featured:flex-row group-data-[enhanced=true]/featured:gap-6",
              )}
            >
              {featuredProjects.map((project, index) => {
                const reverse = index % 2 === 1;
                const number = String(index + 1).padStart(2, "0");

                return (
                  <li
                    key={project.slug}
                    data-slide
                    className={cn(
                      "w-full shrink-0",
                      "group-data-[enhanced=true]/featured:h-[min(540px,calc(100svh-25rem))] group-data-[enhanced=true]/featured:w-[80vw]",
                      "short:group-data-[enhanced=true]/featured:h-[min(410px,calc(100svh-20rem))]",
                    )}
                  >
                    <article
                      data-cursor="preview"
                      aria-labelledby={`featured-${project.slug}`}
                      className="group/card grid h-full overflow-hidden rounded-[28px] bg-paper ring-1 ring-ink/[0.06] lg:grid-cols-12 lg:rounded-[32px]"
                    >
                      <div
                        className={cn(
                          "p-2.5 sm:p-3 lg:col-span-6 lg:p-3.5 xl:col-span-7",
                          reverse && "lg:col-start-7 lg:row-start-1 xl:col-start-6",
                        )}
                      >
                        <Link
                          href={`/projects/${project.slug}`}
                          data-cursor="project"
                          aria-label={`Read the ${project.title} case study`}
                          className="group/media relative block aspect-[16/10] overflow-hidden rounded-[20px] bg-night shadow-[0_30px_60px_-40px_rgb(10_13_18/0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-ink lg:aspect-auto lg:h-full lg:min-h-[340px] lg:rounded-[24px] group-data-[enhanced=true]/featured:lg:min-h-0"
                        >
                          {project.image ? (
                            <Image
                              src={project.image.src}
                              alt={project.image.alt}
                              fill
                              priority={index === 0}
                              sizes="(min-width: 1280px) 760px, (min-width: 1024px) 50vw, 100vw"
                              className="object-cover object-top transition-transform duration-[900ms] ease-out-soft group-hover/media:scale-[1.03]"
                            />
                          ) : (
                            <EditorialVisual
                              project={project}
                              className="absolute inset-0 aspect-auto h-full"
                            />
                          )}
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/45 to-transparent"
                          />
                          <span
                            aria-hidden="true"
                            className="absolute bottom-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-transform duration-500 ease-out-soft group-hover/media:rotate-45"
                          >
                            <ArrowUpRight className="size-4" />
                          </span>
                        </Link>
                      </div>

                      <div
                        className={cn(
                          "flex min-w-0 flex-col px-5 pb-6 pt-4 sm:px-7 sm:pb-8 lg:col-span-6 lg:px-9 lg:py-9 xl:col-span-5 xl:px-11 short:lg:py-6",
                          reverse && "lg:col-start-1 lg:row-start-1",
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className={cn(label, "flex min-w-0 items-center gap-3 text-slate-ink")}>
                            <span className="text-sky-ink">{number}</span>
                            <span aria-hidden="true" className="h-px w-8 bg-ink/15" />
                            <span>{project.category}</span>
                          </p>
                          <span
                            aria-hidden="true"
                            className="shrink-0 font-jp text-sm tracking-[0.2em] text-ink/30"
                          >
                            {project.kanji}
                          </span>
                        </div>

                        <div className="lg:my-auto lg:py-6 short:lg:py-4">
                          <h3
                            id={`featured-${project.slug}`}
                            className="mt-5 font-display text-[clamp(1.9rem,3vw,2.85rem)] font-bold leading-[1] tracking-[-0.035em] text-ink lg:mt-0"
                          >
                            <Link
                              href={`/projects/${project.slug}`}
                              data-cursor="project"
                              className="transition-colors duration-300 hover:text-sky-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-ink"
                            >
                              {project.title}
                            </Link>
                          </h3>

                          <p data-featured-summary className="mt-4 line-clamp-4 text-[15px] leading-relaxed text-slate-ink short:lg:line-clamp-3">
                            {project.summary}
                          </p>

                          <p className="mt-4 line-clamp-2 text-[12px] leading-relaxed text-slate-ink">
                            {project.stack.join("  ·  ")}
                          </p>
                        </div>

                        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-ink/[0.08] pt-5 lg:mt-0">
                          <ProjectActions project={project} tone="light" />
                          <Link
                            href={`/projects/${project.slug}`}
                            data-cursor="project"
                            aria-label={`Read the ${project.title} case study`}
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink transition-colors hover:text-sky-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-ink"
                          >
                            Case study
                            <ArrowUpRight className="size-3.5" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>

          <div
            aria-hidden="true"
            className={cn(
              "mt-8 hidden items-center gap-6",
              "group-data-[enhanced=true]/featured:mt-6 group-data-[enhanced=true]/featured:flex",
            )}
          >
            <p className="font-mono text-[12px] tracking-[0.18em] text-slate-ink">
              <span data-featured-counter className="text-ink">
                01
              </span>{" "}
              / {total}
            </p>
            <span className="relative h-px flex-1 bg-ink/10">
              <span
                data-featured-fill
                className="absolute inset-0 origin-left scale-x-0 bg-ink"
              />
            </span>
            <p className={cn(label, "text-slate-ink")}>Scroll to explore</p>
          </div>
        </div>
      </div>
    </Scene>
  );
}
