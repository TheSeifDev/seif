"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  gsap,
  motionQueries,
  ScrollTrigger,
  useGSAP,
} from "@/components/motion/gsap";
import { Flip } from "@/components/motion/flip";
import { EditorialVisual } from "@/components/system/project-media";
import { SectionLabel } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import type { SiteContent, SiteProject } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { isUnoptimizedCmsImage } from "@/components/site/cms-image";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

type Project = SiteProject;
type Domain = "All" | string;
type FlipState = ReturnType<typeof Flip.getState>;

const pad = (value: number) => String(value).padStart(2, "0");
const PREVIEW_GAP = 36;
const EDGE = 16;
const CLOSED = "inset(50% 50% 50% 50% round 18px)";
const OPEN = "inset(0% 0% 0% 0% round 18px)";

function motionAllowed() {
  return window.matchMedia(motionQueries.motion).matches;
}

function RowThumb({ project }: { project: Project }) {
  return (
    <span className="relative block aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg bg-night-3 ring-1 ring-white/10 sm:w-28 lg:[@media(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:hidden">
      {project.image ? (
        <Image
          src={project.image.src}
          unoptimized={isUnoptimizedCmsImage(project.image.src)}
          alt=""
          fill
          loading="lazy"
          quality={85}
          sizes="112px"
          className="object-cover object-top"
        />
      ) : (
        <EditorialVisual
          project={project}
          className="absolute inset-0 aspect-auto [&_p]:hidden"
        />
      )}
    </span>
  );
}

/**
 * 02 Index: every project as one typographic row. Rows stay in the DOM and
 * toggle `display` when filtered so GSAP Flip can animate leaving and entering
 * rows. On fine pointers a floating preview follows the cursor.
 */
export function ProjectsIndex({
  projects,
  content,
}: {
  projects: readonly SiteProject[];
  content: SiteContent;
}) {
  const c = (key: string, fallback: string) =>
    getCopy(content.copy, key, fallback);
  const projectDomains = useMemo(
    () => [
      "All",
      ...Array.from(new Set(projects.flatMap((project) => project.domains))),
    ],
    [projects],
  );
  const [active, setActive] = useState<Domain>("All");
  const listRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<FlipState | null>(null);
  const firstPlacement = useRef(true);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const counts = useMemo(() => {
    const entries = projectDomains.map((domain) => [
      domain,
      domain === "All"
        ? projects.length
        : projects.filter((project) => project.domains.includes(domain)).length,
    ]);
    return Object.fromEntries(entries) as Record<Domain, number>;
  }, [projectDomains, projects]);

  const isShown = (project: Project) =>
    active === "All" || project.domains.includes(active);
  const shownCount = projects.filter(isShown).length;
  const previewProject = previewSlug
    ? projects.find((project) => project.slug === previewSlug)
    : null;

  const select = (domain: Domain) => {
    if (domain === active) return;
    const list = listRef.current;
    if (list && motionAllowed()) {
      flipState.current = Flip.getState(
        list.querySelectorAll("[data-index-row]"),
      );
    }
    setActive(domain);
  };

  /** Moves the pill behind the pressed filter button. */
  const placeIndicator = useCallback((animate: boolean) => {
    const rail = railRef.current;
    const indicator = indicatorRef.current;
    const button = rail?.querySelector<HTMLButtonElement>(
      'button[aria-pressed="true"]',
    );
    if (!indicator || !button) return;
    const box = {
      x: button.offsetLeft,
      y: button.offsetTop,
      width: button.offsetWidth,
      height: button.offsetHeight,
    };
    if (animate && motionAllowed()) {
      gsap.to(indicator, {
        ...box,
        duration: 0.6,
        ease: "expo.out",
        overwrite: true,
      });
    } else {
      gsap.set(indicator, box);
    }
  }, []);

  useLayoutEffect(() => {
    placeIndicator(!firstPlacement.current);
    firstPlacement.current = false;
  }, [active, placeIndicator]);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.dataset.ready = "true";
    const observer = new ResizeObserver(() => placeIndicator(false));
    observer.observe(rail);
    rail
      .querySelectorAll("button")
      .forEach((button) => observer.observe(button));
    return () => {
      observer.disconnect();
      delete rail.dataset.ready;
    };
  }, [placeIndicator]);

  // Filter transition: runs after React has toggled the rows.
  useGSAP(
    () => {
      const state = flipState.current;
      flipState.current = null;
      if (!state) return;
      Flip.from(state, {
        duration: 0.75,
        ease: "expo.inOut",
        absolute: true,
        // The list height changed: re-measure every trigger below it.
        onComplete: () => ScrollTrigger.refresh(),
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { autoAlpha: 0, y: 32 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.05,
              delay: 0.2,
            },
          ),
        onLeave: (elements) =>
          gsap.to(elements, {
            autoAlpha: 0,
            y: -18,
            duration: 0.35,
            ease: "power2.in",
          }),
      });
    },
    { dependencies: [active], scope: listRef },
  );

  // Cursor-following preview (fine pointer + motion only).
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionQueries.finePointer, () => {
      const list = listRef.current;
      const preview = previewRef.current;
      const frame = preview?.querySelector<HTMLElement>("[data-preview-frame]");
      if (!list || !preview || !frame) return;

      gsap.set(preview, { autoAlpha: 1 });
      gsap.set(frame, { clipPath: CLOSED });

      const xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
      const tiltTo = gsap.quickTo(preview, "rotation", {
        duration: 0.5,
        ease: "power3",
      });
      const settle = gsap.delayedCall(0.14, () => tiltTo(0)).pause();

      let open = false;
      let current: string | null = null;
      let lastX = 0;

      const target = (clientX: number, clientY: number) => {
        const width = preview.offsetWidth;
        const height = preview.offsetHeight;
        const x =
          clientX + PREVIEW_GAP + width > window.innerWidth - EDGE
            ? clientX - PREVIEW_GAP - width
            : clientX + PREVIEW_GAP;
        const y = gsap.utils.clamp(
          EDGE,
          window.innerHeight - height - EDGE,
          clientY - height / 2,
        );
        return { x, y };
      };

      const show = (slug: string, clientX: number, clientY: number) => {
        if (!open) {
          const { x, y } = target(clientX, clientY);
          xTo(x, x);
          yTo(y, y);
          lastX = clientX;
          gsap.to(frame, {
            clipPath: OPEN,
            duration: 0.75,
            ease: "expo.out",
            overwrite: "auto",
          });
          open = true;
        }
        if (slug === current) return;
        current = slug;
        setPreviewSlug(slug);
      };

      const hide = () => {
        if (!open) return;
        open = false;
        current = null;
        gsap.to(frame, {
          clipPath: CLOSED,
          duration: 0.5,
          ease: "power3.inOut",
          overwrite: "auto",
        });
        tiltTo(0);
      };

      const onOver = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || !(event.target instanceof Element))
          return;
        const row = event.target.closest<HTMLElement>("[data-preview]");
        if (row?.dataset.preview)
          show(row.dataset.preview, event.clientX, event.clientY);
      };
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || !open) return;
        const { x, y } = target(event.clientX, event.clientY);
        xTo(x);
        yTo(y);
        tiltTo(gsap.utils.clamp(-7, 7, (event.clientX - lastX) * 0.4));
        lastX = event.clientX;
        settle.restart(true);
      };
      const onLeave = () => hide();
      const onKey = () => hide();

      list.addEventListener("pointerover", onOver);
      list.addEventListener("pointermove", onMove);
      list.addEventListener("pointerleave", onLeave);
      list.addEventListener("focusin", onKey);

      return () => {
        list.removeEventListener("pointerover", onOver);
        list.removeEventListener("pointermove", onMove);
        list.removeEventListener("pointerleave", onLeave);
        list.removeEventListener("focusin", onKey);
        settle.kill();
      };
    });
    return () => media.revert();
  });

  return (
    <section
      aria-labelledby="index-title"
      className="relative bg-night pb-24 pt-20 text-snow lg:pb-36 lg:pt-28"
    >
      <div className={container}>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel index="02">
              {c("projects.index.sectionLabel", "Index")}
            </SectionLabel>
            <h2
              id="index-title"
              data-projects-heading
              className="mt-6 font-display text-[clamp(2.25rem,4.2vw,3.75rem)] font-bold leading-none tracking-[-0.035em]"
            >
              <CmsTitle
                text={c("projects.index.title", "Every build, one list.")}
                accent="one list"
              />
            </h2>
          </div>
          <p
            aria-live="polite"
            className={cn(label, "text-mist lg:col-span-4 lg:text-right")}
          >
            <span className="text-snow">{pad(shownCount)}</span> /{" "}
            {pad(projects.length)}{" "}
            {shownCount === 1
              ? c("projects.index.projectSingular", "project")
              : c("projects.index.projectPlural", "projects")}{" "}
            shown
          </p>
        </div>

        <div
          ref={railRef}
          data-filter-rail
          role="group"
          aria-label={c(
            "projects.index.filterAriaLabel",
            "Filter projects by domain",
          )}
          className="group/filters relative -mx-5 mt-10 flex gap-1.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 hidden rounded-full bg-snow group-data-[ready=true]/filters:block"
          />
          {projectDomains.map((domain) => {
            const pressed = domain === active;
            return (
              <button
                key={domain}
                type="button"
                aria-pressed={pressed}
                onClick={() => select(domain)}
                className={cn(
                  "relative z-10 inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky",
                  pressed
                    ? "border-transparent bg-snow text-night group-data-[ready=true]/filters:bg-transparent"
                    : "border-white/12 text-snow/80 hover:border-white/30 hover:text-snow",
                )}
              >
                {domain}
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums",
                    pressed ? "text-night/55" : "text-mist",
                  )}
                >
                  {pad(counts[domain])}
                </span>
              </button>
            );
          })}
        </div>

        <ol
          ref={listRef}
          data-index-list
          className="group/list mt-10 border-b border-white/10 lg:mt-14"
        >
          {projects.map((project, index) => (
            <li
              key={project.slug}
              data-index-row
              data-flip-id={project.slug}
              className={cn(!isShown(project) && "hidden")}
            >
              <div data-row-reveal>
                <Link
                  href={`/projects/${project.slug}`}
                  data-cursor="project"
                  data-preview={project.slug}
                  className="group/row relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 border-t border-white/10 py-6 outline-none transition-opacity duration-500 ease-out-soft focus-visible:bg-white/[0.03] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-6 lg:grid-cols-[4.5rem_minmax(0,1fr)_15rem_4rem_auto] lg:gap-x-8 lg:py-8 [@media(hover:hover)]:group-hover/list:[&:not(:hover)]:opacity-30"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-sky transition-transform duration-700 ease-out-soft group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100"
                  />
                  <span
                    className={cn(
                      label,
                      "flex items-center gap-2 self-start pt-2 text-mist lg:self-center lg:pt-0",
                    )}
                  >
                    {pad(index + 1)}
                    {project.featured ? (
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-sky"
                      />
                    ) : null}
                  </span>

                  <span className="min-w-0">
                    <span className="relative block overflow-hidden">
                      <span className="block font-display text-[clamp(1.75rem,4.2vw,3.75rem)] font-extrabold uppercase leading-[1.05] tracking-[-0.04em] text-snow transition-transform duration-500 ease-out-soft group-hover/row:-translate-y-full group-focus-visible/row:-translate-y-full">
                        {project.title}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-full block font-display text-[clamp(1.75rem,4.2vw,3.75rem)] font-extrabold uppercase leading-[1.05] tracking-[-0.04em] text-sky transition-transform duration-500 ease-out-soft group-hover/row:-translate-y-full group-focus-visible/row:-translate-y-full"
                      >
                        {project.title}
                      </span>
                    </span>
                    <span className="mt-2 block text-sm text-mist lg:hidden">
                      {project.category}
                    </span>
                  </span>

                  <span className="hidden text-sm leading-snug text-mist lg:block">
                    {project.category}
                  </span>
                  <span
                    aria-hidden="true"
                    className="hidden font-jp text-2xl text-snow/25 transition-colors duration-500 group-hover/row:text-sky lg:block"
                  >
                    {project.kanji}
                  </span>

                  <span className="flex items-center gap-4">
                    <RowThumb project={project} />
                    <span
                      aria-hidden="true"
                      className="hidden size-12 shrink-0 place-items-center rounded-full border border-white/15 text-snow transition-[background-color,border-color,color,rotate] duration-500 ease-out-soft group-hover/row:rotate-45 group-hover/row:border-sky group-hover/row:bg-sky group-hover/row:text-night sm:grid"
                    >
                      <ArrowUpRight className="size-5" strokeWidth={1.75} />
                    </span>
                  </span>
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div
        ref={previewRef}
        aria-hidden="true"
        className="pointer-events-none invisible fixed left-0 top-0 z-[70] aspect-[16/10] w-[clamp(300px,27vw,420px)]"
      >
        <div
          data-preview-frame
          className="relative h-full w-full overflow-hidden rounded-[18px] bg-night-3 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.85)] ring-1 ring-white/10"
        >
          {previewProject ? (
            <div
              key={previewProject.slug}
              data-preview-item={previewProject.slug}
              className="absolute inset-0"
            >
              {previewProject.image ? (
                <Image
                  src={previewProject.image.src}
                  unoptimized={isUnoptimizedCmsImage(previewProject.image.src)}
                  alt=""
                  fill
                  loading="lazy"
                  fetchPriority="low"
                  quality={85}
                  sizes="420px"
                  className="object-cover object-top"
                />
              ) : (
                <EditorialVisual
                  project={previewProject}
                  className="absolute inset-0 aspect-auto"
                />
              )}
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-night/90 to-transparent px-4 pb-3 pt-12">
            <span className={cn(label, "text-snow")}>
              {c("projects.detail.viewAllCta", "View case study")}
            </span>
            <ArrowUpRight className="size-4 text-sky" />
          </div>
        </div>
      </div>
    </section>
  );
}
