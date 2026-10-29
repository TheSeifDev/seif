import Image from "next/image";
import type { PortfolioProject } from "@/lib/content/projects";
import { featuredProjects, moreProjects } from "@/lib/content/projects";
import { TechnologyIcon } from "@/components/home/technology-icons";
import { ActionLink, SectionHeading, SectionLabel } from "./primitives";
import { darkShell, frame, lightFrame, lightShell } from "@/lib/ui/layout";
import { HorizontalProjects } from "@/components/motion/horizontal-projects";

type ProjectCardProps = {
  project: PortfolioProject;
  variant?: "featured" | "more";
  tone: "light" | "dark";
};

function EditorialVisual({
  project,
  tone,
}: {
  project: PortfolioProject;
  tone: "light" | "dark";
}) {
  if (project.image) {
    return (
      <figure className="screenshot-frame absolute inset-[13px] overflow-hidden rounded-[calc(var(--section-radius)_-_10px)] border border-white/25 bg-black shadow-[0_18px_34px_#0710162b]">
        <Image
          src={project.image}
          alt={`${project.title} — actual public website capture`}
          width={1440}
          height={1000}
          sizes="(min-width:1024px) 60vw, 92vw"
          data-project-image
          className="block h-full w-full object-contain"
        />
        <figcaption className="screenshot-label absolute bottom-[14px] left-[15px] rounded-full border border-white/25 bg-[#081116bf] px-[9px] py-[7px] font-mono text-[8px] leading-none tracking-[0.9px] text-[#f6fbfd]">
          {project.imageLabel}
        </figcaption>
      </figure>
    );
  }

  const accentClass =
    tone === "light" ? "text-identity-ink" : "text-identity-bright";
  const secondaryClass = tone === "light" ? "text-slate-600" : "text-slate-300";

  return (
    <div
      className="editorial-visual relative flex min-h-full flex-col justify-center overflow-hidden p-9 max-md:p-[29px]"
      role="img"
      aria-label="Editorial visual — not a product screenshot"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[75px] -top-[92px] size-[250px] rounded-full border border-identity/35"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[145px] -top-[164px] size-[390px] rounded-full border border-identity/35 opacity-40"
      />
      <span
        className={`editorial-visual-kicker mb-[21px] font-mono text-[10px] leading-[1.4] tracking-[1.1px] uppercase ${accentClass}`}
      >
        EDITORIAL VISUAL
      </span>
      <strong className="relative z-10 max-w-[11ch] text-[clamp(40px,6vw,82px)] font-semibold leading-[0.9] tracking-[-0.075em]">
        {project.title}
      </strong>
      <span
        className={`editorial-visual-meta mt-[27px] max-w-[250px] font-mono text-[10px] leading-[1.4] tracking-[1.1px] uppercase ${secondaryClass}`}
      >
        {project.focus}
      </span>
      <span
        className={`editorial-visual-note mt-[45px] font-mono text-[10px] leading-[1.4] tracking-[1.1px] uppercase ${secondaryClass}`}
      >
        EDITORIAL VISUAL — NOT A PRODUCT SCREENSHOT
      </span>
      <span className="editorial-visual-line editorial-visual-line-one absolute bottom-[55px] left-9 right-9 h-px bg-current opacity-[0.13]" />
      <span className="editorial-visual-line editorial-visual-line-two absolute bottom-[70px] left-9 right-[31%] h-px bg-current opacity-[0.13]" />
      <span className="editorial-visual-line editorial-visual-line-three absolute bottom-[85px] left-9 right-[47%] h-px bg-current opacity-[0.13]" />
    </div>
  );
}

function ProjectCard({
  project,
  variant = "featured",
  tone,
}: ProjectCardProps) {
  const hasVerifiedLink = Boolean(project.verified && project.liveUrl);
  const isFeatured = variant === "featured";
  const cardTone =
    tone === "light"
      ? "border-[#171b1e1f] bg-[#eeefeb] text-[#171b1e]"
      : "border-white/10 bg-[#0d1418] text-[#f5f5f2]";
  const visualTone = tone === "light" ? "bg-[#e5e9e8]" : "bg-[#101a20]";
  const mutedTone = tone === "light" ? "text-slate-600" : "text-slate-300";
  const accentTone =
    tone === "light" ? "text-identity-ink" : "text-identity-bright";

  return (
    <article
      className={`work-card work-card-${project.id} work-card-${variant} relative isolate flex min-w-0 flex-col overflow-hidden rounded-[var(--section-radius)] border ${
        isFeatured
          ? "h-full w-full shrink-0 lg:grid lg:grid-cols-[minmax(0,1.62fr)_minmax(280px,1fr)]"
          : "min-h-[255px] transition-[border-color,box-shadow] duration-[260ms] ease-out hover:border-identity/50 hover:shadow-xl"
      } ${cardTone}`}
      data-card={variant === "more" ? undefined : "true"}
      data-project-slide={isFeatured ? project.id : undefined}
      aria-labelledby={`${project.id}-title`}
    >
      <div
        className={`work-visual relative grid min-h-[255px] place-items-stretch overflow-hidden ${
          isFeatured
            ? "lg:min-h-[min(650px,calc(100svh_-_140px))]"
            : "md:min-h-[245px]"
        } ${visualTone}`}
        data-card-visual
      >
        <EditorialVisual project={project} tone={tone} />
      </div>
      <div
        className={`work-copy flex flex-1 flex-col p-[25px_27px_27px] max-md:p-[22px_22px_24px] ${
          isFeatured ? "lg:justify-center" : ""
        }`}
      >
        <div className="work-meta mb-[25px] flex items-center gap-3 font-mono text-[10px] leading-[1.2] tracking-[0.8px] uppercase">
          <span className={`work-number ${accentTone}`}>{project.number}</span>
          <span
            className={`work-category before:mr-3 before:content-['—'] before:opacity-50 ${mutedTone}`}
          >
            {project.category}
          </span>
        </div>
        <h3
          id={`${project.id}-title`}
          className="m-0 text-[clamp(28px,3vw,38px)] font-semibold leading-[0.98] tracking-[-0.06em]"
        >
          {project.title}
        </h3>
        <p
          className={`work-description mt-[17px] max-w-[47ch] text-sm leading-[1.65] ${mutedTone}`}
        >
          {project.description}
        </p>
        <p
          className={`work-focus mt-[19px] font-mono text-[11px] leading-[1.4] tracking-[0.9px] uppercase ${accentTone}`}
        >
          {project.focus}
        </p>
        <ul
          className="work-stack mt-6 flex list-none flex-wrap gap-x-2 gap-y-[7px] p-0"
          aria-label={`${project.title} technology stack`}
        >
          {project.technologies.map((technology) => (
            <li
              className={`work-tech inline-flex min-h-[25px] items-center gap-1.5 whitespace-nowrap rounded-full border border-current px-2 py-[5px] text-xs leading-none ${mutedTone} [&_svg]:size-[13px] [&_svg]:shrink-0 [&_svg]:text-identity`}
              key={technology}
            >
              <TechnologyIcon name={technology} />
              <span>{technology}</span>
            </li>
          ))}
        </ul>
        <div className="work-action mt-auto flex min-h-[42px] items-end pt-7 [&_.action-link]:gap-4 [&_.action-link]:px-4 [&_.action-link]:py-[11px] [&_.action-link]:text-[10px] [&_.action-link]:transition-none [&_.action-link:hover]:!transform-none">
          {hasVerifiedLink ? (
            <ActionLink href={project.liveUrl!} external>
              Visit live project
            </ActionLink>
          ) : (
            <span
              className={`work-link-pending inline-flex min-h-[35px] items-center border-b border-current px-px font-mono text-[10px] leading-none tracking-[0.6px] uppercase ${mutedTone}`}
              aria-disabled="true"
            >
              {project.availabilityNote ?? "Public preview unavailable"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className={`light-section work-section ${lightShell}`}
      aria-labelledby="featured-projects-title"
    >
      <div className={`${lightFrame} relative z-10`}>
        <SectionLabel number="03" tone="light">
          FEATURED PROJECTS
        </SectionLabel>
        <div className="mb-8 sm:mb-[42px] [&_.section-heading]:mb-0 [&_.section-heading_h2]:max-w-[620px] [&_.section-note]:max-w-[270px]">
          <SectionHeading
            tone="light"
            note={
              <>
                Real systems. Clear stories.
                <br />
                No claims beyond the work.
              </>
            }
          >
            Selected work,
            <br />
            made <span className="accent text-identity-ink">useful.</span>
          </SectionHeading>
        </div>
        <h2 id="featured-projects-title" className="sr-only">
          Featured projects
        </h2>
        <HorizontalProjects>
          {featuredProjects.map((project) => (
            <ProjectCard project={project} tone="light" key={project.id} />
          ))}
        </HorizontalProjects>
      </div>
    </section>
  );
}

export function MoreProjectsSection() {
  return (
    <section
      id="more-projects"
      className={`dark-section work-section ${darkShell}`}
      aria-labelledby="more-projects-title"
    >
      <div className={`${frame} relative z-10`}>
        <SectionLabel number="04" tone="dark">
          MORE PROJECTS
        </SectionLabel>
        <div className="mb-8 sm:mb-[42px] [&_.section-heading]:mb-0 [&_.section-heading_h2]:max-w-[620px] [&_.section-note]:max-w-[270px]">
          <SectionHeading
            tone="dark"
            note={
              <>
                A wider look at the systems behind the portfolio.
                <br />
                Each story stays grounded in the build.
              </>
            }
          >
            More work,
            <br />
            same <span className="accent text-identity-bright">attention.</span>
          </SectionHeading>
        </div>
        <h2 id="more-projects-title" className="sr-only">
          More projects
        </h2>
        <div className="more-work-grid grid grid-cols-1 gap-[18px] lg:grid-cols-2">
          {moreProjects.map((project) => (
            <ProjectCard
              project={project}
              variant="more"
              tone="dark"
              key={project.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
