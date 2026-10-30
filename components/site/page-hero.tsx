import Image from "next/image";
import type { ReactNode } from "react";
import { isUnoptimizedCmsImage } from "./cms-image";
import { container, display } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { SectionLabel, VerticalCaption } from "@/components/system/primitives";

export function PageHero({
  label,
  title,
  intro,
  aside,
  japanese,
  image,
  children,
}: {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  japanese?: string;
  image?: string | null;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-night pb-16 pt-36 text-snow sm:pt-40 lg:pb-24 lg:pt-48">
      {image ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image
            src={image}
            unoptimized={isUnoptimizedCmsImage(image)}
            alt=""
            fill
            loading="lazy"
            fetchPriority="low"
            quality={60}
            sizes="100vw"
            className="object-cover object-[70%_40%] opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#05070a_15%,rgba(5,7,10,0.75)_55%,rgba(5,7,10,0.35)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
        </div>
      ) : null}
      <div className={cn(container, "relative")}>
        {japanese ? (
          <VerticalCaption className="absolute right-5 top-0 hidden text-snow/40 sm:right-8 lg:right-12 lg:block">
            {japanese}
          </VerticalCaption>
        ) : null}
        <SectionLabel>{label}</SectionLabel>
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h1 className={cn(display, "text-balance lg:col-span-8")}>{title}</h1>
          {intro || aside ? (
            <div className="space-y-6 lg:col-span-4 lg:pb-2">
              {intro ? (
                <div className="text-[17px] leading-relaxed text-mist">
                  {intro}
                </div>
              ) : null}
              {aside}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
