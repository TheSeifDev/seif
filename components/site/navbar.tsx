"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation, profile } from "@/lib/content/profile";
import { container } from "@/lib/ui/layout";
import { Logo } from "./logo";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu whenever the route changes.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      <div className={cn(container, "flex items-center justify-between gap-4")}>
        <div
          className={cn(
            "pointer-events-auto flex h-14 items-center rounded-full border border-transparent px-4 transition-colors duration-300",
            scrolled || open
              ? "border border-white/10 bg-night/90 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              : "bg-transparent",
          )}
        >
          <Logo />
        </div>

        <nav
          aria-label="Primary"
          className={cn(
            "pointer-events-auto hidden h-14 items-center rounded-full border border-white/10 px-2 backdrop-blur-xl transition-colors duration-300 lg:flex",
            scrolled
              ? "bg-night/90 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]"
              : "bg-night/60",
          )}
        >
          <ul className="flex items-center">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-10 items-center rounded-full px-4 text-[13px] font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-sky",
                      active
                        ? "bg-white/[0.08] text-snow"
                        : "text-mist hover:text-snow",
                    )}
                  >
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="mr-2 size-1.5 rounded-full bg-sky"
                      />
                    ) : null}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden h-11 items-center gap-2 rounded-full bg-snow pl-5 pr-1.5 text-[13px] font-semibold text-night shadow-[0_8px_24px_-10px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky sm:inline-flex"
          >
            Let&apos;s talk
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-night text-snow">
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-night/90 text-snow backdrop-blur-xl transition-colors hover:border-sky/50 focus-visible:outline-2 focus-visible:outline-sky lg:hidden"
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="pointer-events-auto fixed inset-0 top-0 -z-10 bg-night/95 backdrop-blur-xl lg:hidden"
      >
        <nav
          aria-label="Mobile"
          className={cn(container, "flex h-full flex-col pb-10 pt-28")}
        >
          <ul className="flex flex-col">
            {navigation.map((item, index) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="border-b border-white/[0.08]">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-5 focus-visible:outline-2 focus-visible:outline-sky"
                  >
                    <span className="font-mono text-[11px] text-mist">
                      0{index + 1}
                    </span>
                    <span
                      className={cn(
                        "font-display text-4xl font-bold uppercase tracking-[-0.03em]",
                        active ? "text-sky" : "text-snow",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto space-y-2 text-sm text-mist">
            <a
              href={`mailto:${profile.email}`}
              className="block text-snow underline-offset-4 hover:underline"
            >
              {profile.email}
            </a>
            <p>{profile.location}</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
