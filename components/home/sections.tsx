import Image from "next/image";
import {
  ArrowUpRight,
  Box,
  Braces,
  Compass,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  PencilLine,
  Rocket,
  Sparkles,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { assets, profile, education } from "@/lib/content/home";
import {
  frame,
  lightFrame,
  lightShell,
  darkShell,
  micro,
} from "@/lib/ui/layout";
import { TechnologyIcon } from "./technology-icons";
import { SectionLabel, SectionHeading, ActionLink } from "./primitives";

const principles = [
  {
    icon: Box,
    title: "Modern solutions",
    text: "Production platforms shaped around the people who use them.",
  },
  {
    icon: Braces,
    title: "Clean architecture",
    text: "Clear boundaries, readable code, and maintainable systems.",
  },
  {
    icon: Layers,
    title: "End-to-end ownership",
    text: "From data models and APIs to the final interface and deployment.",
  },
  {
    icon: Sparkles,
    title: "Technical leadership",
    text: "Engineering standards, thoughtful reviews, and developer mentoring.",
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className={`light-section about-section ${lightShell} overflow-hidden !pb-8`}
      aria-labelledby="about-title"
    >
      <div className={lightFrame}>
        <SectionLabel number="01" tone="light">
          ABOUT ME
        </SectionLabel>
        <div className="about-grid grid gap-0 md:grid-cols-[1.06fr_1fr] md:gap-9 xl:gap-[70px]">
          <div>
            <h2
              id="about-title"
              className="manifesto m-0 text-[clamp(32px,8.5vw,50px)] leading-[1.02] font-bold tracking-[-0.05em] md:text-[clamp(32px,4.3vw,60px)]"
              data-reveal
            >
              I BUILD PRODUCTS
              <br />
              THAT SOLVE{" "}
              <span className="text-identity-ink">
                REAL
                <br />
                PROBLEMS.
              </span>
            </h2>
            <div className="about-art relative isolate mt-5 -ml-[var(--surface-pad)] h-[265px] w-[calc(100%_+_2_*_var(--surface-pad))] md:h-[340px] md:w-[calc(100%_+_var(--surface-pad)_+_35px)] xl:h-[320px]">
              <span
                className="ink-sun absolute top-6 left-[41%] -z-20 size-[140px] rounded-full bg-identity opacity-85 xl:left-[34%] xl:size-[190px]"
                aria-hidden="true"
                data-depth="12"
              />
              <div
                className="ink-landscape absolute -inset-y-2.5 inset-x-0 -z-10 mix-blend-multiply"
                aria-hidden="true"
                data-depth="6"
              >
                <Image
                  src={assets.about}
                  alt=""
                  fill
                  sizes="(max-width:768px) 100vw,50vw"
                  className="object-cover object-[left_55%]"
                />
              </div>
              <span className="absolute bottom-7 left-4 font-mono text-[8px] tracking-[0.2em] text-slate-200 [writing-mode:vertical-rl]">
                CRAFTED WITH INTENTION.
              </span>
            </div>
          </div>
          <div className="pt-6 md:pt-1">
            <p
              className="about-intro m-0 mb-5 text-[26px] leading-[1.3] font-semibold tracking-[-0.035em] md:text-2xl xl:text-3xl"
              data-reveal
            >
              Thoughtful interfaces.
              <br />
              Serious engineering.
            </p>
            <p className="m-0 text-[13px] leading-[1.75] text-slate-600 xl:text-sm">
              {profile.summary} As a technical lead at PHANTOMS, I connect
              architecture, AI, and real-time systems with the people building
              them.
            </p>
            <div
              className="principle-grid mt-8 grid grid-cols-2 gap-x-6 gap-y-8"
              data-reveal-group
            >
              {principles.map(({ icon: Icon, title, text }) => (
                <article key={title}>
                  <Icon
                    size={25}
                    strokeWidth={1.5}
                    className="mb-3.5 text-identity-ink"
                  />
                  <h3 className="mb-2 text-xs font-semibold xl:text-[13px]">
                    {title}
                  </h3>
                  <p className="m-0 text-[11px] leading-relaxed text-slate-600 xl:text-xs">
                    {text}
                  </p>
                </article>
              ))}
            </div>
            <a
              className="mt-7 inline-flex items-center gap-4 text-xs font-semibold hover:underline"
              href={profile.cvUrl}
              download
            >
              Explore my background
              <ArrowUpRight size={16} className="text-identity-ink" />
            </a>
          </div>
        </div>
        <div
          className="about-foundations mt-7 grid gap-6 border-t border-slate-900/10 pt-6 md:mt-4 md:grid-cols-2 md:gap-10"
          data-reveal-group
        >
          <div className="flex items-start gap-3.5">
            <GraduationCap
              size={19}
              className="mt-1 shrink-0 text-identity-ink"
            />
            <p className="m-0 flex flex-col gap-1.5">
              <span className="font-mono text-[8px] tracking-wide text-slate-500">
                EDUCATION · {education.period}
              </span>
              <strong className="text-xs font-semibold">
                Bachelor of Technology in IT
              </strong>
              <small className="text-[11px] leading-relaxed text-slate-600">
                {education.institution}
              </small>
            </p>
          </div>
          <div className="flex items-start gap-3.5">
            <Sparkles size={19} className="mt-1 shrink-0 text-identity-ink" />
            <p className="m-0 flex flex-col gap-1.5">
              <span className="font-mono text-[8px] tracking-wide text-slate-500">
                TRAINING & CERTIFICATIONS
              </span>
              <strong className="text-xs font-semibold">
                Cisco Networking Academy · New Horizons
              </strong>
              <small className="text-[11px] leading-relaxed text-slate-600">
                IoT, cybersecurity, JavaScript, and full-stack web development.
              </small>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section id="stats" className={`dark-section journey-section ${darkShell}`}>
      <div className={frame}>
        <SectionLabel number="02">THE JOURNEY</SectionLabel>
        <SectionHeading
          note={
            <>
              Experience with purpose.
              <br />A track record across disciplines.
            </>
          }
        >
          Built to solve.
          <br />
          <span className="accent text-identity-bright">
            Driven to go further.
          </span>
        </SectionHeading>
        <div
          className="journey-grid grid gap-4 md:grid-cols-[1.2fr_1fr] xl:grid-cols-[5fr_3fr_4fr]"
          data-reveal-group
        >
          <article className="journey-feature relative isolate flex min-h-[285px] min-w-0 flex-col justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#11181d] p-6 md:row-span-2 xl:row-span-1 xl:min-h-[302px] xl:p-7">
            <div
              className="absolute inset-0 -z-20 opacity-15"
              aria-hidden="true"
            >
              <Image
                src={assets.hero}
                alt=""
                fill
                sizes="(max-width:768px) 100vw,45vw"
                className="object-cover object-[70%_center]"
              />
            </div>
            <div
              className="absolute inset-0 -z-10 bg-linear-to-br from-transparent to-identity/10"
              aria-hidden="true"
            />
            <span className={micro}>THE FOUNDATION</span>
            <strong className="my-4 flex items-baseline gap-5 text-[95px] leading-none font-normal tracking-[-0.07em] xl:text-[102px]">
              {profile.experience}
              <span className="font-mono text-[10px] tracking-widest text-identity-bright">
                YEARS
              </span>
            </strong>
            <h3 className="m-0 text-2xl leading-tight font-medium tracking-tight">
              From the idea.
              <br />
              Through every layer.
            </h3>
            <p className="mt-4 mb-0 text-xs text-slate-400">
              Full stack software development.
            </p>
            <ArrowUpRight
              size={23}
              className="absolute right-6 bottom-6 text-identity-bright"
              aria-hidden="true"
            />
          </article>
          <article className="journey-products min-w-0 rounded-2xl border border-white/10 bg-[#11181d] p-6 xl:p-7">
            <span className={micro}>REAL PRODUCTS</span>
            <strong className="mt-5 flex items-center gap-6 text-[60px] leading-none font-normal tracking-[-0.06em] text-identity-bright xl:mt-7 xl:flex-col xl:items-start xl:gap-3 xl:text-[66px]">
              {profile.platforms}
              <span className="font-mono text-[10px] leading-relaxed tracking-widest text-slate-200">
                PRODUCTION
                <br />
                PLATFORMS
              </span>
            </strong>
            <p className="mt-5 mb-0 text-xs leading-relaxed text-slate-400">
              Education. Healthcare. AI.
              <br />
              Web, desktop, and IoT.
            </p>
            <span className="mt-5 block text-[10px] text-slate-400">
              From the professional CV.
            </span>
          </article>
          <article className="journey-lead min-w-0 rounded-2xl border border-white/10 bg-[#11181d] p-6 xl:p-7">
            <span className={micro}>BUILDING & LEADING</span>
            <span className="mt-6 block font-mono text-[9px] tracking-wide text-identity-bright xl:mt-8">
              2025 — PRESENT
            </span>
            <h3 className="mt-4 mb-3 text-[26px] leading-tight font-medium tracking-tight">
              Lead developer.
              <br />
              Technical lead.
            </h3>
            <p className="m-0 text-xs text-slate-400">
              PHANTOMS Technology Team
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Architecture", "Code reviews", "Mentoring"].map((label) => (
                <span
                  key={label}
                  className="rounded border border-white/10 px-2 py-1.5 text-[10px] text-slate-300"
                >
                  {label}
                </span>
              ))}
            </div>
          </article>
        </div>
        <div
          className="journey-system mt-7 flex flex-col gap-5 md:flex-row md:flex-wrap md:items-center md:justify-between"
          data-reveal
        >
          <span className={micro}>ONE CONNECTED SYSTEM</span>
          <div className="flex w-full items-center justify-between gap-2 text-identity-bright sm:w-auto sm:gap-3">
            <TechnologyIcon name="React" size={23} />
            <span className="font-mono text-[8px] tracking-wide text-slate-300">
              INTERFACE
            </span>
            <span
              className="h-px w-6 bg-identity/50 sm:mx-2 sm:w-14"
              aria-hidden="true"
            />
            <TechnologyIcon name="NestJS" size={23} />
            <span className="font-mono text-[8px] tracking-wide text-slate-300">
              API
            </span>
            <span
              className="h-px w-6 bg-identity/50 sm:mx-2 sm:w-14"
              aria-hidden="true"
            />
            <TechnologyIcon name="PostgreSQL" size={23} />
            <span className="font-mono text-[8px] tracking-wide text-slate-300">
              DATA
            </span>
          </div>
          <span className="hidden text-xs text-slate-400 xl:block">
            Clarity at every boundary.
          </span>
        </div>
      </div>
    </section>
  );
}

const stages = [
  {
    title: "Discover",
    icon: Compass,
    subtitle: "Start with the right problem.",
    text: "Understand the people, purpose, and constraints before deciding what to build.",
  },
  {
    title: "Design",
    icon: PencilLine,
    subtitle: "Make complexity feel clear.",
    text: "Shape the experience and architecture together. Keep decisions intentional.",
  },
  {
    title: "Build",
    icon: Braces,
    subtitle: "Connect every layer.",
    text: "Write maintainable code, integrate the system, and test the details that matter.",
  },
  {
    title: "Ship",
    icon: Rocket,
    subtitle: "Deliver. Learn. Refine.",
    text: "Release with care, observe real use, and improve with what the product teaches us.",
  },
];

export function ProcessSection() {
  return (
    <section
      id="process"
      className={`light-section process-section ${lightShell} mt-3 sm:mt-[18px]`}
    >
      <div className={lightFrame}>
        <SectionLabel number="06" tone="light">
          MY PROCESS
        </SectionLabel>
        <SectionHeading
          tone="light"
          note={
            <>
              A simple path.
              <br />A considered result.
            </>
          }
        >
          From idea to <span className="accent text-identity-ink">impact.</span>
        </SectionHeading>
        <div className="process-timeline relative pt-2.5">
          <div
            className="process-connector absolute top-9 right-[26px] left-[26px] hidden h-px bg-slate-900/10 lg:block"
            aria-hidden="true"
          >
            <span className="process-progress block h-full w-full origin-left bg-identity-ink motion-reduce:transform-none" />
          </div>
          <div
            className="process-grid relative grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-9 lg:grid-cols-4 lg:gap-7"
            data-reveal-group
          >
            {stages.map(({ title, icon: Icon, subtitle, text }, i) => (
              <article
                className="process-step relative min-w-0 pb-8 pl-[76px] last:pb-0 before:absolute before:top-[51px] before:bottom-0 before:left-[25px] before:w-px before:bg-identity/30 last:before:hidden sm:p-0 sm:before:hidden"
                key={title}
              >
                <div className="process-node absolute top-0 left-0 grid size-[52px] place-items-center rounded-full border border-identity/40 bg-[#f5f5f2] text-identity-ink sm:relative sm:mb-6">
                  <Icon size={23} strokeWidth={1.6} />
                  <span className="absolute -top-2 -right-2 rounded-full bg-[#f5f5f2] px-1.5 py-1 font-mono text-[8px] text-slate-500">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-0 mb-3 text-2xl font-semibold tracking-tight">
                  {title}
                </h3>
                <strong className="mb-2 block text-xs leading-relaxed font-semibold">
                  {subtitle}
                </strong>
                <p className="m-0 text-xs leading-relaxed text-slate-600">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const contactRow = "flex items-center gap-3.5 border-b border-white/10 py-5";
const contactField = "flex min-w-0 flex-col gap-1.5";
const contactLabel = "font-mono text-[9px] tracking-widest text-slate-400";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="contact-section relative isolate overflow-hidden [--accent:#49baf1] [--accent-on-light:#076c9b] [--accent-on-dark:#49baf1]"
      aria-labelledby="contact-title"
    >
      <div
        className="contact-art absolute -inset-y-[8%] inset-x-0 -z-40 opacity-75 lg:opacity-90"
        aria-hidden="true"
        data-depth="10"
      >
        <Image
          src={assets.contact}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[66%_54%]"
        />
      </div>
      <div
        className="contact-fog absolute -inset-x-[5%] top-[30%] -bottom-[5%] -z-30 bg-radial from-identity/15 to-transparent"
        aria-hidden="true"
        data-depth="16"
      />
      <div
        className="contact-shade absolute inset-0 -z-20 bg-linear-to-r from-[#080b0d] via-[#080b0d]/55 to-[#080b0d]/25"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-[#080b0d] to-transparent"
        aria-hidden="true"
      />
      <div
        className={`contact-inner ${frame} flex flex-col items-start gap-9 py-12 md:min-h-[520px] md:flex-row md:items-center md:justify-between md:gap-10 md:py-[70px]`}
      >
        <div className="contact-copy">
          <SectionLabel>LET’S CONNECT</SectionLabel>
          <h2
            id="contact-title"
            className="m-0 text-[clamp(36px,10.3vw,61px)] leading-none font-bold tracking-[-0.05em] md:text-[clamp(40px,4.6vw,66px)]"
          >
            <span className="contact-line -mb-[3px] block overflow-hidden pb-[3px]">
              <span className="inline-block" data-contact-line>
                LET’S BUILD
              </span>
            </span>
            <span className="contact-line -mb-[3px] block overflow-hidden pb-[3px]">
              <span className="inline-block" data-contact-line>
                SOMETHING
              </span>
            </span>
            <span className="contact-line -mb-[3px] block overflow-hidden pb-[3px] text-identity-bright">
              <span className="inline-block" data-contact-line>
                THAT MATTERS.
              </span>
            </span>
          </h2>
          <p className="mt-6 mb-7 text-xs leading-relaxed text-slate-300 xl:text-sm">
            Have a product to build or a challenge worth solving?
            <br />
            Let’s make the next chapter a good one.
          </p>
          <ActionLink href={`mailto:${profile.email}`}>
            Start a conversation
          </ActionLink>
        </div>
        <aside className="contact-card w-full min-w-0 rounded-2xl border border-white/15 bg-[#0b151f]/85 p-6 backdrop-blur-xl md:mt-12 md:w-[290px] md:shrink-0 xl:w-[325px]">
          <span className="font-mono text-[8px] tracking-wide text-slate-400">
            A GOOD IDEA STARTS WITH HELLO.
          </span>
          <a className={contactRow} href={`mailto:${profile.email}`}>
            <Mail size={20} className="shrink-0 text-identity-bright" />
            <div className={contactField}>
              <span className={contactLabel}>EMAIL</span>
              <strong className="text-xs font-medium break-all">
                {profile.email}
              </strong>
            </div>
            <ArrowUpRight
              size={16}
              className="ml-auto shrink-0 text-slate-400"
            />
          </a>
          <div className={contactRow}>
            <MapPin size={20} className="shrink-0 text-identity-bright" />
            <div className={contactField}>
              <span className={contactLabel}>BASED IN</span>
              <strong className="text-xs font-medium">
                {profile.location}
              </strong>
            </div>
          </div>
          <a
            className={contactRow}
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiGithub size={20} className="shrink-0 text-identity-bright" />
            <div className={contactField}>
              <span className={contactLabel}>GITHUB</span>
              <strong className="text-xs font-medium">@{profile.handle}</strong>
            </div>
            <ArrowUpRight
              size={16}
              className="ml-auto shrink-0 text-slate-400"
            />
          </a>
          <div className="mt-5 flex items-center gap-2.5 text-[11px] text-slate-300">
            <span className="size-[7px] shrink-0 rounded-full bg-identity" />
            {profile.availability}
          </div>
        </aside>
      </div>
    </section>
  );
}
