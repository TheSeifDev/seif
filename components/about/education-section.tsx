import { SectionHeading } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
const pad = (value: number) => String(value).padStart(2, "0");
export function EducationSection({ content }: { content: SiteContent }) {
  const { education, training, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const inProgress = /present/i.test(education.period);
  return (
    <section
      id="education"
      data-about-chapter="education"
      className="relative border-t border-white/[0.06] bg-night text-snow"
      aria-labelledby="education-heading"
    >
      <div className={cn(container, "py-24 lg:py-36")}>
        <SectionHeading
          index="03"
          label={c("about.education.sectionLabel", "Education & training")}
          title={
            <CmsTitle
              text={c(
                "about.education.title",
                "Keep learning. Keep making it useful.",
              )}
              accent="making it useful"
            />
          }
          id="education-heading"
        />
        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <article
            data-edu-card
            data-spotlight
            data-cursor="preview"
            className="group/card relative isolate rounded-[32px] bg-white/[0.07] p-px lg:col-span-7"
            aria-labelledby="education-degree"
          >
            <div className="relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-[31px] bg-night-2 p-7 sm:p-10 lg:min-h-[520px]">
              <span
                aria-hidden="true"
                data-edu-kanji
                className="pointer-events-none absolute -right-4 -top-8 select-none font-jp text-[clamp(13rem,26vw,22rem)] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgb(77_182_255_0.2)] sm:-right-2"
              >
                学
              </span>
              <div className="relative flex items-center justify-between gap-4">
                <p className={cn(label, "text-sky")}>
                  {c("about.education.degreeLabel", "Education")}
                </p>
                {inProgress ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky/25 bg-sky/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-sky">
                    {c("about.education.inProgress", "In progress")}
                  </span>
                ) : null}
              </div>
              <h3
                id="education-degree"
                data-edu-degree
                className="relative mt-auto max-w-xl pt-28 font-display text-[clamp(2.1rem,3.8vw,3.4rem)] font-bold leading-[1] tracking-[-0.04em] text-snow"
              >
                {education.degree}
              </h3>
              <dl className="relative mt-10 grid gap-5 border-t border-white/[0.08] pt-6 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <dt className={cn(label, "text-mist")}>
                    {c("about.education.institutionLabel", "Institution")}
                  </dt>
                  <dd className="mt-2.5 text-[15px] text-snow">
                    {education.institution}
                  </dd>
                </div>
                <div className="sm:text-right">
                  <dt className={cn(label, "text-mist")}>
                    {c("about.education.periodLabel", "Period")}
                  </dt>
                  <dd className="mt-2.5 font-mono text-[13px] text-snow">
                    {education.period}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
          <div className="flex flex-col lg:col-span-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className={cn(label, "text-sky")}>
                {c("about.education.trainingLabel", "Training")}
              </p>
              <span className="font-mono text-[11px] text-mist">
                {pad(
                  training.reduce((sum, group) => sum + group.items.length, 0),
                )}{" "}
                {c("about.education.programmesSuffix", "programmes")}
              </span>
            </div>
            <div className="mt-6 flex-1 border-t border-white/[0.08]">
              {training.map((group) => (
                <section
                  key={group.provider}
                  data-edu-group
                  className="border-b border-white/[0.08] py-7"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-[clamp(1.35rem,1.9vw,1.75rem)] font-bold tracking-[-0.03em] text-snow">
                      {group.provider}
                    </h3>
                    <span className="font-mono text-[11px] text-mist">
                      {pad(group.items.length)}
                    </span>
                  </div>
                  <ul className="mt-4">
                    {group.items.map((item, itemIndex) => (
                      <li
                        key={item}
                        data-edu-row
                        className="group/row relative -mx-3 flex items-center justify-between gap-4 rounded-2xl px-3 py-3.5 text-[15px] text-mist transition-colors duration-300 hover:text-snow"
                      >
                        <span className="relative flex items-center gap-4">
                          <span className="font-mono text-[11px] tracking-[0.12em] text-sky">
                            {pad(itemIndex + 1)}
                          </span>
                          {item}
                        </span>
                        <span
                          aria-hidden="true"
                          className="relative h-px w-4 bg-white/20"
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <p
              className="mt-8 font-jp text-sm tracking-[0.3em] text-mist/80"
              aria-hidden="true"
            >
              学び続ける
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
