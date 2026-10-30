import { Logo } from "@/components/site/logo";
import { PillLink } from "@/components/system/primitives";
import { createNoIndexMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/cms/server";
import { getCopy } from "@/lib/cms/copy";
export const metadata = createNoIndexMetadata();
export default async function NotFound() {
  const { profile, copy } = await getSiteContent();
  return (
    <main className="flex min-h-dvh flex-col bg-night text-snow">
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-5 py-6 sm:px-8 lg:px-12">
        <Logo withWordmark name={profile.name} subtitle={profile.shortRole} />
        <div className="flex flex-1 items-center py-24">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky">
              {getCopy(copy, "notFound.errorLabel")}
            </p>
            <p className="mt-5 font-display text-[clamp(6rem,22vw,15rem)] font-extrabold leading-[0.78] tracking-[-0.08em] text-snow">
              404
            </p>
            <h1 className="mt-10 max-w-xl font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[0.95] tracking-[-0.04em]">
              {getCopy(copy, "notFound.title")}
            </h1>
            <div className="mt-9 flex flex-wrap gap-3">
              <PillLink href="/" variant="accent">
                {getCopy(copy, "notFound.goHomeCta")}
              </PillLink>
              <PillLink href="/projects" variant="outline-dark">
                {getCopy(copy, "notFound.viewProjectsCta")}
              </PillLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
