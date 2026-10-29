import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});
const notoJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const configuredSiteUrl = process.env.SITE_URL;
const metadataBase =
  configuredSiteUrl && /^https?:\/\//.test(configuredSiteUrl)
    ? new URL(configuredSiteUrl)
    : undefined;

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: {
    default: "Seif Ayman — Senior Full Stack Developer",
    template: "%s — Seif Ayman",
  },
  description:
    "Seif Ayman (TheSeifDev), Senior Full Stack Software Developer with 5+ years of experience building production web, desktop, AI and IoT products — from Next.js interfaces to NestJS APIs and PostgreSQL data models.",
  applicationName: "Seif Ayman",
  authors: [{ name: "Seif Ayman" }],
  openGraph: {
    type: "website",
    siteName: "Seif Ayman",
    title: "Seif Ayman — Senior Full Stack Developer",
    description:
      "Production-grade web, desktop and AI/IoT products, owned end to end — from schema to interface.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seif Ayman — Senior Full Stack Developer",
    description:
      "Production-grade web, desktop and AI/IoT products, owned end to end.",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${notoJp.variable}`}
    >
      <body className="min-h-dvh bg-night font-sans text-snow antialiased">
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
