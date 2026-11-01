import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/server";
import { getAdminContent } from "@/lib/cms/repository";
import { DashboardLogin } from "@/components/dashboard";
import { LiveHomeRenderer } from "@/components/dashboard/preview/live-home-renderer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Live Home Preview · Seif Ayman Portfolio CMS",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default async function LiveHomePreviewPage() {
  try {
    await requireAdmin();
  } catch {
    return <DashboardLogin />;
  }

  const { content, revision } = await getAdminContent();

  return <LiveHomeRenderer initialContent={content} revision={revision} />;
}

