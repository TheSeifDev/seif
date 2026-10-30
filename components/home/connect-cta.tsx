import Image from "next/image";
import { Clock, Mail, MapPin } from "lucide-react";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { isUnoptimizedCmsImage } from "@/components/site/cms-image";
import { container, display } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import {
  Accent,
  PillLink,
  SectionLabel,
  VerticalCaption,
} from "@/components/system/primitives";

export function ConnectCta({ content }: { content: SiteContent }) {
  const { assets, profile, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const details = [
    {
      icon: Mail,
      label: c("contact.emailLabel", "Email"),
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
    {
      icon: MapPin,
      label: c("contact.locationLabel", "Location"),
      value: profile.location,
    },
    {
      icon: Clock,
      label: c("contact.availabilityLabel", "Availability"),
      value: profile.availability,
    },
  ] as const;
  const text = c("home.connect.title", "Let's build something that matters");
  const accent = c("home.connect.accent", "matters");
  const at = text.indexOf(accent);
  const lines = [
    ...(at < 0
      ? [text]
      : [
          text.slice(0, at).trim(),
          <Accent key="accent">
            {accent}
            {text.slice(at + accent.length)}
          </Accent>,
        ]),
  ];

  return (
    <Scene
      name="connect"
      as="section"
      id="connect"
      aria-labelledby="connect-title"
      className="relative isolate overflow-hidden bg-night"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div data-connect-bg className="absolute inset-x-0 -inset-y-[10%]">
          <Image
            src={assets.contactScene}
            unoptimized={isUnoptimizedCmsImage(assets.contactScene)}
            alt=""
            fill
            loading="lazy"
            fetchPriority="low"
            quality={60}
            sizes="100vw"
            className="object-cover object-[70%_50%]"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#05070a_10%,rgba(5,7,10,0.8)_45%,rgba(5,7,10,0.35)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night to-transparent" />
      </div>

      <div
        className={cn(
          container,
          "relative grid gap-14 py-32 lg:grid-cols-12 lg:items-end lg:py-44",
        )}
      >
        <VerticalCaption className="absolute right-5 top-24 hidden text-snow/50 sm:right-8 lg:right-12 lg:block">
          未来を創る
        </VerticalCaption>
        <div className="lg:col-span-7">
          <SectionLabel index="08">
            {c("home.connect.sectionLabel", "Let&apos;s connect")}
          </SectionLabel>
          <h2 id="connect-title" className={cn(display, "mt-8")}>
            {lines.map((line, index) => (
              <span key={index} className="block overflow-hidden pb-[0.06em]">
                <span data-connect-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-mist">
            {c(
              "home.connect.description",
              "Have a project in mind or just want to say hi? Send a message — it goes straight to me.",
            )}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <PillLink href="/contact">
              {c("home.connect.startConversationCta", "Start a conversation")}
            </PillLink>
            <PillLink
              href={profile.cvUrl}
              external
              variant="outline-dark"
              arrow={false}
            >
              {c("home.connect.downloadCvCta", "Download CV")}
            </PillLink>
          </div>
        </div>

        <ul className="divide-y divide-white/[0.08] overflow-hidden rounded-3xl border border-white/10 bg-night/40 backdrop-blur-md lg:col-span-4 lg:col-start-9">
          {details.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-sky">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-mist">
                    {item.label}
                  </span>
                  <span className="mt-1 block truncate text-[15px] text-snow">
                    {item.value}
                  </span>
                </span>
              </>
            );
            return (
              <li key={item.label}>
                {"href" in item ? (
                  <a
                    href={item.href}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-sky"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex items-center gap-4 p-5">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Scene>
  );
}
