import type { Metadata } from "next";
import {
  ArrowUpRight,
  Clock3,
  FileText,
  GitBranch,
  Mail,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/site/page-hero";
import { CmsTitle } from "@/components/system/cms-title";
import { container, label, mutedOnDark } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { getCopy } from "@/lib/cms/copy";
import { createCmsPageMetadata, withCmsGraph } from "@/lib/cms/metadata";
import { getSiteContent } from "@/lib/cms/server";
import { createContactPageGraph } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return createCmsPageMetadata(
    {
      title: "Contact",
      description: getCopy(
        content.copy,
        "contact.hero.description",
        content.profile.availability,
      ),
      path: "/contact",
    },
    content,
  );
}
type ContactDetail = {
  label: string;
  detail: string;
  icon: LucideIcon;
  href?: string;
  external?: boolean;
};
export default async function ContactPage() {
  const content = await getSiteContent();
  const { profile, assets, copy } = content;
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const details: readonly ContactDetail[] = [
    {
      label: c("contact.emailLabel", "Email"),
      detail: profile.email,
      href: `mailto:${profile.email}`,
      icon: Mail,
    },
    {
      label: c("contact.locationLabel", "Location"),
      detail: profile.location,
      icon: MapPin,
    },
    {
      label: c("contact.availabilityLabel", "Availability"),
      detail: profile.availability,
      icon: Clock3,
    },
    {
      label: c("contact.githubLabel", "GitHub"),
      detail: profile.handle,
      href: profile.githubUrl,
      icon: GitBranch,
      external: true,
    },
    {
      label: c("contact.downloadCvLabel", "Download CV"),
      detail: c("contact.cvDetail", "PDF"),
      href: profile.cvUrl,
      icon: FileText,
    },
  ];
  return (
    <>
      <JsonLd
        data={withCmsGraph(
          createContactPageGraph({
            path: "/contact",
            name: `Contact ${profile.name}`,
            description: c(
              "contact.hero.description",
              "Start a conversation about a product, platform, or collaboration.",
            ),
            breadcrumbs: [
              { name: "Home", path: "/" },
              { name: "Contact", path: "/contact" },
            ],
          }),
          content,
        )}
      />
      <PageHero
        label={c("contact.hero.sectionLabel", "Contact")}
        title={
          <CmsTitle
            text={c("contact.hero.title", "Let's build something that matters")}
            accent="that matters"
          />
        }
        intro={c(
          "contact.hero.description",
          "Have a product, platform or technical challenge in mind? Tell me where you want to go, and I'll get back to you by email.",
        )}
        japanese="未来を創る"
        image={assets.contactScene}
      />
      <section className="bg-night pb-24 text-snow lg:pb-36">
        <div className={cn(container, "grid gap-14 lg:grid-cols-12 lg:gap-16")}>
          <div className="lg:col-span-5">
            <p className={cn(label, mutedOnDark)}>
              {c("contact.directDetailsLabel", "Direct details")}
            </p>
            <ul className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {details.map((item) => {
                const Icon = item.icon;
                const contentNode = (
                  <>
                    <Icon
                      className="size-4 shrink-0 text-mist transition-colors group-hover:text-sky"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 text-[15px] font-medium">
                      {item.label}
                    </span>
                    <span className="ml-auto truncate text-right text-[13px] text-mist">
                      {item.detail}
                    </span>
                    {item.href ? (
                      <ArrowUpRight
                        className="size-4 shrink-0 text-mist transition-colors group-hover:text-sky"
                        aria-hidden="true"
                      />
                    ) : null}
                  </>
                );
                return (
                  <li key={item.label}>
                    {item.href ? (
                      <a
                        href={item.href}
                        {...(item.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="group flex items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-sky"
                      >
                        {contentNode}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 py-4">
                        {contentNode}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-12 max-w-md border-l border-sky/60 pl-5">
              <p className={cn(label, "text-sky")}>
                {c("contact.whatHappensNextLabel", "What happens next")}
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-mist">
                {c(
                  "contact.whatHappensNextDescription",
                  "Your message is stored privately and reviewed by me. I'll reply by email with the next useful step.",
                )}
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
