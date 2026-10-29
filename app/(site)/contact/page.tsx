import type { Metadata } from "next";
import { ArrowUpRight, Clock3, FileText, GitBranch, Mail, MapPin, type LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { Accent } from "@/components/system/primitives";
import { PageHero } from "@/components/site/page-hero";
import { assets, profile } from "@/lib/content/profile";
import { container, label, mutedOnDark } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a conversation with Seif Ayman about a product, platform, or freelance collaboration.",
};

type ContactDetail = {
  label: string;
  detail: string;
  icon: LucideIcon;
  href?: string;
  external?: boolean;
};

const details: readonly ContactDetail[] = [
  { label: "Email", detail: profile.email, href: `mailto:${profile.email}`, icon: Mail },
  { label: "Location", detail: profile.location, icon: MapPin },
  { label: "Availability", detail: profile.availability, icon: Clock3 },
  { label: "GitHub", detail: profile.handle, href: profile.githubUrl, icon: GitBranch, external: true },
  { label: "Download CV", detail: "PDF", href: profile.cvUrl, icon: FileText },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        title={<>Let&apos;s build something <Accent>that matters</Accent></>}
        intro="Have a product, platform or technical challenge in mind? Tell me where you want to go, and I&apos;ll get back to you by email."
        japanese="未来を創る"
        image={assets.contactScene}
      />

      <section className="bg-night pb-24 text-snow lg:pb-36">
        <div className={cn(container, "grid gap-14 lg:grid-cols-12 lg:gap-16") }>
          <div className="lg:col-span-5">
            <p className={cn(label, mutedOnDark)}>Direct details</p>
            <ul className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {details.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon className="size-4 shrink-0 text-mist transition-colors group-hover:text-sky" aria-hidden="true" />
                    <span className="min-w-0 text-[15px] font-medium">{item.label}</span>
                    <span className="ml-auto truncate text-right text-[13px] text-mist">{item.detail}</span>
                    {item.href ? <ArrowUpRight className="size-4 shrink-0 text-mist transition-colors group-hover:text-sky" aria-hidden="true" /> : null}
                  </>
                );

                return (
                  <li key={item.label}>
                    {item.href ? (
                      <a
                        href={item.href}
                        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="group flex items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-sky"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 py-4">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-12 max-w-md border-l border-sky/60 pl-5">
              <p className={cn(label, "text-sky")}>What happens next</p>
              <p className="mt-4 text-[15px] leading-relaxed text-mist">
                Your message is stored privately and reviewed by me. I&apos;ll reply by email with the next useful step.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
