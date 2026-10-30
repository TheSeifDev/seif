import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { assets, identity } from "@/lib/content/profile";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import { SectionLabel, VerticalCaption } from "@/components/system/primitives";
import { IdentityMoon } from "@/components/visuals/identity-moon";

type StatementLine = { readonly text: string; readonly accent?: string };
type Block = (typeof identity.blocks)[number];

/** One masked display line; the inner span is what the timeline unmasks. */
function Line({ line }: { line: StatementLine }) {
  return (
    <span data-identity-line className="block overflow-hidden pb-[0.04em] seq:whitespace-nowrap">
      <span data-identity-line-inner className="block">
        {line.text}
        {line.accent ? <span className="text-sky">{line.accent}</span> : null}
      </span>
    </span>
  );
}

function Half({
  side,
  lines,
  className,
}: {
  side: "a" | "b";
  lines: readonly StatementLine[];
  className?: string;
}) {
  const content: ReactNode[] = [];
  lines.forEach((line, i) => {
    if (i > 0) content.push(" ");
    content.push(<Line key={i} line={line} />);
  });
  return (
    <span data-identity-half={side} className={cn("block", className)}>
      {content}
    </span>
  );
}

function CopyBlock({
  block,
  side,
  className,
}: {
  block: Block;
  side: "a" | "b";
  className?: string;
}) {
  return (
    <div data-identity-copy={side} className={cn("relative z-10 max-w-md", className)}>
      <p className="flex items-center gap-4">
        <span aria-hidden="true" className="font-jp text-[2rem] leading-none text-sky">
          {block.kanji}
        </span>
        <span className={cn(label, "text-mist")}>{block.reading}</span>
      </p>
      <h3 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em] text-snow">
        {block.title}
      </h3>
      <p className="mt-3 text-[15px] leading-[1.75] text-mist">{block.body}</p>
    </div>
  );
}

/**
 * 02 — Identity. Desktop stage: one pinned night stage driven by a single
 * scrubbed timeline (statement → split around the portrait → moon depth →
 * exit into The Journey). Compact, reduced-motion and no-JS visitors get the
 * same content as a readable stacked composition.
 *
 * Geometry literals below (moon host and disc) mirror
 * lib/visuals/identity-moon-config.ts.
 */
export function Identity() {
  const [system, experience] = identity.blocks;

  return (
    <Scene
      name="identity"
      as="section"
      id="identity"
      aria-labelledby="identity-title"
      className="relative bg-night text-snow [--id-copy:min(21rem,calc(50vw-min(80svh,44vw)*0.375-var(--id-pad)-2rem))] [--id-fs:clamp(4rem,8vw,8.5rem)] [--id-pad:max(3rem,4vw)] [--id-top:max(15svh,8.5rem)]"
    >
      <div data-identity-pin className="relative overflow-hidden py-24 lg:py-36 seq:h-svh seq:py-0">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_52%_34%,rgba(77,182,255,0.11),transparent_70%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night to-transparent" />
        </div>

        <div className={cn(container, "relative seq:h-full seq:max-w-none seq:px-(--id-pad)")}>
          <div
            data-identity-kicker
            className="relative z-10 seq:absolute seq:left-(--id-pad) seq:top-[calc(var(--id-top)-2.75rem)]"
          >
            <SectionLabel index="02">{identity.label}</SectionLabel>
          </div>

          <h2
            id="identity-title"
            data-identity-heading
            className="relative z-10 mt-8 font-display text-[clamp(2.25rem,8.6vw,5.5rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.045em] seq:absolute seq:inset-x-(--id-pad) seq:top-(--id-top) seq:bottom-[12svh] seq:mt-0 seq:flex seq:flex-col seq:justify-between seq:text-(length:--id-fs)"
          >
            <Half side="a" lines={identity.statement.a} className="seq:origin-top-left seq:self-start" />{" "}
            <Half
              side="b"
              lines={identity.statement.b}
              className="mt-3 sm:text-right seq:mt-0 seq:origin-bottom-right seq:self-end"
            />
          </h2>

          <div className="mt-14 grid items-center gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8 seq:contents">
            <CopyBlock
              block={system}
              side="a"
              className="lg:col-span-4 seq:absolute seq:left-(--id-pad) seq:top-(--id-top) seq:w-(--id-copy) seq:max-w-none"
            />

            <figure
              data-identity-figure
              aria-hidden="true"
              className="relative order-first mx-auto aspect-[3/4] w-full max-w-[19rem] sm:max-w-[23rem] lg:order-none lg:col-span-4 lg:max-w-none seq:absolute seq:bottom-0 seq:left-1/2 seq:m-0 seq:h-[min(80svh,44vw)] seq:w-[calc(min(80svh,44vw)*0.75)] seq:-translate-x-1/2"
            >
              <div
                data-identity-moon
                className="pointer-events-none absolute left-[53%] top-[17.5%] aspect-square w-[170%] -translate-x-1/2 -translate-y-1/2"
              >
                <IdentityMoon />
              </div>
              <div data-identity-portrait className="absolute inset-0">
                <div data-identity-portrait-img className="absolute inset-0">
                  <Image
                    src={assets.portrait}
                    alt=""
                    fill
                    loading="lazy"
                    quality={85}
                    sizes="(min-width: 1024px) 34vw, min(80vw, 368px)"
                    className="object-contain object-bottom"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-night to-transparent" />
              </div>
            </figure>

            <CopyBlock
              block={experience}
              side="b"
              className="lg:col-span-4 seq:absolute seq:bottom-[12svh] seq:right-(--id-pad) seq:w-(--id-copy) seq:max-w-none"
            />
          </div>

          <div
            data-identity-caption
            className="hidden seq:absolute seq:bottom-[12svh] seq:left-(--id-pad) seq:block"
          >
            <VerticalCaption className="text-snow/55">{identity.caption}</VerticalCaption>
          </div>

          <div
            data-identity-next
            aria-hidden="true"
            className="hidden items-center gap-3 text-mist seq:absolute seq:bottom-10 seq:left-1/2 seq:flex seq:-translate-x-1/2"
          >
            <span className={label}>{identity.next}</span>
            <ArrowDown className="size-4 text-sky" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </Scene>
  );
}
