import { Accent, SectionHeading } from "@/components/system/primitives";
import { TechnologyIcon } from "@/components/system/technology-icon";
import { skillGroups } from "@/lib/content/skills";
import { container, lightPanel, sectionY } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

type Group = (typeof skillGroups)[number];

/**
 * 04 Capabilities — every skill group as a row in a typographic index.
 * Motion hooks: `data-cap-*`. Hover fill only applies on hover-capable
 * devices (Tailwind v4 `hover:` is gated by `(hover: hover)`).
 */
export function CapabilitiesSection() {
  const half = Math.ceil(skillGroups.length / 2);
  const columns = [skillGroups.slice(0, half), skillGroups.slice(half)];

  return (
    <section
      id="capabilities"
      data-about-chapter="capabilities"
      className={cn(lightPanel, "overflow-hidden")}
      aria-labelledby="capabilities-heading"
    >
      <div className={cn(container, sectionY)}>
        <SectionHeading
          index="04"
          label="Capabilities"
          title={
            <>
              A broad toolkit, organized around <Accent>product work</Accent>.
            </>
          }
          tone="light"
          id="capabilities-heading"
          aside={`${skillGroups.length} skill groups, transcribed from the CV and kept visible as an index rather than reduced to a badge cloud.`}
        />

        <div className="mt-14 grid gap-x-12 lg:mt-20 lg:grid-cols-2 xl:gap-x-16">
          {columns.map((column, columnIndex) => (
            <ol
              key={columnIndex}
              start={columnIndex * half + 1}
              className={cn("border-b border-ink/10", columnIndex === 1 && "max-lg:border-b-0")}
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
    <li data-cap-row className="group/cap relative isolate border-t border-ink/10">
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
        className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 px-1 py-6 transition-colors duration-500 sm:px-5 lg:py-7"
      >
        <span className="font-mono text-[11px] tracking-[0.14em] text-slate-ink transition-colors duration-500 group-hover/cap:text-sky">
          {pad(number)}
        </span>
        <h3
          id={id}
          className="overflow-hidden font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.035em] text-ink transition-colors duration-500 group-hover/cap:text-snow"
        >
          <span data-cap-name className="block">
            {group.name}
          </span>
        </h3>
        <span className="font-mono text-[11px] tracking-[0.14em] text-slate-ink transition-colors duration-500 group-hover/cap:text-mist">
          {pad(group.skills.length)}
        </span>

        <ul className="col-span-2 col-start-2 mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
          {group.skills.map((skill) => (
            <li
              key={skill}
              data-cap-skill
              className="flex items-center gap-2 text-[13px] text-slate-ink transition-colors duration-500 group-hover/cap:text-snow/85"
            >
              <span className="text-slate-ink/70 transition-colors duration-500 group-hover/cap:text-sky">
                <TechnologyIcon name={skill} size={14} />
              </span>
              {skill}
            </li>
          ))}
        </ul>
      </section>
    </li>
  );
}
