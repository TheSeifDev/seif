import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { JsonLd } from "@/components/seo";
import { createRootMetadata, createSiteGraph } from "@/lib/seo";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = createRootMetadata();

export const viewport: Viewport = {
  themeColor: "#05070a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-dvh bg-night font-sans text-snow antialiased">
        <JsonLd data={createSiteGraph()} />
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-snow px-5 py-3 text-sm font-semibold text-night shadow-lg transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
