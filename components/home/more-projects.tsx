import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { moreProjects } from "@/lib/content/projects";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import {
  Accent,
  PillLink,
  SectionHeading,
  Tags,
} from "@/components/system/primitives";
import {
  EditorialVisual,
  ProjectActions,
} from "@/components/system/project-media";

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
          className="mt-14 grid gap-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-3"
        >
          {moreProjects.map((project, index) => (
            <li
              key={project.slug}
              data-more-card
              className={cn(index === 2 && "md:col-span-2 lg:col-span-1")}
            >
              <article
                aria-labelledby={`more-${project.slug}`}
                className={cn(
                  "group flex h-full flex-col rounded-[28px] border border-white/[0.08] bg-night-2 p-3 transition-colors duration-500 hover:border-sky/40",
                  index === 2 && "md:flex-row lg:flex-col",
                )}
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-[20px] bg-night-3",
                    index === 2 && "md:w-1/2 md:shrink-0 lg:w-auto",
                  )}
                >
                  {project.image ? (
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={project.image.src}
                        alt={project.image.alt}
                        fill
                        sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover object-top transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : (
                    <EditorialVisual project={project} />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-night/75 px-2.5 py-1 font-mono text-[11px] text-snow backdrop-blur">
                    {String(index + 4).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4 pt-6 sm:p-5 sm:pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className={cn(label, "text-sky")}>{project.category}</p>
                    <span
                      lang="ja"
                      aria-hidden="true"
                      className="font-jp text-sm tracking-[0.2em] text-snow/40"
                    >
                      {project.kanji}
                    </span>
                  </div>
                  <h3
                    id={`more-${project.slug}`}
                    className="mt-4 font-display text-2xl font-bold tracking-[-0.025em]"
                  >
                    {project.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-mist">
                    {project.summary}
                  </p>
                  <Tags items={project.stack} max={4} className="mt-5" />
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 md:mt-auto md:pt-8">
                    <ProjectActions project={project} />
                    <Link
                      href={`/projects/${project.slug}`}
                      aria-label={`Read the ${project.title} case study`}
                      className="inline-flex items-center gap-2 text-[13px] font-semibold text-snow transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-sky"
                    >
                      Case study
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </Scene>
  );
}
