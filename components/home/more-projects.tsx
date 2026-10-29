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
          className="mt-14 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-x-8"
        >
          {moreProjects.map((project, index) => (
            <li key={project.slug} data-more-card className="min-w-0">
              <article
                data-cursor="preview"
                aria-labelledby={`more-${project.slug}`}
                className="group flex h-full min-w-0 flex-col border-t border-white/10 pt-5"
              >
                <Link
                  href={`/projects/${project.slug}`}
                  data-cursor="project"
                  className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                  aria-label={`Read the ${project.title} case study`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-night-2">
                    {project.image ? (
                      <Image
                        src={project.image.src}
                        alt={project.image.alt}
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover object-top transition-transform duration-700 ease-out-soft group-hover:scale-[1.02]"
                      />
                    ) : (
                      <EditorialVisual project={project} />
                    )}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <p className={cn(label, "max-w-[18rem] text-mist")}>
                      <span className="text-sky">
                        {String(index + 4).padStart(2, "0")}
                      </span>
                      <span aria-hidden="true" className="mx-2 text-snow/25">
                        /
                      </span>
                      {project.category}
                    </p>
                    <span
                      aria-hidden="true"
                      className="font-jp text-base tracking-[0.2em] text-snow/30"
                    >
                      {project.kanji}
                    </span>
                  </div>

                  <h3
                    id={`more-${project.slug}`}
                    className="mt-4 font-display text-[clamp(1.6rem,2.2vw,2rem)] font-bold leading-[1.05] tracking-[-0.03em]"
                  >
                    <Link
                      href={`/projects/${project.slug}`}
                      data-cursor="project"
                      className="transition-colors duration-300 hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                    >
                      {project.title}
                    </Link>
                  </h3>

                  <p className="mt-3 max-w-md text-[14px] leading-relaxed text-mist">
                    {project.summary}
                  </p>

                  <p className="mt-4 max-w-md text-[11px] leading-relaxed text-mist">
                    <span className="font-mono uppercase tracking-[0.16em] text-mist">
                      Stack
                    </span>{" "}
                    {project.stack.join(" · ")}
                  </p>

                  <div className="mt-auto flex min-h-10 flex-wrap items-center gap-x-5 gap-y-3 pt-7">
                    <ProjectActions project={project} />
                    <Link
                      href={`/projects/${project.slug}`}
                      data-cursor="project"
                      aria-label={`Read the ${project.title} case study`}
                      className="inline-flex items-center gap-2 text-[13px] font-semibold text-snow/75 transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                    >
                      Case study
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
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
