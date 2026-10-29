import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects } from "@/lib/content/projects";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import { Accent, PillLink, SectionHeading } from "@/components/system/primitives";
import {
  BrowserFrame,
  EditorialVisual,
  ProjectActions,
} from "@/components/system/project-media";

export function FeaturedProjects() {
  const total = String(featuredProjects.length).padStart(2, "0");

  return (
    <Scene
      name="featured"
      as="section"
      id="work"
      aria-labelledby="work-title"
      className="group/featured relative border-y border-white/10 bg-night text-snow"
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
                <PillLink href="/projects" variant="outline-dark" size="sm">
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
                "flex flex-col gap-10",
                "group-data-[enhanced=true]/featured:w-max group-data-[enhanced=true]/featured:flex-row group-data-[enhanced=true]/featured:gap-8",
              )}
            >
              {featuredProjects.map((project, index) => {
                const reverse = index % 2 === 1;

                return (
                  <li
                    key={project.slug}
                    data-slide
                    className={cn(
                      "w-full shrink-0",
                      "group-data-[enhanced=true]/featured:h-[min(440px,calc(100svh-22rem))] group-data-[enhanced=true]/featured:w-[min(1080px,calc(100vw-8rem))]",
                      "short:group-data-[enhanced=true]/featured:h-[min(400px,calc(100svh-20rem))]",
                    )}
                  >
                    <article
                      data-cursor="preview"
                      aria-labelledby={`featured-${project.slug}`}
                      className="grid h-full gap-6 border-t border-white/10 pt-6 text-snow lg:grid-cols-12 lg:gap-0 lg:pt-0"
                    >
                      <div
                        className={cn(
                          "flex items-center lg:col-span-7",
                          reverse && "lg:col-start-6 lg:row-start-1",
                        )}
                      >
                        <Link
                          href={`/projects/${project.slug}`}
                          data-cursor="project"
                          className="group/project block w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                          aria-label={`Read the ${project.title} case study`}
                        >
                          {project.image ? (
                            <BrowserFrame
                              src={project.image.src}
                              alt={project.image.alt}
                              url={project.live?.url}
                              sizes="(min-width: 1024px) 680px, 100vw"
                              priority={index === 0}
                              className="rounded-lg border-white/10"
                              imageClassName="transition-transform duration-700 ease-out-soft group-hover/project:scale-[1.015]"
                            />
                          ) : (
                            <EditorialVisual project={project} />
                          )}
                        </Link>
                      </div>

                      <div
                        className={cn(
                          "flex h-full min-w-0 flex-col justify-center py-3 sm:py-4 lg:col-span-5 lg:px-8 lg:py-5 short:lg:py-3",
                          reverse && "lg:col-start-1 lg:row-start-1",
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className={cn(label, "flex items-center gap-3 text-mist")}>
                            <span className="text-sky">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span aria-hidden="true" className="h-px w-8 bg-sky/60" />
                            <span>{project.category}</span>
                          </p>
                        </div>

                        <h3
                          id={`featured-${project.slug}`}
                          className="mt-5 max-w-lg font-display text-[clamp(2rem,3.4vw,3rem)] font-bold leading-[0.98] tracking-[-0.035em]"
                        >
                          <Link
                            href={`/projects/${project.slug}`}
                            data-cursor="project"
                            className="transition-colors duration-300 hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                          >
                            {project.title}
                          </Link>
                        </h3>

                        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-mist">
                          {project.summary}
                        </p>

                        <p className="mt-4 max-w-lg text-[12px] leading-relaxed text-mist">
                          <span className="font-mono uppercase tracking-[0.16em] text-mist">
                            Stack
                          </span>{" "}
                          {project.stack.join(" · ")}
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 lg:mt-auto lg:pt-6">
                          <ProjectActions project={project} />
                          <Link
                            href={`/projects/${project.slug}`}
                            data-cursor="project"
                            aria-label={`Read the ${project.title} case study`}
                            className="inline-flex items-center gap-2 border-b border-white/25 pb-1 text-[13px] font-semibold text-snow/85 transition-colors hover:border-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                          >
                            Read case study
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
              "group-data-[enhanced=true]/featured:flex group-data-[enhanced=true]/featured:mt-6",
            )}
          >
            <p className="font-mono text-[12px] tracking-[0.18em] text-mist">
              <span data-featured-counter className="text-snow">
                01
              </span>{" "}
              / {total}
            </p>
            <span className="relative h-px flex-1 bg-white/10">
              <span
                data-featured-fill
                className="absolute inset-0 origin-left scale-x-0 bg-sky"
              />
            </span>
            <p className={cn(label, "text-mist")}>Scroll to explore</p>
          </div>
        </div>
      </div>
    </Scene>
  );
}
