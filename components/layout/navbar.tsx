"use client";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { frame } from "@/lib/ui/layout";

const navigationItems = [
  { label: "Home", href: "#home", id: "home" },
  { label: "About", href: "#about", id: "about" },
  { label: "Projects", href: "#projects", id: "projects" },
  { label: "Skills", href: "#skills", id: "skills" },
  { label: "Process", href: "#process", id: "process" },
  { label: "Contact", href: "#contact", id: "contact" },
] as const;

function NavigationLinks({
  activeId,
  onSelect,
  mobile = false,
}: {
  activeId: string;
  onSelect?: () => void;
  mobile?: boolean;
}) {
  return (
    <>
      {navigationItems.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`relative transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-identity ${mobile ? "block rounded-xl px-5 py-3 text-sm" : "py-3 text-xs"} ${activeId === item.id ? `is-active text-white ${mobile ? "bg-identity/10" : "after:absolute after:bottom-0 after:left-[calc(50%_-_2px)] after:size-1 after:rounded-full after:bg-identity after:content-['']"}` : "text-slate-400 hover:text-white"}`}
          aria-current={activeId === item.id ? "location" : undefined}
          onClick={onSelect}
        >
          {item.label}
        </a>
      ))}
    </>
  );
}

export function Navbar() {
  const [activeId, setActiveId] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const sections = navigationItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement)
          setActiveId(visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const breakpoint = window.matchMedia("(min-width:801px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        if (mobileNavRef.current?.contains(document.activeElement)) {
          shellRef.current
            ?.querySelector<HTMLElement>(".desktop-nav a")
            ?.focus({ preventScroll: true });
        }
        setIsMenuOpen(false);
      }
    };
    breakpoint.addEventListener("change", onChange);
    return () => breakpoint.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (
        shellRef.current &&
        event.target instanceof Node &&
        !shellRef.current.contains(event.target)
      ) {
        if (mobileNavRef.current?.contains(document.activeElement)) {
          menuButtonRef.current?.focus({ preventScroll: true });
        }
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    mobileNavRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [isMenuOpen]);
  return (
    <header className="site-header pointer-events-none fixed inset-x-0 top-3 z-50 sm:top-4 xl:top-5">
      <div
        ref={shellRef}
        className={`nav-shell ${frame} pointer-events-auto relative flex min-h-14 items-center justify-between gap-3 rounded-full border border-white/10 bg-[#0e171d]/90 py-2 pr-2.5 pl-5 shadow-lg shadow-black/10 backdrop-blur-xl sm:min-h-[60px] sm:gap-5 sm:pr-4 lg:min-h-[66px] lg:pl-6`}
      >
        <a
          className="brand inline-flex shrink-0 items-center gap-4"
          href="#home"
          aria-label="Seif Ayman home"
        >
          <span className="brand-symbol pr-1.5 text-[34px] leading-none font-extrabold tracking-[-5px] -skew-x-12 lg:text-[39px]">
            sa.
          </span>
          <span className="hidden font-mono text-[9px] leading-relaxed tracking-widest min-[1101px]:block">
            PROF. / FULL STACK
          </span>
        </a>
        <nav
          className="desktop-nav hidden items-center gap-5 min-[801px]:flex xl:gap-7"
          aria-label="Primary navigation"
        >
          <NavigationLinks activeId={activeId} />
        </nav>
        <a
          className="nav-cta ml-auto inline-flex shrink-0 items-center gap-3 rounded-full bg-[#f5f5f2] px-4 py-3 text-[11px] font-semibold text-[#101b21] transition-colors hover:bg-identity/20 min-[801px]:ml-0 xl:gap-4 xl:px-5"
          href="#contact"
        >
          <span>Let’s talk</span>
          <ArrowUpRight
            size={16}
            className="text-identity-ink"
            aria-hidden="true"
          />
        </a>
        <button
          ref={menuButtonRef}
          className="menu-toggle grid place-items-center rounded-full p-2.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-identity min-[801px]:hidden"
          type="button"
          aria-controls="mobile-nav"
          aria-expanded={isMenuOpen}
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
        <nav
          ref={mobileNavRef}
          className="mobile-nav absolute inset-x-0 top-[calc(100%_+_12px)] rounded-2xl border border-white/10 bg-[#0d171d]/95 p-3 backdrop-blur-xl"
          id="mobile-nav"
          aria-label="Mobile navigation"
          hidden={!isMenuOpen}
        >
          <NavigationLinks
            activeId={activeId}
            onSelect={() => {
              menuButtonRef.current?.focus({ preventScroll: true });
              setIsMenuOpen(false);
            }}
            mobile
          />
        </nav>
      </div>
    </header>
  );
}
