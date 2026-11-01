import type { Metadata } from "next";
import { SiteContentProvider } from "@/components/site/site-content-provider";
import { CustomCursor } from "@/components/site/custom-cursor";
import { getSiteContent } from "@/lib/cms/server";

export const metadata: Metadata = {
  title: { absolute: "Seif — Private workspace" },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();

  return (
    <SiteContentProvider content={content}>
      <div className="relative min-h-screen bg-night text-snow selection:bg-sky selection:text-night">
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <CustomCursor />
      </div>
    </SiteContentProvider>
  );
}
