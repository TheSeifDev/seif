import {
  ArrowUpRight,
  Box,
  Braces,
  Code2,
  Compass,
  Database,
  Layers,
  PencilLine,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  assets,
  profile,
  buildStack,
  projectPreviews,
} from "@/lib/content/home";
import { SectionLabel, SectionHeading, ActionLink } from "./primitives";
import { ProjectCard } from "./project-card";
import { ProjectRail } from "./project-rail";

const principles = [
  {
    icon: Box,
    title: "Modern solutions",
    description: "Useful products, built around real needs.",
  },
  {
    icon: Braces,
    title: "Clean code",
    description: "Readable, maintainable foundations that last.",
  },
  {
    icon: Layers,
    title: "End-to-end thinking",
    description: "Connecting the interface to the system behind it.",
  },
  {
    icon: Sparkles,
    title: "Details that matter",
    description: "Care in the experience, not just the implementation.",
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="light-section about-section"
      aria-labelledby="about-title"
    >
      <div className="container">
        <SectionLabel number="01">ABOUT ME</SectionLabel>
        <div className="about-grid">
          <div className="about-left">
            <h2 id="about-title" className="manifesto" data-reveal>
              I BUILD PRODUCTS
              <br />
              THAT SOLVE{" "}
              <span>
                REAL
                <br />
                PROBLEMS.
              </span>
            </h2>
            <div className="about-art">
              <span className="ink-sun" aria-hidden="true" />
              <div
                className="ink-landscape"
                style={{ backgroundImage: `url('${assets.about}')` }}
                aria-hidden="true"
              />
              <span className="art-caption">THOUGHTFUL BY DESIGN.</span>
            </div>
          </div>
          <div className="about-right">
            <p className="about-intro" data-reveal>
              Good software is more than code.
              <br />
              It’s clarity, craft, and a reason to exist.
            </p>
            <p className="body-copy">
              I’m Seif, a senior full stack developer with over five years of
              experience. I connect thoughtful interfaces with the engineering
              that makes them work.
            </p>
            <div className="principle-grid">
              {principles.map(({ icon: Icon, title, description }) => (
                <div className="principle" data-reveal key={title}>
                  <span className="principle-icon">
                    <Icon size={25} strokeWidth={1.5} />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
            <a className="text-link" href="#process">
              A look at my process <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section id="stats" className="dark-section stats-section">
      <div className="container">
        <SectionLabel number="02">THE JOURNEY</SectionLabel>
        <SectionHeading
          note={
            <>
              Experience, not just numbers.
              <br />A foundation for what comes next.
            </>
          }
        >
          Built on experience.
          <br />
          Driven by <span className="accent">curiosity.</span>
        </SectionHeading>
        <div className="stats-grid">
          <article className="stat-card stat-main" data-reveal>
            <span className="stat-top">
              THE FOUNDATION <Code2 size={20} />
            </span>
            <strong>
              {profile.experience}
              <span>YEARS</span>
            </strong>
            <p>Full stack software development</p>
            <div className="stat-baseline">
              <span>From idea to implementation</span>
              <ArrowUpRight size={16} />
            </div>
          </article>
          <article className="stat-card" data-reveal>
            <span className="stat-top">
              THE APPROACH <Layers size={20} />
            </span>
            <div className="stat-symbol">
              <span>UI</span>
              <i />
              <Database size={35} strokeWidth={1.3} />
            </div>
            <h3>End to end.</h3>
            <p>
              Thoughtful interfaces.
              <br />
              Reliable foundations.
            </p>
          </article>
          <article className="stat-card stat-curation" data-reveal>
            <span className="stat-top">
              SELECTED WORK <ShieldCheck size={20} />
            </span>
            <div className="curation-lines" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <h3>Quality over claims.</h3>
            <p>Projects and outcomes will be added after review.</p>
            <span className="small-tag">CONTENT IN CURATION</span>
          </article>
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" className="light-section projects-section">
      <div className="container">
        <SectionLabel number="03">FEATURED PROJECTS</SectionLabel>
        <SectionHeading
          note={
            <>
              Real projects. Clear stories.
              <br />
              The work will speak for itself.
            </>
          }
        >
          Some things <span className="accent">I build.</span>
        </SectionHeading>
        <div className="project-grid">
          {projectPreviews.map((project) => (
            <ProjectCard project={project} key={project.id} />
          ))}
        </div>
        <p className="content-disclaimer">
          <span className="section-dot" />
          Editorial previews only. These are layout placeholders, not published
          projects.
        </p>
      </div>
    </section>
  );
}

export function MoreProjectsSection() {
  return (
    <section id="more-projects" className="dark-section more-section">
      <div className="container">
        <SectionLabel number="04">MORE PROJECTS</SectionLabel>
        <SectionHeading note="A place for the work that comes next.">
          Different ideas.
          <br />
          <span className="accent">Same attention to detail.</span>
        </SectionHeading>
        <ProjectRail>
          {[
            ...projectPreviews,
            {
              id: "04",
              discipline: "Next chapter",
              visual: "product" as const,
            },
          ].map((project) => (
            <ProjectCard project={project} compact key={project.id} />
          ))}
        </ProjectRail>
      </div>
    </section>
  );
}

export function SkillsSection() {
  return (
    <section id="skills" className="light-section skills-process">
      <div className="container">
        <SectionLabel number="05">SKILLS & TECHNOLOGIES</SectionLabel>
        <SectionHeading
          note={
            <>
              The selected stack behind this portfolio.
              <br />
              Not a proficiency ranking.
            </>
          }
        >
          Good tools. <span className="accent">Better thinking.</span>
        </SectionHeading>
        <div className="technology-list">
          {buildStack.map((tool) => (
            <div className="technology" key={tool.name}>
              <span
                className={`tech-mark tech-${tool.name.toLowerCase().replace(/[^a-z]/g, "")}`}
                style={{ color: tool.color }}
              >
                {tool.mark}
              </span>
              <span>{tool.name}</span>
            </div>
          ))}
        </div>
        <div id="process" className="process-section">
          <SectionLabel number="06">MY PROCESS</SectionLabel>
          <SectionHeading
            note={
              <>
                A clear process.
                <br />A considered result.
              </>
            }
          >
            From idea to <span className="accent">impact.</span>
          </SectionHeading>
          <div className="process-grid">
            {[
              {
                title: "Discover",
                icon: Compass,
                text: "Understand the problem, the people, and the purpose.",
              },
              {
                title: "Design",
                icon: PencilLine,
                text: "Make the complex feel clear. Shape the right experience.",
              },
              {
                title: "Build",
                icon: Code2,
                text: "Engineer with care. Connect the details to the bigger picture.",
              },
              {
                title: "Ship",
                icon: Rocket,
                text: "Refine, release, and keep learning from the real world.",
              },
            ].map(({ title, icon: Icon, text }, i) => (
              <article className="process-step" data-reveal key={title}>
                <span className="process-icon">
                  <Icon size={26} strokeWidth={1.5} />
                </span>
                <div>
                  <span className="process-number">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                {i < 3 && (
                  <ArrowUpRight
                    className="process-arrow"
                    size={16}
                    aria-hidden="true"
                  />
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section
      id="contact"
      className="contact-section"
      aria-labelledby="contact-title"
    >
      <div
        className="contact-art"
        style={{ backgroundImage: `url('${assets.contact}')` }}
        aria-hidden="true"
      />
      <div className="contact-shade" aria-hidden="true" />
      <div className="container contact-inner">
        <div className="contact-copy">
          <SectionLabel>LET’S CONNECT</SectionLabel>
          <h2 id="contact-title" data-reveal>
            LET’S BUILD
            <br />
            SOMETHING
            <br />
            <span>THAT MATTERS.</span>
          </h2>
          <p>
            Have a thoughtful idea or an interesting challenge?
            <br />
            Let’s start a conversation.
          </p>
          <ActionLink href={profile.githubUrl} external>
            Find me on GitHub
          </ActionLink>
        </div>
        <div className="contact-card">
          <span className="contact-card-label">
            THE NEXT CHAPTER STARTS HERE
          </span>
          <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
            <Code2 size={20} />
            <div>
              <span>GitHub</span>
              <strong>@{profile.handle}</strong>
            </div>
            <ArrowUpRight size={17} />
          </a>
          <div className="contact-pending">
            <span className="status-dot" />
            <p>
              More contact details will be added
              <br />
              once confirmed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
