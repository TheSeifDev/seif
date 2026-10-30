import { SectionHeading } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import type { FaqItem } from "@/lib/seo/structured-data";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { aboutLightPanel } from "@/lib/ui/about-layout";
import { container, sectionY } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
export function AboutFaqSection({
  items,
  content,
}: {
  items: readonly FaqItem[];
  content: SiteContent;
}) {
  const c = (key: string, fallback: string) =>
    getCopy(content.copy, key, fallback);
  return (
    <section
      id="about-faq"
      className={cn(aboutLightPanel, "mb-12 overflow-hidden lg:mb-20")}
      aria-labelledby="about-faq-heading"
    >
      <div className={cn(container, sectionY)}>
        <SectionHeading
          index="FAQ"
          label={c("about.faq.sectionLabel", "A few useful answers")}
          title={
            <CmsTitle
              text={c("about.faq.title", "About the work")}
              accent="work"
            />
          }
          tone="light"
          id="about-faq-heading"
        />
        <div className="mt-14 border-y border-ink/10 lg:mt-20">
          {items.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group/faq relative border-t border-ink/10 first:border-t-0"
            >
              <summary
                className={cn(
                  "grid cursor-pointer list-none grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-3 px-1 py-6 text-left sm:gap-x-5 sm:px-5 lg:py-7",
                  "transition-colors duration-300 hover:text-sky-ink",
                  "[&::-webkit-details-marker]:hidden",
                )}
              >
                <span
                  aria-hidden="true"
                  className="pt-1 font-mono text-[11px] tracking-[0.14em] text-slate-ink"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 break-words font-display text-[clamp(1.45rem,2.6vw,2.35rem)] font-bold leading-[1.08] tracking-[-0.035em] text-ink">
                  {item.question}
                </span>
                <span className="flex items-center gap-2 pt-0.5 text-slate-ink">
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] sm:inline group-open/faq:hidden">
                    {c("about.faq.open", "Open")}
                  </span>
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] group-open/faq:inline">
                    {c("about.faq.close", "Close")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative grid size-8 shrink-0 place-items-center rounded-full border border-current/25"
                  >
                    <span className="relative block size-3">
                      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open/faq:scale-y-0" />
                    </span>
                  </span>
                </span>
              </summary>
              <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-3 px-1 pb-7 sm:gap-x-5 sm:px-5 lg:pb-8">
                <p className="col-start-2 min-w-0 max-w-3xl border-l border-sky-ink/35 pl-4 text-[15px] leading-relaxed text-slate-ink sm:pl-6">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
