import { processSteps } from "@/lib/content/profile";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import { Accent, SectionHeading } from "@/components/system/primitives";

function Outputs({ items }: { items: readonly string[] }) {
  return (
    <div className="mt-7 border-t border-white/10 pt-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">What moves forward</p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px] leading-relaxed text-snow/85">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

/** One reading stage and a restrained numbered path; compact visitors see all steps. */
export function Process() {
  return (
    <Scene name="process" as="section" id="process" aria-labelledby="process-title" className="group/process relative border-t border-white/10 bg-night text-snow">
      <div data-process-pin className="overflow-hidden py-24 lg:py-32 group-data-[enhanced=true]/process:flex group-data-[enhanced=true]/process:h-svh group-data-[enhanced=true]/process:flex-col group-data-[enhanced=true]/process:justify-center group-data-[enhanced=true]/process:pb-8 group-data-[enhanced=true]/process:pt-28">
        <div className={container}>
          <SectionHeading index="07" label="My process" id="process-title" title={<>Intent to <Accent>execution.</Accent></>} aside="Discover. Design. Build. Ship. One connected practice, with a clear handoff at every stage." />

          <div className="mt-12 hidden group-data-[enhanced=true]/process:block short:mt-8">
            <ol className="relative grid grid-cols-4 gap-4 border-b border-white/15 pb-6">
              <li aria-hidden="true" className="pointer-events-none absolute -bottom-px inset-x-0 h-px">
                <span data-process-fill className="absolute inset-0 origin-left scale-x-0 bg-sky" />
              </li>
              {processSteps.map((step, index) => (
                <li key={step.id} data-process-node data-active={index === 0 ? "" : undefined} className="group/node relative min-w-0">
                  <p className="font-mono text-[11px] tracking-[0.15em] text-mist transition-colors duration-300 group-data-active/node:text-sky group-data-done/node:text-sky/80">{step.index}</p>
                  <p className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] text-mist transition-colors duration-300 group-data-active/node:text-snow group-data-done/node:text-snow/75">{step.title}</p>
                  <span aria-hidden="true" className="absolute -bottom-[27px] left-0 h-[5px] w-5 rounded-full bg-sky opacity-0 transition-opacity duration-300 group-data-active/node:opacity-100" />
                </li>
              ))}
            </ol>
            <div className="relative mt-10 h-[340px] short:mt-7 short:h-[290px]">
              {processSteps.map((step, index) => (
                <article key={step.id} data-process-panel data-active={index === 0 ? "" : undefined} aria-labelledby={`process-panel-${step.id}`} className="absolute inset-0 grid translate-y-3 grid-cols-12 gap-10 opacity-0 transition-[opacity,translate] duration-400 ease-out-soft data-active:translate-y-0 data-active:opacity-100">
                  <div aria-hidden="true" className="col-span-4 flex items-start gap-7 overflow-hidden">
                    <span className="font-display text-[clamp(6.5rem,12vw,10rem)] font-extrabold leading-[0.85] tracking-[-0.07em] text-snow">{step.index}</span>
                    <span lang="ja" className="mt-1 font-jp text-4xl leading-none text-sky/60">{step.kanji}</span>
                  </div>
                  <div className="col-span-8 max-w-[44rem]">
                    <h3 id={`process-panel-${step.id}`} className="font-display text-[clamp(2.75rem,4.4vw,4.5rem)] font-bold leading-none tracking-[-0.045em]">{step.title}</h3>
                    <p className="mt-4 max-w-xl text-xl leading-snug text-snow/90">{step.summary}</p>
                    <p className="mt-4 max-w-xl text-[15px] leading-[1.8] text-mist">{step.detail}</p>
                    <Outputs items={step.outputs} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <ol data-process-list className="relative mt-14 space-y-12 pl-10 group-data-[enhanced=true]/process:hidden sm:pl-14">
            <li aria-hidden="true" className="absolute bottom-0 left-0 top-1 w-px bg-white/12">
              <span data-process-vfill className="absolute inset-0 origin-top bg-sky motion-reduce:scale-y-100" />
            </li>
            {processSteps.map((step, index) => (
              <li key={step.id} data-process-compact-step data-active={index === 0 ? "" : undefined} className="group/step relative border-b border-white/10 pb-10 last:border-0 last:pb-0">
                <span aria-hidden="true" className="absolute -left-[43px] top-1.5 size-[7px] rounded-full bg-mist transition-colors duration-300 group-data-active/step:bg-sky sm:-left-[59px]" />
                <p className={cn(label, "text-mist")}><span className="text-sky">{step.index}</span><span lang="ja" aria-hidden="true" className="ml-4 font-jp text-base tracking-normal">{step.kanji}</span></p>
                <h3 className="mt-4 font-display text-4xl font-bold leading-none tracking-[-0.035em]">{step.title}</h3>
                <p className="mt-4 max-w-xl text-lg leading-snug text-snow/90">{step.summary}</p>
                <p className="mt-4 max-w-xl text-[15px] leading-[1.8] text-mist">{step.detail}</p>
                <Outputs items={step.outputs} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Scene>
  );
}
