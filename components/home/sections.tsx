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
import { frame, lightFrame, lightShell } from "@/lib/ui/layout";
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
    text: "From data models and APIs to the interface and deployment.",
  },
  {
    icon: Sparkles,
    title: "Technical leadership",
    text: "Engineering standards, code reviews, and developer mentoring.",
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className={`about-section light-section ${lightShell} z-20 -mt-6 overflow-clip lg:-mt-14`}
      aria-labelledby="about-title"
    >
      <div className={lightFrame}>
        <SectionLabel number="01" tone="light">
          ABOUT ME
        </SectionLabel>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <h2
              id="about-title"
              className="m-0 text-[clamp(32px,8vw,60px)] leading-[1.01] font-bold tracking-[-0.055em] lg:text-[clamp(40px,4.2vw,64px)]"
            >
              {["I BUILD PRODUCTS", "THAT SOLVE REAL", "PROBLEMS."].map(
                (t, i) => (
                  <span
                    className={`block overflow-clip pb-[0.05em] ${i === 2 ? "text-identity-ink" : ""}`}
                    key={t}
                  >
                    <span data-about-line className="inline-block">
                      {t}
                    </span>
                  </span>
                ),
              )}
            </h2>
            <div
              className="about-art relative isolate -ml-[var(--surface-pad)] mt-8 h-[280px] w-[calc(100%_+_var(--surface-pad))] lg:h-[345px]"
              data-about-mask
            >
              <span
                className="ink-sun absolute top-8 left-[35%] -z-20 size-[135px] rounded-full bg-identity lg:size-[170px]"
                aria-hidden="true"
              />
              <div
                className="ink-landscape absolute inset-0 -z-10 mix-blend-multiply"
                aria-hidden="true"
              >
                <Image
                  src={assets.about}
                  alt=""
                  fill
                  sizes="(max-width:1023px) 100vw,50vw"
                  className="object-cover object-[left_55%]"
                />
              </div>
            </div>
          </div>
          <div className="lg:pt-1">
            <p
              className="mb-5 text-[26px] leading-tight font-semibold tracking-[-0.035em] sm:text-3xl"
              data-about-copy
            >
              Thoughtful interfaces.
              <br />
              Serious engineering.
            </p>
            <p
              className="max-w-[50ch] text-[14px] leading-[1.8] text-slate-600"
              data-about-copy
            >
              {profile.summary} As a technical lead at PHANTOMS, I connect
              architecture, AI, and real-time systems with the people building
              them.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-x-7 gap-y-9">
              {principles.map(({ icon: Icon, title, text }) => (
                <article key={title}>
                  <Icon
                    size={24}
                    strokeWidth={1.5}
                    className="mb-3 text-identity-ink"
                  />
                  <h3 className="mb-2 text-sm font-semibold">{title}</h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {text}
                  </p>
                </article>
              ))}
            </div>
            <a
              className="mt-8 inline-flex items-center gap-4 text-xs font-semibold hover:underline focus-visible:outline-identity"
              href={profile.cvUrl}
              download
            >
              Explore my background
              <ArrowUpRight size={16} className="text-identity-ink" />
            </a>
          </div>
        </div>
        <div className="mt-7 grid gap-5 border-t border-slate-900/10 pt-6 md:grid-cols-2">
          <div className="flex gap-3">
            <GraduationCap size={21} className="shrink-0 text-identity-ink" />
            <div>
              <span className="font-mono text-[10px] text-slate-500">
                EDUCATION · {education.period}
              </span>
              <p className="mt-2 text-sm font-semibold">
                Bachelor of Technology in IT
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {education.institution}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Sparkles size={21} className="shrink-0 text-identity-ink" />
            <div>
              <span className="font-mono text-[10px] text-slate-500">
                TRAINING & CERTIFICATIONS
              </span>
              <p className="mt-2 text-sm font-semibold">
                Cisco Networking Academy · New Horizons
              </p>
              <p className="mt-1 text-xs text-slate-600">
                IoT, cybersecurity, JavaScript, and full-stack development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const stages = [
  {
    title: "Discover",
    icon: Compass,
    text: "Understand the people, purpose, and constraints. Start with the right problem.",
  },
  {
    title: "Design",
    icon: PencilLine,
    text: "Shape the experience and architecture together. Make complexity feel clear.",
  },
  {
    title: "Build",
    icon: Braces,
    text: "Connect every layer with maintainable code. Test the details that matter.",
  },
  {
    title: "Ship",
    icon: Rocket,
    text: "Release with care, observe real use, and improve with what the product teaches us.",
  },
];

export function ProcessSection() {
  return (
    <section
      id="process"
      className={`process-section light-section ${lightShell} mt-3 pb-24! sm:mt-5 sm:pb-28!`}
      aria-labelledby="process-title"
    >
      <div className={lightFrame}>
        <SectionLabel number="06" tone="light">
          MY PROCESS
        </SectionLabel>
        <SectionHeading
          tone="light"
          note="Four considered steps. One connected product."
        >
          <span id="process-title">
            From idea to <span className="text-identity-ink">impact.</span>
          </span>
        </SectionHeading>
        <div className="process-timeline relative mt-10">
          <div
            className="pointer-events-none absolute top-5 bottom-10 left-5 w-px bg-slate-900/10 md:top-6 md:right-6 md:bottom-auto md:left-6 md:h-px md:w-auto"
            aria-hidden="true"
          >
            <span
              data-process-progress
              className="block size-full origin-top bg-identity-ink md:origin-left"
            />
          </div>
          <div className="relative grid gap-9 md:grid-cols-4 md:gap-7">
            {stages.map(({ title, icon: Icon, text }, i) => (
              <article
                key={title}
                className="process-step relative min-w-0 pl-16 md:pl-0"
                data-process-step
              >
                <div className="absolute top-0 left-0 grid size-10 place-items-center rounded-full border border-identity/35 bg-[#f5f5f2] text-identity-ink md:relative md:mb-6 md:size-12">
                  <Icon size={22} strokeWidth={1.6} />
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  0{i + 1}
                </span>
                <h3 className="mt-2 mb-3 text-2xl font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-600">
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

export function ContactSection() {
  return (
    <section
      id="contact"
      className="contact-section relative isolate z-20 -mt-8 overflow-clip rounded-t-[var(--section-radius)] lg:-mt-10"
      aria-labelledby="contact-title"
    >
      <div
        className="contact-art absolute -inset-y-8 inset-x-0 -z-30"
        data-contact-mask
        aria-hidden="true"
      >
        <Image
          src={assets.contact}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[65%_center]"
        />
      </div>
      <div
        className="absolute inset-0 -z-20 bg-linear-to-r from-[#080b0d] via-[#080b0d]/75 to-[#080b0d]/20"
        aria-hidden="true"
      />
      <div
        className="contact-fog absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_65%_80%,#49baf121,transparent_66%)]"
        aria-hidden="true"
      />
      <div
        className={`${frame} contact-inner relative flex min-h-[620px] flex-col justify-center gap-10 py-20 lg:min-h-[680px] lg:flex-row lg:items-center lg:justify-between lg:gap-16`}
      >
        <div className="max-w-[740px]">
          <SectionLabel number="07">LET’S CONNECT</SectionLabel>
          <h2
            id="contact-title"
            className="text-[clamp(38px,10vw,64px)] leading-[0.98] font-bold tracking-[-0.055em] lg:text-[clamp(56px,5.2vw,76px)]"
          >
            {["LET’S BUILD", "SOMETHING", "THAT MATTERS."].map((t, i) => (
              <span
                className={`block overflow-clip pb-[0.06em] ${i === 2 ? "text-identity" : ""}`}
                key={t}
              >
                <span data-contact-line className="inline-block">
                  {t}
                </span>
              </span>
            ))}
          </h2>
          <p className="mt-5 mb-7 max-w-[38ch] text-sm leading-relaxed text-slate-300">
            Have a product to build or a challenge worth solving? Let’s make the
            next chapter a good one.
          </p>
          <ActionLink href={`mailto:${profile.email}`}>
            Start a conversation
          </ActionLink>
        </div>
        <aside className="contact-card w-full max-w-[350px] rounded-2xl border border-identity/20 bg-[#0b151f]/95 p-6 shadow-[0_16px_40px_#0004] lg:shrink-0">
          <span className="font-mono text-[10px] tracking-wide text-slate-400">
            A GOOD IDEA STARTS WITH HELLO.
          </span>
          <a
            href={`mailto:${profile.email}`}
            className="mt-4 flex items-center gap-3 border-b border-white/10 py-5"
          >
            <Mail size={20} className="shrink-0 text-identity" />
            <div className="min-w-0">
              <span className="font-mono text-[10px] text-slate-400">
                EMAIL
              </span>
              <strong className="mt-1 block text-xs font-medium break-all">
                {profile.email}
              </strong>
            </div>
          </a>
          <div className="flex items-center gap-3 border-b border-white/10 py-5">
            <MapPin size={20} className="shrink-0 text-identity" />
            <div>
              <span className="font-mono text-[10px] text-slate-400">
                BASED IN
              </span>
              <strong className="mt-1 block text-xs font-medium">
                {profile.location}
              </strong>
            </div>
          </div>
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 border-b border-white/10 py-5"
          >
            <SiGithub size={20} className="shrink-0 text-identity" />
            <div>
              <span className="font-mono text-[10px] text-slate-400">
                GITHUB
              </span>
              <strong className="mt-1 block text-xs font-medium">
                @{profile.handle}
              </strong>
            </div>
          </a>
          <p className="mt-5 flex items-center gap-2 text-xs text-slate-300">
            <span className="size-1.5 rounded-full bg-identity" />
            {profile.availability}
          </p>
        </aside>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-[#080b0d] to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
