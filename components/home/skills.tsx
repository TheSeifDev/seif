import { marqueeRows, skillGroups } from "@/lib/content/skills";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Accent, SectionHeading } from "@/components/system/primitives";
import { SkillsMarquee } from "./skills-marquee";

export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="relative border-t border-white/[0.06] bg-night py-24 lg:py-36"
    >
      <div className={container}>
        <SectionHeading
          index="05"
          label="Skills & technologies"
          id="skills-title"
          title={
            <>
              Tools I <Accent>work with</Accent>
            </>
          }
          aside="Ordered by layer — what people touch, what keeps it running, and where it ships."
        />
      </div>

      <div className="mt-12">
        <SkillsMarquee rows={marqueeRows} />
      </div>

      <div className={cn(container, "mt-24")}>
        <div className="flex items-center gap-4 border-b border-white/[0.08] pb-5">
          <h3 className={cn(label, "text-snow")}>Full index</h3>
          <span className="font-mono text-[11px] text-mist">
            {skillGroups.length} groups ·{" "}
            {skillGroups.reduce((sum, group) => sum + group.skills.length, 0)} entries
          </span>
        </div>
        <dl className="grid gap-x-10 gap-y-10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group) => (
            <div key={group.name}>
              <dt className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold text-snow">
                  {group.name}
                </span>
                <span className="font-mono text-[11px] text-mist">
                  {String(group.skills.length).padStart(2, "0")}
                </span>
              </dt>
              <dd className="mt-3 text-[14px] leading-7 text-mist">
                {group.skills.join(" · ")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
