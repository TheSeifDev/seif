"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
}: {
  activeId: string;
  onSelect?: () => void;
}) {
  return (
    <>
      {navigationItems.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={activeId === item.id ? "is-active" : undefined}
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

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection?.target instanceof HTMLElement) {
          setActiveId(visibleSection.target.id);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const breakpoint = window.matchMedia("(min-width: 801px)");
    const handleBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMenuOpen(false);
    };
    breakpoint.addEventListener("change", handleBreakpoint);
    return () => breakpoint.removeEventListener("change", handleBreakpoint);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        shellRef.current &&
        event.target instanceof Node &&
        !shellRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    mobileNavRef.current?.querySelector<HTMLElement>("a")?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <div ref={shellRef} className="nav-shell">
        <a className="brand" href="#home" aria-label="Prof. Full Stack home">
          <span className="brand-symbol">sa.</span>
          <span className="brand-caption">PROF. / FULL STACK</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <NavigationLinks activeId={activeId} />
        </nav>

        <a className="nav-cta" href="#contact">
          <span>Let’s talk</span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>

        <button
          ref={menuButtonRef}
          className="menu-toggle"
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
          className="mobile-nav"
          id="mobile-nav"
          aria-label="Mobile navigation"
          hidden={!isMenuOpen}
        >
          <NavigationLinks activeId={activeId} onSelect={closeMenu} />
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
