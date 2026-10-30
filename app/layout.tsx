import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { JsonLd } from "@/components/seo";
import { createSiteGraph } from "@/lib/seo";
import { createCmsRootMetadata, withCmsGraph } from "@/lib/cms/metadata";
import { getSiteContent } from "@/lib/cms/server";
import { getCopy } from "@/lib/cms/copy";
import "./globals.css";
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});
export async function generateMetadata(): Promise<Metadata> {
  return createCmsRootMetadata(await getSiteContent());
}
export const viewport: Viewport = {
  themeColor: "#05070a",
  colorScheme: "dark",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();
  return (
    <html
      lang={content.seo.locale.split("_")[0]}
      className={montserrat.variable}
    >
      <body className="min-h-dvh bg-night font-sans text-snow antialiased">
        <JsonLd data={withCmsGraph(createSiteGraph(), content)} />
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-snow px-5 py-3 text-sm font-semibold text-night shadow-lg transition-transform focus-visible:translate-y-0"
        >
          {getCopy(content.copy, "site.skipToContent")}
        </a>
        {children}
      </body>
    </html>
  );
}
