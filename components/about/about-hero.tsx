import { PageHero } from "@/components/site/page-hero";
import { Accent, PillLink } from "@/components/system/primitives";
import { profile } from "@/lib/content/profile";

/** Preserve the original image-led About header; the wrapper only scopes GSAP. */
export function AboutHero() {
  return (
    <div data-about-hero data-about-hero-restored>
      <PageHero
        label="About"
        title={<>Engineer of the <Accent>whole product</Accent></>}
        intro={profile.intro}
        japanese="開発・設計・解決"
        aside={
          <div className="flex flex-wrap gap-3">
            <PillLink href={profile.cvUrl} variant="accent">Download CV</PillLink>
            <PillLink href="/contact" variant="outline-dark">Start a conversation</PillLink>
          </div>
        }
      />
    </div>
  );
}
