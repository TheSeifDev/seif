import { SectionHeading } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import { TechnologyIcon } from "@/components/system/technology-icon";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { aboutLightPanel } from "@/lib/ui/about-layout";
import { container, sectionY } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

type Group = SiteContent["skillGroups"][number];

/**
 * 04 Capabilities — every skill group as a row in a typographic index.
 * Motion hooks: `data-cap-*`. Hover fill only applies on hover-capable
 * devices (Tailwind v4 `hover:` is gated by `(hover: hover)`).
 */
export function CapabilitiesSection({ content }: { content: SiteContent }) {
  const { skillGroups, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const half = Math.ceil(skillGroups.length / 2);
  const columns = [skillGroups.slice(0, half), skillGroups.slice(half)];

  return (
    <section
      id="capabilities"
      data-about-chapter="capabilities"
      className={cn(aboutLightPanel, "overflow-hidden")}
      aria-labelledby="capabilities-heading"
    >
      <div className={cn(container, sectionY)}>
        <SectionHeading
          index="04"
          label={c("about.capabilities.sectionLabel", "Capabilities")}
          title={
            <CmsTitle
              text={c(
                "about.capabilities.title",
                "A broad toolkit, organized around product work.",
              )}
              accent="product work"
            />
          }
          tone="light"
          id="capabilities-heading"
          aside={c(
            "about.capabilities.aside",
            "{count} skill groups, transcribed from the CV and kept visible as an index rather than reduced to a badge cloud.",
          ).replace("{count}", String(skillGroups.length))}
        />

        <div className="mt-14 grid gap-x-12 lg:mt-20 lg:grid-cols-2 xl:gap-x-16">
          {columns.map((column, columnIndex) => (
            <ol
              key={columnIndex}
              start={columnIndex * half + 1}
              className={cn(
                "min-w-0 border-b border-ink/10",
                columnIndex === 1 && "max-lg:border-b-0",
              )}
            >
              {column.map((group, rowIndex) => (
                <CapabilityRow
                  key={group.name}
                  group={group}
                  number={columnIndex * half + rowIndex + 1}
                />
              ))}
            </ol>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityRow({ group, number }: { group: Group; number: number }) {
  const id = `capability-${slug(group.name)}`;

  return (
    <li
      data-cap-row
      className="group/cap relative isolate min-w-0 border-t border-ink/10"
    >
      <span
        aria-hidden="true"
        data-cap-line
        className="absolute inset-x-0 -top-px h-px origin-left bg-ink/30 [transform:scaleX(0)]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 origin-bottom scale-y-0 rounded-[20px] bg-ink transition-transform duration-500 ease-out-soft group-hover/cap:scale-y-100"
      />
      <section
        aria-labelledby={id}
        className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3 px-1 py-6 transition-colors duration-500 sm:px-5 lg:py-7"
      >
        <span className="font-mono text-[11px] tracking-[0.14em] text-slate-ink transition-colors duration-500 group-hover/cap:text-sky">
          {pad(number)}
        </span>
        <h3
          id={id}
          className="min-w-0 overflow-hidden break-words font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.035em] text-ink transition-colors duration-500 group-hover/cap:text-snow"
        >
          <span data-cap-name className="block">
            {group.name}
          </span>
        </h3>
        <span className="font-mono text-[11px] tracking-[0.14em] text-slate-ink transition-colors duration-500 group-hover/cap:text-mist">
          {pad(group.skills.length)}
        </span>

        <ul className="col-span-2 col-start-2 mt-4 flex min-w-0 flex-wrap gap-x-5 gap-y-2.5">
          {group.skills.map((skill) => (
            <li
              key={skill}
              data-cap-skill
              className="flex min-w-0 max-w-full items-center gap-2 break-words text-[13px] text-slate-ink transition-colors duration-500 group-hover/cap:text-snow/85"
            >
              <span className="shrink-0 text-slate-ink/70 transition-colors duration-500 group-hover/cap:text-sky">
                <TechnologyIcon name={skill} size={14} />
              </span>
              <span className="min-w-0 break-words">{skill}</span>
            </li>
          ))}
        </ul>
      </section>
    </li>
  );
}
