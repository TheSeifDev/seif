import Image from "next/image";
import { Lock, Play } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { cn } from "@/lib/utils";
import type { SiteProject } from "@/lib/cms/schema";
import { isUnoptimizedCmsImage } from "@/components/site/cms-image";

function hostOf(url?: string) {
  if (!url) return undefined;
  try {
    const { host, pathname } = new URL(url);
    return `${host}${pathname === "/" ? "" : pathname}`;
  } catch {
    return undefined;
  }
}
import { PillLink, type Tone } from "./primitives";

/** Browser chrome around a real public-site capture. */
export function BrowserFrame({
  src,
  alt,
  url,
  sizes,
  preload,
  /** @deprecated Use preload for Next 16 compatibility. */
  priority,
  tone = "dark",
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  url?: string;
  sizes: string;
  preload?: boolean;
  priority?: boolean;
  tone?: Tone;
  className?: string;
  imageClassName?: string;
}) {
  const shouldPreload = preload ?? priority;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        tone === "dark"
          ? "border-white/10 bg-night-3"
          : "border-ink/10 bg-white",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-9 items-center gap-1.5 border-b px-4",
          tone === "dark" ? "border-white/[0.08]" : "border-ink/[0.08]",
        )}
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            aria-hidden="true"
            className={cn(
              "size-2 rounded-full",
              tone === "dark" ? "bg-white/15" : "bg-ink/15",
            )}
          />
        ))}
        {url ? (
          <span
            className={cn(
              "ml-3 truncate font-mono text-[11px]",
              tone === "dark" ? "text-mist" : "text-slate-ink",
            )}
          >
            {hostOf(url)}
          </span>
        ) : null}
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={src}
          unoptimized={isUnoptimizedCmsImage(src)}
          alt={alt}
          fill
          sizes={sizes}
          preload={shouldPreload}
          quality={85}
          className={cn("object-cover object-top", imageClassName)}
        />
      </div>
    </div>
  );
}

/** Watch Live / Go to Repo — rendered only for verified URLs. */
export function ProjectActions({
  project,
  tone = "dark",
  size = "sm",
  className,
}: {
  project: SiteProject;
  tone?: Tone;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!project.live && !project.repo) {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-2 text-[13px]",
          tone === "dark" ? "text-mist" : "text-slate-ink",
          className,
        )}
      >
        <Lock className="size-3.5" aria-hidden="true" />
        {project.availability ?? "No public preview"}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {project.live ? (
        <PillLink
          href={project.live.url}
          variant={tone === "dark" ? "accent" : "ink"}
          size={size}
          arrow={false}
          icon={<Play className="size-3.5 fill-current" />}
          aria-label={`Watch ${project.title} live`}
        >
          {project.live.label}
        </PillLink>
      ) : null}
      {project.repo ? (
        <PillLink
          href={project.repo.url}
          variant={tone === "dark" ? "outline-dark" : "outline-light"}
          size={size}
          arrow={false}
          icon={<SiGithub className="size-4" />}
          aria-label={`Open the ${project.title} repository on GitHub`}
          title={project.repo.note}
        >
          {project.repo.label}
        </PillLink>
      ) : null}
    </div>
  );
}

/**
 * Editorial visual for projects without a public preview. It is clearly
 * labelled and never imitates a product screenshot.
 */
export function EditorialVisual({
  project,
  className,
}: {
  project: SiteProject;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex aspect-[16/10] items-center justify-center overflow-hidden bg-[radial-gradient(120%_90%_at_70%_20%,#10233a_0%,#0b0e13_55%,#05070a_100%)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -right-4 -top-6 font-jp text-[9rem] font-bold leading-none text-white/[0.04]"
      >
        {project.kanji}
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 400 120"
        className="relative w-[78%] text-sky"
        fill="none"
      >
        <path
          d="M0 60h120l14-26 18 58 20-84 18 72 12-20h198"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0 60h120l14-26 18 58 20-84 18 72 12-20h198"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.12"
        />
      </svg>
      <p className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
        {project.availability ?? "Editorial visual · preview restricted"}
      </p>
    </div>
  );
}
