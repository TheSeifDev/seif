import Image from "next/image";
import { FileText, Sparkles } from "lucide-react";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { isUnoptimizedCmsImage } from "@/components/site/cms-image";
import { container, displayXL } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { PillLink, SectionLabel } from "@/components/system/primitives";
import { PortraitShield } from "@/components/visuals/portrait-shield";

/**
 * First viewport. On wide, tall screens it is sticky so About slides over
 * it (see the `hero` scene); elsewhere it scrolls normally.
 */
export function Hero({ content }: { content: SiteContent }) {
  const { assets, profile, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  return (
    <section
      data-hero
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-night lg:h-[100svh] lg:min-h-[640px] stage:sticky stage:top-0"
    >
      <div data-hero-bg aria-hidden="true" className="absolute inset-0 -z-10">
        <div data-hero-bg-inner className="absolute inset-0">
          <Image
            src={assets.heroBackground}
            unoptimized={isUnoptimizedCmsImage(assets.heroBackground)}
            alt=""
            fill
            fetchPriority="low"
            quality={60}
            sizes="100vw"
            className="object-cover object-[62%_50%]"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#05070a_0%,rgba(5,7,10,0.88)_30%,rgba(5,7,10,0.25)_62%,rgba(5,7,10,0.5)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-night via-night/70 to-transparent" />
      </div>

      <div
        data-hero-glow
        aria-hidden="true"
        className="absolute bottom-[-12%] right-[-10%] -z-10 h-[70%] w-[90%] rounded-full bg-[radial-gradient(closest-side,rgba(77,182,255,0.32),rgba(77,182,255,0.08)_55%,transparent)] blur-2xl lg:right-[8%] lg:h-[88%] lg:w-[44%]"
      />

      <div
        data-hero-frame
        className={cn(
          container,
          "relative flex flex-col pt-28 sm:pt-32 lg:h-full lg:pb-16 lg:pt-36",
        )}
      >
        <p
          lang="ja"
          aria-hidden="true"
          className="absolute right-5 top-28 z-10 hidden font-jp text-4xl font-bold tracking-[0.12em] text-snow/90 sm:right-8 lg:right-12 lg:top-32 lg:block xl:text-5xl"
        >
          サムライ
        </p>

        <div data-hero-content className="relative z-10 lg:max-w-[40rem]">
          <div data-hero-role>
            <SectionLabel className="text-snow/80">
              {profile.shortRole}
            </SectionLabel>
          </div>
          <h1 id="hero-title" className={cn(displayXL, "mt-6")}>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-title-line className="block text-snow">
                {profile.firstName}
              </span>
            </span>
            <span className="-mt-[0.06em] block overflow-hidden pb-[0.06em]">
              <span data-hero-title-line className="block text-sky">
                {profile.lastName}
              </span>
            </span>
          </h1>
          <p
            data-hero-copy
            lang="ja"
            className="mt-6 font-jp text-lg leading-[1.7] tracking-[0.08em] text-snow/90 sm:text-xl"
          >
            {profile.japaneseMotto.split("、")[0]}、
            <br />
            {profile.japaneseMottoMeaning}
          </p>
          <p
            data-hero-copy
            className="mt-5 max-w-[27rem] text-[15px] leading-relaxed text-mist sm:text-base"
          >
            {c(
              "home.hero.description",
              "I build production web, desktop and AI products — from TypeScript interfaces to NestJS APIs and PostgreSQL data models.",
            )}
          </p>
          <div data-hero-actions className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/projects" data-magnetic="true">
              {c("home.hero.exploreWorkCta", "Explore my work")}
            </PillLink>
            <PillLink
              href={profile.cvUrl}
              external
              variant="outline-dark"
              arrow={false}
              icon={<FileText className="size-4" />}
            >
              Download CV
            </PillLink>
          </div>
        </div>

        <div
          data-hero-portrait
          className="pointer-events-none relative z-[5] mx-auto mt-6 aspect-[3/4] h-[min(62svh,520px)] max-w-full origin-bottom sm:h-[min(64svh,600px)] lg:absolute lg:bottom-0 lg:right-[max(9rem,16%)] lg:mt-0 lg:h-[90%]"
        >
          <div data-hero-portrait-reveal className="absolute inset-0">
            <PortraitShield>
              <Image
                src={assets.portrait}
                unoptimized={isUnoptimizedCmsImage(assets.portrait)}
                alt={profile.fullName}
                fill
                preload
                quality={85}
                sizes="(min-width: 1024px) 42vw, min(90vw, 390px)"
                className="object-contain object-bottom"
              />
            </PortraitShield>
          </div>
        </div>

        <aside
          data-hero-card
          aria-label={c("home.hero.experienceAriaLabel", "Experience")}
          className="absolute bottom-14 right-5 z-10 hidden w-64 rounded-3xl border border-white/10 bg-night/45 p-6 backdrop-blur-md sm:right-8 lg:right-12 lg:block"
        >
          <div data-hero-meta>
            <Sparkles className="size-5 text-sky" aria-hidden="true" />
            <p className="mt-5 font-display text-6xl font-extrabold leading-none tracking-[-0.04em]">
              {profile.experienceYears}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-snow/80">
              {c("home.hero.experienceLabel", "Years experience")}
            </p>
            <p className="mt-4 text-[13px] leading-relaxed text-mist">
              {c(
                "home.hero.experienceDescription",
                "Turning ideas into real products with clean code and meaningful design.",
              )}
            </p>
            <div className="mt-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
              <span>{profile.handle}</span>
              <span aria-hidden="true" className="h-px flex-1 bg-white/15" />
              <span>{c("home.hero.location", profile.location)}</span>
            </div>
          </div>
        </aside>
      </div>

      <div
        data-hero-shade
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-night opacity-0"
      />
    </section>
  );
}
