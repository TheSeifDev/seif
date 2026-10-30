import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { Accent, PillLink, Tags } from "@/components/system/primitives";
import { getPublishedPosts } from "@/lib/content/blog";
import { container, lightPanel, sectionY } from "@/lib/ui/layout";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createCollectionPageGraph } from "@/lib/seo/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "Blog",
  description:
    "Notes on architecture, interfaces and shipping from Seif Ayman.",
  path: "/blog",
  keywords: ["Seif Ayman blog", "software architecture", "full stack development", "Next.js"],
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function BlogPage() {
  const publishedPosts = getPublishedPosts();

  return (
    <>
      <JsonLd
        data={createCollectionPageGraph({
          path: "/blog",
          name: "Blog by Seif Ayman",
          description: "Notes on architecture, interfaces and shipping from Seif Ayman.",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ],
        })}
      />
      <PageHero
        label="Blog"
        japanese="記事"
        title={
          <>
            Notes on <Accent>building</Accent>
          </>
        }
        intro="Writing on architecture, interfaces and the practical decisions that make shipping feel calmer."
      />

      <section className={`${lightPanel} ${sectionY}`}>
        <div className={container}>
          {publishedPosts.length > 0 ? (
            <div className="divide-y divide-ink/10">
              {publishedPosts.map((post) => (
                <article key={post.slug} className="group py-8 first:pt-0 last:pb-0 lg:py-10">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="grid gap-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-sky-ink lg:grid-cols-12 lg:gap-8"
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-ink lg:col-span-3 lg:block lg:pt-2">
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                      <span className="inline-flex items-center gap-1.5 lg:mt-3">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        {post.readingMinutes} min read
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
                      <ArrowUpRight className="size-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
                      <span className="sr-only">Read {post.title}</span>
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl rounded-[28px] border border-ink/10 bg-white px-6 py-14 text-center shadow-[0_24px_48px_-32px_rgba(10,13,18,0.25)] sm:px-12 sm:py-20">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-ink">
                Editorial notes
              </p>
              <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.04em] text-ink">
                No articles published yet.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-slate-ink">
                Drafts are being reviewed. In the meantime, explore the projects or start a conversation.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <PillLink href="/projects" variant="ink">
                  Explore projects
                </PillLink>
                <PillLink href="/contact" variant="outline-light">
                  Contact Seif
                </PillLink>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
