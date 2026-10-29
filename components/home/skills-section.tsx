"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { marqueeRows, skillGroups } from "@/lib/content/skills";
import { lightFrame, lightShell } from "@/lib/ui/layout";
import { SectionHeading, SectionLabel } from "./primitives";
import { TechnologyIcon } from "./technology-icons";

gsap.registerPlugin(ScrollTrigger);

const DURATION_MIN = 40;
const DURATION_MAX = 65;
const PIXELS_PER_SECOND = 31;

type TimelineHandle = gsap.core.Timeline;

function SkillSegment({
  items,
  duplicate = false,
}: {
  items: readonly string[];
  duplicate?: boolean;
}) {
  return (
    <ul
      className={`skills-marquee-segment flex shrink-0 items-center gap-8 pr-8 motion-reduce:w-full motion-reduce:min-w-0 motion-reduce:flex-wrap${duplicate ? " is-duplicate motion-reduce:hidden" : ""}`}
      data-original-segment={!duplicate ? "true" : undefined}
      aria-hidden={duplicate ? "true" : undefined}
      role="list"
    >
      {items.map((skill) => (
        <li
          className="skills-marquee-item inline-flex min-h-[55px] shrink-0 items-center gap-[9px] border-r border-identity/10 pr-[19px] text-[12px] text-identity-ink last:border-r-0 sm:min-h-[62px]"
          key={`${duplicate ? "copy-" : ""}${skill}`}
        >
          <span className="shrink-0 text-identity-ink">
            <TechnologyIcon name={skill} size={20} />
          </span>
          <span className="whitespace-nowrap">{skill}</span>
        </li>
      ))}
    </ul>
  );
}

function SkillsMarquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  const motionRegionRef = useRef<HTMLDivElement>(null);
  const manualPausedRef = useRef(false);
  const syncPlaybackRef = useRef<(() => void) | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const motionRegion = motionRegionRef.current;
    if (!root || !motionRegion) return;

    const tracks = Array.from(
      root.querySelectorAll<HTMLElement>("[data-skills-track]"),
    );
    const matchMedia = gsap.matchMedia();

    const setup = (reducedMotion: boolean) => {
      setIsReducedMotion(reducedMotion);
      root.dataset.motion = reducedMotion ? "static" : "animated";

      let timelines: TimelineHandle[] = [];
      let isVisible = reducedMotion;
      let interactionPaused = false;
      let resizeObserver: ResizeObserver | undefined;
      let visibilityObserver: IntersectionObserver | undefined;
      const context = gsap.context(() => undefined, root);

      const syncPlayback = () => {
        const shouldPause =
          reducedMotion ||
          manualPausedRef.current ||
          interactionPaused ||
          !isVisible;

        timelines.forEach((timeline) => {
          if (shouldPause) timeline.pause();
          else timeline.play();
        });
      };
      syncPlaybackRef.current = syncPlayback;

      const rebuild = () => {
        const progressByTrack = tracks.map(
          (_, index) => timelines[index]?.progress() ?? 0,
        );
        timelines.forEach((timeline) => timeline.kill());
        timelines = [];
        if (reducedMotion) return;

        context.add(() => {
          tracks.forEach((track, index) => {
            const segment = track.querySelector<HTMLElement>(
              '[data-original-segment="true"]',
            );
            const width = segment?.getBoundingClientRect().width ?? 0;
            if (!width) return;

            const movesLeft = index % 2 === 0;
            const startX = movesLeft ? 0 : -width;
            const endX = movesLeft ? -width : 0;
            const duration = Math.min(
              DURATION_MAX,
              Math.max(DURATION_MIN, width / PIXELS_PER_SECOND),
            );
            const timeline = gsap.timeline({ paused: true, repeat: -1 });

            gsap.set(track, { x: startX });
            timeline.to(track, {
              x: endX,
              duration,
              ease: "none",
            });
            timeline.progress(progressByTrack[index] ?? 0);
            timelines.push(timeline);
          });
        });

        syncPlayback();
      };

      if (!reducedMotion) {
        isVisible = false;
        resizeObserver = new ResizeObserver(rebuild);
        tracks.forEach((track) => {
          const segment = track.querySelector<HTMLElement>(
            '[data-original-segment="true"]',
          );
          if (segment) resizeObserver?.observe(segment);
        });

        if ("IntersectionObserver" in window) {
          visibilityObserver = new IntersectionObserver(
            ([entry]) => {
              isVisible = entry?.isIntersecting ?? false;
              syncPlayback();
            },
            { threshold: 0.05 },
          );
          visibilityObserver.observe(root);
        } else {
          isVisible = true;
        }

        const pauseForInteraction = () => {
          interactionPaused = true;
          syncPlayback();
        };
        const resumeAfterInteraction = () => {
          interactionPaused = false;
          syncPlayback();
        };
        const resumeAfterFocus = (event: FocusEvent) => {
          const nextTarget = event.relatedTarget;
          if (
            !(nextTarget instanceof Node) ||
            !motionRegion.contains(nextTarget)
          ) {
            resumeAfterInteraction();
          }
        };

        motionRegion.addEventListener("pointerenter", pauseForInteraction);
        motionRegion.addEventListener("pointerleave", resumeAfterInteraction);
        motionRegion.addEventListener("focusin", pauseForInteraction);
        motionRegion.addEventListener("focusout", resumeAfterFocus);

        rebuild();

        return () => {
          motionRegion.removeEventListener("pointerenter", pauseForInteraction);
          motionRegion.removeEventListener(
            "pointerleave",
            resumeAfterInteraction,
          );
          motionRegion.removeEventListener("focusin", pauseForInteraction);
          motionRegion.removeEventListener("focusout", resumeAfterFocus);
          resizeObserver?.disconnect();
          visibilityObserver?.disconnect();
          timelines.forEach((timeline) => timeline.kill());
          timelines = [];
          context.revert();
          if (syncPlaybackRef.current === syncPlayback) {
            syncPlaybackRef.current = null;
          }
        };
      }

      return () => {
        context.revert();
        if (syncPlaybackRef.current === syncPlayback) {
          syncPlaybackRef.current = null;
        }
      };
    };

    matchMedia.add("(prefers-reduced-motion: reduce)", () => setup(true));
    matchMedia.add("(prefers-reduced-motion: no-preference)", () =>
      setup(false),
    );

    return () => {
      matchMedia.revert();
      syncPlaybackRef.current = null;
    };
  }, []);

  const togglePaused = () => {
    manualPausedRef.current = !manualPausedRef.current;
    setIsPaused(manualPausedRef.current);
    syncPlaybackRef.current?.();
  };

  return (
    <div className="skills-marquee relative min-w-0" ref={rootRef}>
      <div className="skills-marquee-toolbar mb-[15px] flex items-center justify-between gap-5 border-t border-identity/15 pt-3">
        <p className="m-0 max-w-[430px] text-[11px] leading-[1.55] text-[#657077]">
          Selected tools, arranged by practice rather than rank.
        </p>
        <button
          className="skills-motion-toggle shrink-0 rounded-full border border-identity/25 bg-transparent px-3 py-2 font-mono text-[9px] uppercase tracking-[0.8px] text-identity-ink transition-colors duration-200 ease-in-out hover:border-identity-ink hover:bg-identity-bright/10 hover:text-identity-ink focus-visible:border-identity-ink focus-visible:bg-identity-bright/10 focus-visible:text-identity-ink focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          aria-label={
            isPaused
              ? "Resume skills marquee animation"
              : "Pause skills marquee animation"
          }
          aria-pressed={isPaused}
          disabled={isReducedMotion}
          onClick={togglePaused}
        >
          {isPaused ? "Resume animation" : "Pause animation"}
        </button>
      </div>
      <div
        className="skills-marquee-rows grid min-w-0 gap-0"
        ref={motionRegionRef}
        aria-label="Selected technologies"
      >
        {marqueeRows.map((row, index) => (
          <div
            className={`skills-marquee-row grid min-w-0 grid-cols-[39px_minmax(0,1fr)] items-stretch border-b border-identity/15 sm:grid-cols-[54px_minmax(0,1fr)]${index === 0 ? " border-t" : ""}`}
            key={row.label}
          >
            <span className="skills-row-label flex items-center border-r border-identity/15 text-[9px] tracking-[1px] text-identity-ink [writing-mode:vertical-rl] [transform:rotate(180deg)]">
              {row.label}
            </span>
            <div className="skills-marquee-viewport min-w-0 overflow-hidden motion-reduce:overflow-visible">
              <div
                className="skills-marquee-track flex w-max flex-nowrap will-change-transform motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:!transform-none"
                data-direction={index % 2 === 0 ? "left" : "right"}
                data-skills-track
              >
                <SkillSegment items={row.items} />
                <SkillSegment items={row.items} duplicate />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkillsSection() {
  return (
    <section
      id="skills"
      className={`light-section skills-section ${lightShell}`}
      aria-label="Skills and technologies"
    >
      <div className={lightFrame}>
        <SectionLabel number="05" tone="light">
          SKILLS &amp; TECHNOLOGIES
        </SectionLabel>
        <div className="mb-[34px]">
          <SectionHeading
            tone="light"
            note={
              <>
                A working vocabulary across product, platform, and practice.
                <br />
                Not a proficiency ranking.
              </>
            }
          >
            The tools behind the{" "}
            <span className="accent text-identity-ink">thinking.</span>
          </SectionHeading>
        </div>

        <SkillsMarquee />

        <div className="skills-summary mt-12 grid gap-6 border-t border-identity/20 pt-[17px] lg:grid-cols-[minmax(160px,0.6fr)_minmax(0,2fr)] lg:gap-8">
          <div className="skills-summary-intro flex flex-col gap-[14px]">
            <span className="skills-summary-kicker font-mono text-[9px] tracking-[1.1px] text-identity-ink">
              THE FULL INDEX
            </span>
            <p className="m-0 max-w-[430px] text-[11px] leading-[1.55] text-[#657077] lg:max-w-none">
              A broader view of the systems, tools, and ways of working behind
              the selected stack.
            </p>
          </div>
          <dl className="skills-groups m-0 grid grid-cols-1 border-t border-identity/10 md:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div
                className="skills-group min-w-0 border-b border-identity/10 py-[14px] pr-[17px] text-[11px] md:[&:nth-child(even)]:border-l md:[&:nth-child(even)]:pl-[17px] lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+1)]:pl-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:pl-[17px]"
                key={group.name}
              >
                <dt className="mb-[7px] text-[12px] font-semibold text-identity-ink">
                  {group.name}
                </dt>
                <dd className="m-0 break-words leading-[1.65] text-[#657077]">
                  {group.skills.join(", ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
