import Image from "next/image";
import { Box, Code2, Layers, UserRound } from "lucide-react";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { isUnoptimizedCmsImage } from "@/components/site/cms-image";
import { display, lightPanel } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import {
  Accent,
  PillLink,
  SectionLabel,
  VerticalCaption,
} from "@/components/system/primitives";

const principleIcons = {
  box: Box,
  code: Code2,
  layers: Layers,
  user: UserRound,
} as const;

export function About({ content }: { content: SiteContent }) {
  const { assets, principles, copy, profile } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const statement = c("home.about.statement", profile.summary);
  const lines = [
    c("home.about.titleLineOne", "I build products"),
    c("home.about.titleLineTwo", "that solve"),
    <Accent key="accent">
      {c("home.about.titleLineThree", "real problems")}
    </Accent>,
  ];

  return (
    <Scene
      name="about"
      as="section"
      id="about"
      data-about=""
      aria-labelledby="about-title"
      className={cn(lightPanel, "z-10 -mt-8 overflow-hidden lg:mt-0")}
    >
      <div className="grid lg:grid-cols-12">
        <div className="relative min-h-[340px] sm:min-h-[440px] lg:col-span-5 lg:min-h-full">
          <div
            data-about-art
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden"
          >
            <div data-about-art-img className="absolute inset-0">
              <Image
                src={assets.aboutInk}
                unoptimized={isUnoptimizedCmsImage(assets.aboutInk)}
                alt=""
                fill
                loading="lazy"
                fetchPriority="low"
                quality={60}
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover object-[12%_60%]"
              />
            </div>
            <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-gradient-to-r from-transparent to-paper lg:block" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent to-paper lg:hidden" />
          </div>
          <VerticalCaption className="absolute bottom-10 left-6 text-ink/70 lg:bottom-16 lg:left-10">
            {c("home.about.verticalCaption", "開発・デザイン・解決・繰り返す")}
          </VerticalCaption>
        </div>

        <div className="px-5 pb-20 pt-6 sm:px-8 lg:col-span-7 lg:py-32 lg:pl-4 lg:pr-12 xl:pr-20">
          <SectionLabel index="01" tone="light">
            {c("home.about.sectionLabel", "About me")}
          </SectionLabel>
          <h2 id="about-title" className={cn(display, "mt-8")}>
            {lines.map((line, index) => (
              <span key={index} className="block overflow-hidden pb-[0.06em]">
                <span data-about-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-12">
            <p
              lang="ja"
              className="font-jp text-base leading-8 tracking-[0.1em] text-ink"
            >
              テクノロジーで、
              <br />
              より良い未来をつくる。
            </p>
            <p
              data-about-statement
              className="text-xl leading-[1.6] text-ink sm:text-[1.375rem]"
            >
              {statement.split(" ").map((word, index) => (
                <span key={index}>
                  <span data-word>{word}</span>{" "}
                </span>
              ))}
            </p>
          </div>

          <ul
            data-about-principles
            className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-ink/[0.08] bg-ink/[0.08] sm:grid-cols-2"
          >
            {principles.map((principle) => {
              const Icon =
                principleIcons[principle.icon as keyof typeof principleIcons] ??
                Box;
              return (
                <li
                  key={principle.title}
                  data-about-principle
                  className="bg-paper p-6 sm:p-7"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sky-ink/10 text-sky-ink">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em]">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-ink">
                    {principle.body}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-10">
            <PillLink href="/about" variant="ink">
              {c("home.about.moreCta", "More about me")}
            </PillLink>
          </div>
        </div>
      </div>
    </Scene>
  );
}
