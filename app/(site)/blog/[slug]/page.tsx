import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/blog/article-body";
import { Tags } from "@/components/system/primitives";
import { getPublishedPost, getPublishedPosts } from "@/lib/content/blog";
import { container, lightPanel } from "@/lib/ui/layout";

type BlogArticleProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Cache Components requires at least one prerendered param. While every
 * article is still a private draft, a reserved sentinel slug is prerendered
 * instead; it never matches a post, so it renders the 404 page and leaks
 * nothing about the drafts.
 */
const NO_PUBLISHED_POSTS = "__no-published-posts";

export function generateStaticParams() {
  const params = getPublishedPosts().map((post) => ({ slug: post.slug }));
  return params.length > 0 ? params : [{ slug: NO_PUBLISHED_POSTS }];
}

export async function generateMetadata(
  props: BlogArticleProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPublishedPost(slug);

  if (!post) {
    return { title: "Not found", robots: { index: false } };
  }

  return {
    title: post.title,
    description: post.description,
    robots: { index: true, follow: true },
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function BlogArticlePage(
  props: BlogArticleProps,
) {
  const { slug } = await props.params;
  const post = getPublishedPost(slug);

  if (!post || !post.publishedAt) {
    notFound();
  }

  return (
    <>
      <header className="bg-night pb-16 pt-32 text-snow sm:pt-40 lg:pb-24 lg:pt-48">
        <div className={container}>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mist transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to blog
          </Link>
          <div className="mt-12 max-w-4xl">
            <Tags items={post.tags} tone="dark" />
            <h1 className="mt-7 max-w-4xl font-display text-[clamp(2.75rem,7vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em] text-balance">
              {post.title}
            </h1>
            <p className="mt-7 max-w-2xl text-[18px] leading-relaxed text-mist sm:text-xl">
              {post.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-[11px] uppercase tracking-[0.16em] text-mist">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {post.readingMinutes} min read
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className={`${lightPanel} px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32`}>
        <ArticleBody blocks={post.body} />
      </section>
    </>
  );
}
