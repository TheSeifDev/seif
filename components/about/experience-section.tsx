import { SectionHeading } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import { TechnologyIcon } from "@/components/system/technology-icon";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");

type Role = SiteContent["experience"][number];

/**
 * 02 Experience — one chapter per role. Motion hooks (`data-role-*`) are
 * driven by `components/about/about-scenes.ts`; without motion every
 * statement is fully visible.
 */
export function ExperienceSection({ content }: { content: SiteContent }) {
  const { experience, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  return (
    <section
      id="experience"
      data-about-chapter="experience"
      className="relative bg-night pt-24 text-snow lg:pt-36"
      aria-labelledby="experience-heading"
    >
      <div className={container}>
        <SectionHeading
          index="02"
          label={c("about.experience.sectionLabel", "Experience")}
          title={
            <CmsTitle
              text={c(
                "about.experience.title",
                "Ownership from schema to screen.",
              )}
              accent="schema to screen"
            />
          }
          id="experience-heading"
          aside={c(
            "about.experience.aside",
            "Two roles, both grounded in building reliable systems and helping the people around them work better.",
          )}
        />
      </div>

      <div className="mt-14 lg:mt-20">
        {experience.map((role, index) => (
          <RoleChapter
            key={`${role.organization}-${role.role}`}
            role={role}
            index={index}
            total={experience.length}
            copy={copy}
          />
        ))}
      </div>
    </section>
  );
}

function RoleChapter({
  role,
  index,
  total,
  copy,
}: {
  role: Role;
  index: number;
  total: number;
  copy: Record<string, string>;
}) {
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const headingId = `role-${index + 1}-title`;

  return (
    <article
      data-role
      data-role-direction={index % 2 === 0 ? "left" : "right"}
      className="relative border-t border-white/[0.07] pb-24 lg:pb-36"
      aria-labelledby={headingId}
    >
      {/* Oversized outline organisation name — drifts with scroll. */}
      <div
        aria-hidden="true"
        className="pointer-events-none overflow-hidden py-8 lg:py-12"
      >
        <p
          data-role-marquee
          className="whitespace-nowrap font-display text-[clamp(4.5rem,13vw,12.5rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.045em] text-transparent [-webkit-text-stroke:1px_rgb(238_241_245/0.13)]"
        >
          {role.organization}
          <span className="px-[0.25em] text-sky/40 [-webkit-text-stroke:0]">
            /
          </span>
          {role.organization}
        </p>
      </div>

      <div className={cn(container, "grid gap-12 lg:grid-cols-12 lg:gap-10")}>
        <header className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className={cn(label, "flex items-center gap-3 text-mist")}>
              <span className="text-sky">{pad(index + 1)}</span>
              <span aria-hidden="true" className="h-px w-8 bg-white/15" />
              <span>
                {c("about.experience.roleCountLabel", "of")} {pad(total)}
              </span>
            </p>
            <h3
              id={headingId}
              className="mt-7 font-display text-[clamp(1.9rem,3vw,2.75rem)] font-bold leading-[1.02] tracking-[-0.035em] text-snow"
            >
              {role.role}
            </h3>
            <p className="mt-4 text-[15px] font-medium text-sky">
              {role.organization}
            </p>

            <dl className="mt-9 grid grid-cols-2 border-y border-white/[0.08]">
              <div className="py-4 pr-4">
                <dt className={cn(label, "text-mist")}>
                  {c("about.experience.periodLabel", "Period")}
                </dt>
                <dd className="mt-2.5 font-mono text-[13px] text-snow">
                  {role.period}
                </dd>
              </div>
              <div className="border-l border-white/[0.08] py-4 pl-4">
                <dt className={cn(label, "text-mist")}>
                  {c("about.experience.locationLabel", "Location")}
                </dt>
                <dd className="mt-2.5 text-[13px] text-snow">
                  {role.location}
                </dd>
              </div>
            </dl>

            <div
              aria-hidden="true"
              className="mt-8 hidden items-center gap-4 lg:flex"
            >
              <span
                data-role-counter
                className="w-6 font-mono text-[12px] tabular-nums tracking-[0.12em] text-snow"
              >
                01
              </span>
              <span className="relative h-px flex-1 overflow-hidden bg-white/10">
                <span
                  data-role-fill
                  className="absolute inset-0 origin-left bg-sky [transform:scaleX(0)]"
                />
              </span>
              <span className="font-mono text-[12px] tabular-nums tracking-[0.12em] text-mist">
                {pad(role.points.length)}
              </span>
            </div>
          </div>
        </header>

        <div className="lg:col-span-7 xl:col-start-6">
          <ol
            data-role-points
            className="border-t border-white/[0.07] lg:border-t-0"
          >
            {role.points.map((point, pointIndex) => (
              <li
                key={point}
                data-role-point
                className="grid grid-cols-[2.25rem_1fr] gap-4 border-b border-white/[0.07] py-7 lg:grid-cols-[3.25rem_1fr] lg:py-9 lg:first:pt-1"
              >
                <span
                  data-role-point-index
                  className="pt-[0.45em] font-mono text-[12px] tracking-[0.14em] text-sky"
                >
                  {pad(pointIndex + 1)}
                </span>
                <p
                  data-role-point-text
                  className="text-pretty text-[clamp(1.15rem,1.65vw,1.5rem)] leading-[1.45] tracking-[-0.015em] text-snow"
                >
                  {point}
                </p>
              </li>
            ))}
          </ol>

          {role.stack.length > 0 ? (
            <div className="mt-10 lg:pl-[3.25rem]">
              <p className={cn(label, "text-mist")}>
                {c("about.experience.stackLabel", "Working stack")}
              </p>
              <ul data-role-stack className="mt-5 flex flex-wrap gap-2">
                {role.stack.map((item) => (
                  <li
                    key={item}
                    data-role-chip
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3.5 py-2 text-[13px] text-snow/85 transition-colors duration-300 hover:border-sky/40 hover:text-snow"
                  >
                    <span className="text-mist">
                      <TechnologyIcon name={item} size={14} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
