import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DashboardLogin } from "@/components/dashboard";
import { ArticleBody } from "@/components/blog/article-body";
import { requireAdmin } from "@/lib/auth/server";
import { getAdminContent } from "@/lib/cms/repository";
export const dynamic = "force-dynamic";
export default async function ContentPreview({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  try {
    await requireAdmin();
  } catch {
    return <DashboardLogin />;
  }
  const { type, slug } = await params;
  const { content, revision } = await getAdminContent();
  const item =
    type === "blog"
      ? content.posts.find((post) => post.slug === slug)
      : type === "project"
        ? content.projects.find((project) => project.slug === slug)
        : undefined;
  if (!item) notFound();
  return (
    <main
      id="main"
      className="min-h-screen bg-night px-5 py-12 text-snow sm:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between gap-4 border-b border-sky/25 pb-6 text-sm">
          <Link href="/dashboard" className="text-sky">
            ← Back to workspace
          </Link>
          <span className="rounded-full bg-sky/10 px-4 py-2 text-sky">
            Private preview · saved revision {revision}
          </span>
        </div>
        <p className="text-xs uppercase tracking-widest text-mist">
          {item.status} · {type}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
          {item.title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-mist">
          {item.description}
        </p>
        {"body" in item ? (
          <div className="mt-12 rounded-3xl bg-snow p-6 sm:p-10">
            <ArticleBody blocks={item.body} />
          </div>
        ) : (
          <div className="mt-12 space-y-10">
            {item.image && (
              <div className="relative aspect-video overflow-hidden rounded-3xl">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(min-width:1024px) 900px, 95vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <ul className="space-y-4 text-lg">
              {item.highlights.map((highlight, i) => (
                <li key={i} className="border-l-2 border-sky/50 pl-5">
                  {highlight}
                </li>
              ))}
            </ul>
            <p className="text-sky">{item.stack.join(" · ")}</p>
            {item.features?.map((group) => (
              <section key={group.title}>
                <h2 className="text-2xl font-bold">{group.title}</h2>
                <ul className="mt-4 space-y-2 text-mist">
                  {group.items.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        <p className="mt-16 border-t border-white/10 pt-6 text-sm text-mist">
          This preview is private. Changes reach the portfolio only after Save
          draft and Publish revision.
        </p>
      </div>
    </main>
  );
}
