import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const configuredSiteUrl = process.env.SITE_URL;
const metadataBase =
  configuredSiteUrl && /^https?:\/\//.test(configuredSiteUrl)
    ? new URL(configuredSiteUrl)
    : undefined;
export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase, alternates: { canonical: "/" } } : {}),
  title: "Seif Ayman — Senior Full Stack Developer",
  description:
    "Seif Ayman, TheSeifDev. Senior Full Stack Software Developer with 5+ years of experience. Thoughtful interfaces, reliable systems, and products built with purpose.",
  openGraph: {
    title: "Seif Ayman — Code. Craft. Purpose.",
    description:
      "Senior Full Stack Software Developer. From idea to implementation, with care in every detail.",
    type: "website",
    siteName: "Seif Ayman",
    ...(metadataBase ? { url: "/" } : {}),
  },
  twitter: {
    card: "summary",
    title: "Seif Ayman — Senior Full Stack Developer",
    description:
      "Thoughtful web products, from the first idea to the final detail.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
