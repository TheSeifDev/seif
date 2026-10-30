import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { SiteContentProvider } from "@/components/site/site-content-provider";
import { RouteMotion } from "@/components/motion/route-motion";
import { CustomCursor } from "@/components/site/custom-cursor";
import { getSiteContent } from "@/lib/cms/server";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const content = await getSiteContent();

  return (
    <SiteContentProvider content={content}>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer content={content} />
      <RouteMotion />
      <CustomCursor />
    </SiteContentProvider>
  );
}
