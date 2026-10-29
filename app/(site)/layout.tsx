import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { RouteMotion } from "@/components/motion/route-motion";
import { CustomCursor } from "@/components/site/custom-cursor";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <RouteMotion />
      <CustomCursor />
    </>
  );
}
