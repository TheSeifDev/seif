import { ArrowUp, Code2 } from "lucide-react";
import { profile } from "@/lib/content/home";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <a
            className="brand footer-brand"
            href="#home"
            aria-label="Seif Ayman, back to top"
          >
            <span className="brand-symbol">sa.</span>
            <span className="brand-caption">
              SEIF AYMAN<span>SENIOR FULL STACK DEVELOPER</span>
            </span>
          </a>
          <nav className="footer-nav" aria-label="Footer navigation">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="footer-social">
            <a
              href={profile.githubUrl}
              aria-label="Seif on GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code2 size={19} />
            </a>
            <a className="back-top" href="#home" aria-label="Back to top">
              <ArrowUp size={17} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Seif Ayman. Crafted with intention.</span>
          <span>DESIGN. CODE. PURPOSE.</span>
        </div>
      </div>
    </footer>
  );
}
