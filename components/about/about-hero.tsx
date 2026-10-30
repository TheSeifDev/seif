import { PageHero } from "@/components/site/page-hero";
import { Accent, PillLink } from "@/components/system/primitives";
import type { SiteContent } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
export function AboutHero({ content }: { content: SiteContent }) {
  const { profile, assets, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const text = c("about.hero.title", "Engineer of the whole product");
  const accent = c("about.hero.accent", "whole product");
  const at = text.indexOf(accent);
  const title =
    at < 0 ? (
      text
    ) : (
      <>
        {text.slice(0, at)}
        <Accent>{accent}</Accent>
        {text.slice(at + accent.length)}
      </>
    );
  return (
    <div data-about-hero data-about-hero-restored>
      <PageHero
        label={c("about.hero.sectionLabel", "About")}
        title={title}
        intro={profile.intro}
        japanese={c("about.hero.japaneseCaption", "開発・設計・解決")}
        image={assets.heroBackground}
        aside={
          <div className="flex flex-wrap gap-3">
            <PillLink href={profile.cvUrl} variant="accent">
              {c("about.hero.downloadCvCta", "Download CV")}
            </PillLink>
            <PillLink href="/contact" variant="outline-dark">
              {c("about.hero.startConversationCta", "Start a conversation")}
            </PillLink>
          </div>
        }
      />
    </div>
  );
}
