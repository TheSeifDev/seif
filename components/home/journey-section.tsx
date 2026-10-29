import {
  ArrowDownRight,
  ArrowUpRight,
  Braces,
  Layers3,
  Network,
} from "lucide-react";
import { experience, profile } from "@/lib/content/home";
import { darkShell, frame, micro } from "@/lib/ui/layout";
import { JourneyPin } from "@/components/motion/journey-pin";
import { SectionHeading, SectionLabel } from "./primitives";
import { TechnologyIcon } from "./technology-icons";

const ownershipLayers = [
  { label: "INTERFACE", technology: "React", detail: "Frontend" },
  { label: "API", technology: "NestJS", detail: "Services" },
  { label: "DATA", technology: "PostgreSQL", detail: "Models" },
] as const;

const leadershipSignals = [
  "Architecture",
  "Engineering standards",
  "Code reviews",
  "Mentoring",
] as const;

export function JourneySection() {
  const technicalLead = experience[0];

  return (
    <section
      id="stats"
      className={`dark-section journey-section bg-[#080b0d] ${darkShell}`}
      aria-labelledby="journey-title"
    >
      <div className={frame}>
        <SectionLabel number="02">THE JOURNEY</SectionLabel>
        <SectionHeading
          note={
            <>
              A record of building across the stack.
              <br />
              Ownership that gets more useful with depth.
            </>
          }
        >
          <span id="journey-title">
            Built from the ground up.
            <br />
            <span className="text-identity-bright">Carried with intent.</span>
          </span>
        </SectionHeading>

        <JourneyPin>
          <article
            id="journey-foundation-panel"
            data-journey-panel="foundation"
            aria-labelledby="journey-foundation-title"
            className="relative min-h-[30rem] overflow-hidden border-y border-white/15 bg-[#0c1419] px-5 py-7 sm:px-8 sm:py-9 lg:grid lg:grid-cols-[0.82fr_1.18fr] lg:gap-12 lg:px-12 lg:py-12 data-[mode=desktop]:absolute data-[mode=desktop]:inset-0 data-[mode=desktop]:min-h-0"
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-linear-to-br from-identity/10 via-transparent to-transparent"
              aria-hidden="true"
            />
            <div className="relative flex min-w-0 flex-col justify-between gap-10">
              <div className="flex items-center justify-between gap-4">
                <span className={micro}>01 / 03 · FOUNDATION</span>
                <ArrowDownRight
                  size={20}
                  className="shrink-0 text-identity-bright"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="m-0 font-mono text-[10px] tracking-[0.16em] text-slate-400">
                  EXPERIENCE, MEASURED IN PRACTICE
                </p>
                <p className="m-0 mt-3 flex items-end gap-4 text-[clamp(96px,15vw,184px)] leading-[0.78] font-semibold tracking-[-0.11em] text-[#f4f5f2]">
                  {profile.experience}
                  <span className="mb-1 text-[11px] leading-none tracking-[0.14em] text-identity-bright sm:mb-3">
                    YEARS
                  </span>
                </p>
              </div>
            </div>
            <div className="relative flex min-w-0 flex-col justify-end lg:pt-12">
              <h3
                id="journey-foundation-title"
                className="m-0 max-w-[11ch] text-[clamp(34px,5vw,66px)] leading-[0.98] font-semibold tracking-[-0.06em]"
              >
                From the idea.
                <br />
                Through every layer.
              </h3>
              <p className="mt-7 mb-0 max-w-[42rem] text-[13px] leading-[1.75] text-slate-300 sm:text-sm">
                A foundation in full-stack delivery: thoughtful React and
                Next.js interfaces, NestJS APIs, PostgreSQL data models, and
                cloud delivery shaped into production-grade platforms.
              </p>
              <div className="mt-8 flex items-center gap-3 border-t border-white/15 pt-4">
                <Layers3
                  size={18}
                  strokeWidth={1.5}
                  className="text-identity-bright"
                  aria-hidden="true"
                />
                <span className="font-mono text-[10px] tracking-[0.12em] text-slate-400">
                  FULL-STACK SOFTWARE DEVELOPMENT
                </span>
              </div>
            </div>
          </article>

          <article
            id="journey-products-panel"
            data-journey-panel="products"
            aria-labelledby="journey-products-title"
            className="relative min-h-[30rem] overflow-hidden border-y border-white/15 bg-[#101c24] px-5 py-7 sm:px-8 sm:py-9 lg:grid lg:grid-cols-[0.7fr_1.3fr] lg:gap-14 lg:px-12 lg:py-12 data-[mode=desktop]:absolute data-[mode=desktop]:inset-0 data-[mode=desktop]:min-h-0"
          >
            <div className="relative flex min-w-0 flex-col justify-between gap-10">
              <span className={micro}>02 / 03 · PRODUCTS</span>
              <div>
                <p className="m-0 text-[clamp(104px,16vw,196px)] leading-[0.78] font-semibold tracking-[-0.12em] text-identity-bright">
                  {profile.platforms}
                </p>
                <p className="mt-5 mb-0 font-mono text-[10px] leading-[1.6] tracking-[0.14em] text-slate-300">
                  PRODUCTION
                  <br />
                  PLATFORMS
                </p>
              </div>
            </div>
            <div className="relative flex min-w-0 flex-col justify-end">
              <div className="mb-10 flex items-start gap-4 border-b border-white/15 pb-5">
                <Braces
                  size={24}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-identity-bright"
                  aria-hidden="true"
                />
                <p className="m-0 max-w-[35rem] text-[clamp(25px,3.5vw,46px)] leading-[1.04] font-medium tracking-[-0.05em]">
                  Ownership is the thread between architecture and the final
                  interaction.
                </p>
              </div>
              <h3 id="journey-products-title" className="sr-only">
                Product ownership across every layer
              </h3>
              <p className="m-0 max-w-[40rem] text-[13px] leading-[1.75] text-slate-300 sm:text-sm">
                Five production platforms across education, healthcare, AI, web,
                desktop, and IoT. The work moves between product context and the
                systems that make a dependable experience possible.
              </p>
              <div
                className="mt-8 grid border-y border-white/15 sm:grid-cols-3"
                aria-label="Ownership across the stack"
              >
                {ownershipLayers.map(({ label, technology, detail }, index) => (
                  <div
                    className="flex min-w-0 items-center gap-3 border-b border-white/10 py-4 last:border-b-0 sm:border-r sm:border-b-0 sm:px-4 sm:first:pl-0 sm:last:border-r-0"
                    key={label}
                  >
                    <TechnologyIcon name={technology} size={22} />
                    <span className="min-w-0">
                      <span className="block font-mono text-[9px] tracking-[0.1em] text-identity-bright">
                        {label}
                      </span>
                      <span className="mt-1 block text-[12px] text-slate-200">
                        {detail}
                      </span>
                    </span>
                    {index === ownershipLayers.length - 1 && (
                      <Network
                        size={16}
                        className="ml-auto shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article
            id="journey-leadership-panel"
            data-journey-panel="leadership"
            aria-labelledby="journey-leadership-title"
            className="relative min-h-[30rem] overflow-hidden border-y border-white/15 bg-[#0b151f] px-5 py-7 sm:px-8 sm:py-9 lg:grid lg:grid-cols-[0.74fr_1.26fr] lg:gap-14 lg:px-12 lg:py-12 data-[mode=desktop]:absolute data-[mode=desktop]:inset-0 data-[mode=desktop]:min-h-0"
          >
            <div className="relative flex min-w-0 flex-col justify-between gap-10">
              <div className="flex items-center justify-between gap-4">
                <span className={micro}>03 / 03 · LEADERSHIP</span>
                <span className="font-mono text-[10px] tracking-[0.12em] text-identity-bright">
                  {technicalLead.period}
                </span>
              </div>
              <div>
                <p className="m-0 max-w-[10ch] text-[clamp(45px,6vw,78px)] leading-[0.92] font-semibold tracking-[-0.07em]">
                  Lead the
                  <br />
                  system.
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <span
                    className="size-2 rounded-full bg-identity"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[10px] tracking-[0.1em] text-slate-300">
                    {technicalLead.organization}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative flex min-w-0 flex-col justify-end">
              <h3
                id="journey-leadership-title"
                className="m-0 max-w-[13ch] text-[clamp(36px,5vw,68px)] leading-[0.95] font-semibold tracking-[-0.06em]"
              >
                Technical lead.
                <br />
                <span className="text-identity-bright">
                  Make the work clearer.
                </span>
              </h3>
              <p className="mt-7 mb-0 max-w-[42rem] text-[13px] leading-[1.75] text-slate-300 sm:text-sm">
                {technicalLead.detail}
              </p>
              <div className="mt-8 grid grid-cols-2 border-y border-white/15 sm:grid-cols-4">
                {leadershipSignals.map((signal) => (
                  <div
                    className="flex min-h-14 items-center border-b border-white/10 px-3 py-3 font-mono text-[10px] leading-[1.35] tracking-[0.06em] text-slate-300 last:border-b-0 even:border-l sm:border-b-0 sm:border-r sm:first:pl-0 sm:last:border-r-0"
                    key={signal}
                  >
                    {signal}
                  </div>
                ))}
              </div>
              <div className="mt-7 flex items-center gap-3 text-[12px] text-slate-400">
                <ArrowUpRight
                  size={17}
                  className="text-identity-bright"
                  aria-hidden="true"
                />
                <span>Architecture with people in mind.</span>
              </div>
            </div>
          </article>
        </JourneyPin>
      </div>
    </section>
  );
}
