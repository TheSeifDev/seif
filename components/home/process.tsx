import { Code2, PenTool, Search, Send } from "lucide-react";
import { processSteps } from "@/lib/content/profile";
import { container, label, lightPanel } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import { Accent, SectionHeading } from "@/components/system/primitives";

const stepIcons = {
  discover: Search,
  design: PenTool,
  build: Code2,
  ship: Send,
} as const;

/**
 * Two arrangements of the same content:
 * - default (no JS, small screens, reduced motion): a vertical path whose
 *   line fills with scroll;
 * - enhanced (`data-enhanced`, set by the `process` scene on wide screens):
 *   a pinned horizontal path that activates one stage at a time.
 */
export function Process() {
  return (
    <Scene
      name="process"
      as="section"
      id="process"
      aria-labelledby="process-title"
      className={cn(lightPanel, "group/process")}
    >
      <div
        data-process-pin
        className="overflow-hidden py-24 lg:py-32 group-data-[enhanced=true]/process:flex group-data-[enhanced=true]/process:h-[100svh] group-data-[enhanced=true]/process:flex-col group-data-[enhanced=true]/process:justify-center group-data-[enhanced=true]/process:py-0"
      >
        <div className={container}>
          <SectionHeading
            tone="light"
            index="07"
            label="My process"
            id="process-title"
            title={
              <>
                From idea <Accent>to impact</Accent>
              </>
            }
            aside="Four stages on one connected path — each hands something concrete to the next."
          />

          {/* Enhanced: pinned horizontal path */}
          <div className="mt-16 hidden group-data-[enhanced=true]/process:block">
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute left-6 right-6 top-6 h-px bg-ink/10"
              >
                <span
                  data-process-fill
                  className="absolute inset-0 origin-left scale-x-0 bg-sky-ink"
                />
              </span>
              <ol className="relative flex justify-between">
                {processSteps.map((step, index) => {
                  const Icon = stepIcons[step.id];
                  return (
                    <li
                      key={step.id}
                      data-process-node
                      data-active={index === 0 ? "" : undefined}
                      className={cn(
                        "group/node flex w-48 flex-col",
                        index === processSteps.length - 1 && "items-end text-right",
                      )}
                    >
                      <span className="inline-flex size-12 items-center justify-center rounded-full border border-ink/15 bg-paper text-slate-ink transition-all duration-500 group-data-active/node:scale-110 group-data-active/node:border-sky-ink group-data-active/node:bg-sky-ink group-data-active/node:text-white group-data-done/node:border-sky-ink group-data-done/node:text-sky-ink">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="mt-5 font-mono text-[11px] tracking-[0.18em] text-slate-ink">
                        {step.index}
                      </span>
                      <span className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-ink/40 transition-colors duration-500 group-data-active/node:text-ink group-data-done/node:text-ink/70">
                        {step.title}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="relative mt-14 h-[300px]">
              {processSteps.map((step, index) => (
                <article
                  key={step.id}
                  data-process-panel
                  data-active={index === 0 ? "" : undefined}
                  aria-labelledby={`process-panel-${step.id}`}
                  className="absolute inset-0 grid translate-y-6 grid-cols-12 gap-8 rounded-[32px] border border-ink/[0.07] bg-white p-10 opacity-0 transition-[opacity,translate] duration-500 ease-out-soft data-active:translate-y-0 data-active:opacity-100"
                >
                  <div className="relative col-span-4 flex flex-col justify-between overflow-hidden">
                    <span className="font-display text-[5.5rem] font-extrabold leading-none tracking-[-0.05em] text-ink">
                      {step.index}
                    </span>
                    <span
                      lang="ja"
                      aria-hidden="true"
                      className="absolute -bottom-6 right-2 font-jp text-[9rem] font-bold leading-none text-sky-ink/[0.12]"
                    >
                      {step.kanji}
                    </span>
                  </div>
                  <div className="col-span-8 flex flex-col">
                    <h3
                      id={`process-panel-${step.id}`}
                      className="font-display text-3xl font-bold tracking-[-0.025em]"
                    >
                      {step.title}
                      <span className="text-sky-ink"> — </span>
                      <span className="font-sans text-xl font-medium tracking-normal text-slate-ink">
                        {step.summary}
                      </span>
                    </h3>
                    <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/80">
                      {step.detail}
                    </p>
                    <ul className="mt-auto flex flex-wrap gap-2 pt-6">
                      {step.outputs.map((output) => (
                        <li
                          key={output}
                          className="rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-[12px] font-medium text-ink/75"
                        >
                          {output}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Default: vertical path */}
          <ol
            data-process-list
            className="relative mt-14 space-y-12 pl-16 group-data-[enhanced=true]/process:hidden sm:pl-20"
          >
            <span
              aria-hidden="true"
              className="absolute bottom-6 left-6 top-6 w-px bg-ink/10 sm:left-7"
            >
              <span
                data-process-vfill
                className="absolute inset-0 origin-top bg-sky-ink motion-reduce:hidden"
              />
            </span>
            {processSteps.map((step) => {
              const Icon = stepIcons[step.id];
              return (
                <li key={step.id} className="relative">
                  <span className="absolute -left-16 top-0 inline-flex size-12 items-center justify-center rounded-full border border-sky-ink/30 bg-paper text-sky-ink sm:-left-[4.5rem] sm:size-14">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className={cn(label, "text-slate-ink")}>
                    {step.index}
                    <span lang="ja" aria-hidden="true" className="ml-3 font-jp tracking-normal">
                      {step.kanji}
                    </span>
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[17px] font-medium text-ink/85">{step.summary}</p>
                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-ink">
                    {step.detail}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {step.outputs.map((output) => (
                      <li
                        key={output}
                        className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[12px] font-medium text-ink/75"
                      >
                        {output}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Scene>
  );
}
