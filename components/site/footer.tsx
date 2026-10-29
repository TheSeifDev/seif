import Link from "next/link";
import { cacheLife } from "next/cache";
import { ArrowUp, ArrowUpRight, FileText, Mail } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { navigation, profile } from "@/lib/content/profile";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const elsewhere = [
  {
    href: profile.githubUrl,
    label: "GitHub",
    detail: profile.handle,
    icon: SiGithub,
    external: true,
  },
  {
    href: `mailto:${profile.email}`,
    label: "Email",
    detail: profile.email,
    icon: Mail,
    external: false,
  },
  {
    href: profile.cvUrl,
    label: "Download CV",
    detail: "PDF",
    icon: FileText,
    external: true,
  },
] as const;

/** Cached so prerendering stays deterministic under Cache Components. */
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-night text-snow">
      <div className={cn(container, "pb-10 pt-20 lg:pt-24")}>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo withWordmark subtitle={profile.shortRole} />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-mist">
              Production web, desktop and AI products — owned from the database
              schema to the last detail of the interface.
            </p>
            <p
              lang="ja"
              className="mt-6 font-jp text-sm tracking-[0.12em] text-snow/70"
            >
              {profile.japaneseMotto}
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-3">
            <p className={cn(label, "text-mist")}>Pages</p>
            <ul className="mt-6 grid grid-cols-2 gap-y-3 lg:grid-cols-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-snow/85 transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-sky"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <p className={cn(label, "text-mist")}>Elsewhere</p>
            <ul className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {elsewhere.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...(item.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="group flex items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-sky"
                    >
                      <Icon
                        className="size-4 text-mist transition-colors group-hover:text-sky"
                        aria-hidden="true"
                      />
                      <span className="text-[15px] font-medium">
                        {item.label}
                      </span>
                      <span className="ml-auto truncate text-[13px] text-mist">
                        {item.detail}
                      </span>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-mist transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-20 select-none font-display text-[clamp(3.5rem,14.5vw,13.5rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.05em] text-white/[0.06]"
        >
          Seif Ayman
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.08] pt-6 text-[13px] text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {profile.name}. All rights reserved.
          </p>
          <p>
            {profile.location} · {profile.availability}
          </p>
          <a
            href="#main"
            className="inline-flex items-center gap-2 text-snow transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-sky"
          >
            Back to top
            <span className="inline-flex size-8 items-center justify-center rounded-full border border-white/15">
              <ArrowUp className="size-3.5" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
