import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { PillLink, Tags } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import { container, lightPanel, sectionY } from "@/lib/ui/layout";
import { getCopy } from "@/lib/cms/copy";
import { createCmsPageMetadata, withCmsGraph } from "@/lib/cms/metadata";
import { getSiteContent } from "@/lib/cms/server";
import { createCollectionPageGraph } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return createCmsPageMetadata(
    {
      title: "Blog",
      description: getCopy(
        content.copy,
        "blog.hero.description",
        content.seo.description,
      ),
      path: "/blog",
    },
    content,
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}
export default async function BlogPage() {
  const content = await getSiteContent();
  const c = (key: string, fallback: string) =>
    getCopy(content.copy, key, fallback);
  const publishedPosts = content.posts
    .filter((post) => post.status === "published" && post.publishedAt)
    .sort(
      (a, b) =>
        new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime(),
    );
  return (
    <>
      <JsonLd
        data={withCmsGraph(
          createCollectionPageGraph({
            path: "/blog",
            name: `Blog by ${content.profile.name}`,
            description: c(
              "blog.hero.description",
              "Notes on architecture, interfaces and shipping from this portfolio.",
            ),
            breadcrumbs: [
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
            ],
            items: publishedPosts.map((post) => ({
              name: post.title,
              path: `/blog/${post.slug}`,
            })),
          }),
          content,
        )}
      />
      <PageHero
        label={c("blog.hero.sectionLabel", "Blog")}
        japanese="記事"
        title={
          <CmsTitle
            text={c("blog.hero.title", "Notes on building")}
            accent="building"
          />
        }
        intro={c(
          "blog.hero.description",
          "Writing on architecture, interfaces and the practical decisions that make shipping feel calmer.",
        )}
        image={content.assets.heroBackground}
      />
      <section className={`${lightPanel} ${sectionY}`}>
        <div className={container}>
          {publishedPosts.length > 0 ? (
            <div className="divide-y divide-ink/10">
              {publishedPosts.map((post) => (
                <article
                  key={post.slug}
                  className="group py-8 first:pt-0 last:pb-0 lg:py-10"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="grid gap-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-sky-ink lg:grid-cols-12 lg:gap-8"
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-ink lg:col-span-3 lg:block lg:pt-2">
                      <time dateTime={post.publishedAt}>
                        {formatDate(post.publishedAt!)}
                      </time>
                      <span className="inline-flex items-center gap-1.5 lg:mt-3">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        {post.readingMinutes}{" "}
                        {c("blog.readingMinutes", "min read")}
                      </span>
                    </div>
                    <div className="lg:col-span-7">
                      <h2 className="font-display text-[clamp(1.8rem,3.5vw,3.25rem)] font-bold leading-[1] tracking-[-0.035em] text-ink transition-colors duration-300 group-hover:text-sky-ink">
                        {post.title}
                      </h2>
                      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-slate-ink">
                        {post.description}
                      </p>
                      <Tags items={post.tags} tone="light" className="mt-5" />
                    </div>
                    <span className="hidden items-start justify-end text-sky-ink lg:col-span-2 lg:flex">
                      <ArrowUpRight className="size-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      <span className="sr-only">
                        {c("blog.readArticle", "Read {title}").replace(
                          "{title}",
                          post.title,
                        )}
                      </span>
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl rounded-[28px] border border-ink/10 bg-white px-6 py-14 text-center shadow-[0_24px_48px_-32px_rgba(10,13,18,0.25)] sm:px-12 sm:py-20">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-ink">
                {c("blog.editorialNotes", "Editorial notes")}
              </p>
              <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.04em] text-ink">
                {c("blog.noArticles", "No articles published yet.")}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-slate-ink">
                {c(
                  "blog.draftsReviewing",
                  "Drafts are being reviewed. In the meantime, explore the projects or start a conversation.",
                )}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <PillLink href="/projects" variant="ink">
                  {c("blog.exploreProjectsCta", "Explore projects")}
                </PillLink>
                <PillLink href="/contact" variant="outline-light">
                  {c("blog.contactCta", "Contact Seif")}
                </PillLink>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
