import Image from "next/image";
import {
  SectionHeading,
  VerticalCaption,
} from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { isUnoptimizedCmsImage } from "@/components/site/cms-image";
import { aboutLightPanel } from "@/lib/ui/about-layout";
import { container, label, mutedOnLight, sectionY } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

export function IntroductionSection({ content }: { content: SiteContent }) {
  const { profile, assets, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const facts = [
    {
      label: c("about.introduction.experienceLabel", "Experience"),
      value: `${profile.experienceYears} years`,
    },
    {
      label: c("about.introduction.platformsLabel", "Production platforms"),
      value: `${profile.platforms} (CV)`,
    },
    {
      label: c("about.introduction.basedInLabel", "Based in"),
      value: profile.location,
    },
    {
      label: c("about.introduction.availabilityLabel", "Availability"),
      value: c("about.introduction.availabilityValue", profile.availability),
    },
  ] as const;
  return (
    <section
      id="introduction"
      data-about-intro-root
      className={cn(aboutLightPanel, "overflow-hidden")}
      aria-labelledby="introduction-heading"
    >
      <div className={cn(container, sectionY)}>
        <SectionHeading
          index="01"
          label={c("about.introduction.sectionLabel", "Introduction")}
          title={
            <CmsTitle
              text={c(
                "about.introduction.title",
                "A calm engineer for complex systems.",
              )}
              accent="complex systems"
            />
          }
          tone="light"
          id="introduction-heading"
          aside={
            <VerticalCaption className="hidden text-sky-ink/70 lg:inline-flex">
              仕組み・体験・責任
            </VerticalCaption>
          }
        />
        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div
            data-about-intro-reveal
            data-about-intro-portrait-wrap
            data-about-portrait-wrap
            className="relative isolate mx-auto w-full max-w-md lg:col-span-5 lg:mx-0"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-5 -z-10 overflow-hidden rounded-[32px] opacity-35 sm:-inset-8 lg:rounded-[40px]"
            >
              <Image
                src={assets.aboutInk}
                unoptimized={isUnoptimizedCmsImage(assets.aboutInk)}
                alt=""
                fill
                loading="lazy"
                fetchPriority="low"
                quality={60}
                sizes="(min-width: 1024px) 512px, min(100vw, 512px)"
                className="object-cover object-[20%_50%] grayscale"
              />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-night-2 sm:rounded-[36px]">
              <Image
                data-about-intro-portrait
                data-about-portrait
                src={assets.portrait}
                unoptimized={isUnoptimizedCmsImage(assets.portrait)}
                alt={profile.fullName}
                fill
                loading="lazy"
                quality={85}
                sizes="(min-width: 1024px) 448px, min(88vw, 448px)"
                className="object-contain object-bottom"
              />
            </div>
            <p className="absolute -bottom-5 -right-3 rounded-full border border-ink/10 bg-paper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-ink shadow-sm sm:-right-5">
              {profile.name}
            </p>
          </div>
          <div className="lg:col-span-7">
            <p
              data-about-intro-reveal
              data-about-intro-summary
              className="max-w-3xl text-[clamp(1.35rem,2.45vw,2.2rem)] leading-[1.28] tracking-[-0.025em] text-ink"
            >
              {profile.summary}
            </p>
            <dl
              data-about-intro-reveal
              data-about-intro-facts
              className="mt-12 grid border-y border-ink/10 sm:grid-cols-2 lg:mt-16 xl:grid-cols-4"
            >
              {facts.map((fact, index) => (
                <div
                  key={fact.label}
                  className={cn(
                    "py-5 sm:px-4 xl:px-5",
                    index > 0 && "border-t border-ink/10",
                    index === 1 && "sm:border-t-0",
                    index % 2 === 1 && "sm:border-l",
                    index > 0 && "xl:border-l xl:border-t-0",
                  )}
                >
                  <dt className={cn(label, mutedOnLight)}>{fact.label}</dt>
                  <dd className="mt-3 text-sm font-semibold leading-snug text-ink">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
