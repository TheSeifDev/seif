import { Logo } from "@/components/site/logo";
import { PillLink } from "@/components/system/primitives";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata = createNoIndexMetadata();

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-night text-snow">
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-5 py-6 sm:px-8 lg:px-12">
        <Logo withWordmark subtitle="Senior Full Stack Developer" />
        <div className="flex flex-1 items-center py-24">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky">
              Error / 404
            </p>
            <p className="mt-5 font-display text-[clamp(6rem,22vw,15rem)] font-extrabold leading-[0.78] tracking-[-0.08em] text-snow">
              404
            </p>
            <h1 className="mt-10 max-w-xl font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[0.95] tracking-[-0.04em]">
              This page doesn&apos;t exist — or isn&apos;t published yet.
            </h1>
            <div className="mt-9 flex flex-wrap gap-3">
              <PillLink href="/" variant="accent">
                Go home
              </PillLink>
              <PillLink href="/projects" variant="outline-dark">
                View projects
              </PillLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
