import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Accent, PillLink, SectionLabel } from "@/components/system/primitives";
import { assets, profile } from "@/lib/content/profile";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

const layers = [
  { name: "Interface", detail: "React · Next.js · TypeScript" },
  { name: "Systems", detail: "APIs · Data · Real-time" },
  { name: "Delivery", detail: "Architecture · Reviews · Deployment" },
] as const;

/** About-only identity spread. All copy and links are readable before GSAP. */
export function AboutHero() {
  return (
    <section
      data-about-hero
      aria-labelledby="about-hero-heading"
      className="relative isolate overflow-hidden bg-night pb-12 pt-32 text-snow sm:pb-16 sm:pt-36 lg:pb-16 lg:pt-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_35%,rgba(85,185,255,0.08),transparent_58%)]"
      />
      <div className={container}>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div data-about-hero-copy className="relative lg:col-span-7">
            <SectionLabel>About / {profile.name}</SectionLabel>
            <h1
              id="about-hero-heading"
              className="mt-8 max-w-4xl font-display text-[clamp(3.15rem,6.5vw,6.25rem)] font-extrabold uppercase leading-[0.93] tracking-[-0.045em]"
            >
              <span className="block">Engineer of the </span>
              <span className="block"><Accent>whole product</Accent>.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[16px] leading-[1.75] text-mist sm:text-[17px]">
              {profile.intro}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PillLink href={profile.cvUrl} variant="accent">Download CV</PillLink>
              <PillLink href="/contact" variant="outline-dark">Start a conversation</PillLink>
            </div>
            <dl className="mt-10 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2 lg:max-w-xl">
              <div>
                <dt className={cn(label, "text-sky")}>Based in</dt>
                <dd className="mt-3 text-sm leading-relaxed text-mist">{profile.location}</dd>
              </div>
              <div>
                <dt className={cn(label, "text-sky")}>Open to</dt>
                <dd className="mt-3 max-w-xs text-sm leading-relaxed text-mist">Remote roles & freelance work</dd>
              </div>
            </dl>
          </div>

          <aside
            data-about-hero-art
            aria-label="From interface to delivery"
            className="relative isolate mx-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-night-2 shadow-[0_30px_90px_-50px_rgba(85,185,255,0.3)] sm:rounded-[36px] lg:col-span-5"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 overflow-hidden">
              <Image
                data-about-hero-world
                src={assets.heroWorld}
                alt=""
                fill
                loading="lazy"
                fetchPriority="low"
                quality={60}
                sizes="(min-width: 1024px) 560px, (min-width: 640px) 580px, 95vw"
                className="object-cover object-center opacity-45"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,0.2),rgba(5,7,10,0.65)_50%,#0a0d12_100%)]" />
            </div>
            <div className="relative flex min-h-[420px] flex-col p-7 sm:min-h-[470px] sm:p-9 lg:min-h-[530px]">
              <div className="flex items-center justify-between gap-4">
                <p className={cn(label, "text-snow/75")}>One product. Every layer.</p>
                <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-sky" />
              </div>
              <div aria-hidden="true" className="relative flex flex-1 items-center justify-center py-7">
                <div className="absolute h-40 w-40 rounded-full border border-sky/15 sm:h-48 sm:w-48" />
                <div className="absolute h-28 w-28 rounded-full border border-sky/10 sm:h-36 sm:w-36" />
                <span
                  data-about-hero-kanji
                  className="relative font-japanese text-[clamp(7rem,11vw,10rem)] leading-none tracking-[-0.09em] text-transparent [-webkit-text-stroke:1px_rgba(85,185,255,0.45)]"
                >
                  技匠
                </span>
              </div>
              <ol className="relative border-t border-white/15">
                {layers.map((layer, index) => (
                  <li key={layer.name} data-about-hero-layer className="grid grid-cols-[1.5rem_1fr] gap-x-3 border-b border-white/10 py-4">
                    <span className="pt-0.5 font-mono text-[10px] tracking-wider text-sky">0{index + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-snow">{layer.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-mist">{layer.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        <a
          href="#introduction"
          className="group mt-12 flex items-center justify-between gap-4 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-mist transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky lg:mt-14"
        >
          <span>Scroll to meet the engineer</span>
          <span className="flex items-center gap-3 text-sky">
            <span aria-hidden="true" className="hidden sm:inline">01 / Introduction</span>
            <ArrowDown size={16} aria-hidden="true" className="transition-transform group-hover:translate-y-1 motion-reduce:transform-none" />
          </span>
        </a>
      </div>
    </section>
  );
}
