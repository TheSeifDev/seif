import { ArrowUp, Mail } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { profile } from "@/lib/content/home";
import { frame } from "@/lib/ui/layout";

export function Footer() {
  return (
    <footer className="site-footer bg-[#080b0d] py-6 text-slate-200">
      <div className={frame}>
        <div className="footer-top flex flex-wrap items-center justify-between gap-6 pb-6 md:flex-nowrap">
          <a
            className="brand inline-flex items-center gap-4"
            href="#home"
            aria-label="Seif Ayman, back to top"
          >
            <span className="brand-symbol pr-1.5 text-[35px] leading-none font-extrabold tracking-[-5px] -skew-x-12">
              sa.
            </span>
            <span className="flex flex-col gap-1 font-mono text-[10px] tracking-wide">
              SEIF AYMAN
              <span className="text-[7px] text-slate-400">
                SENIOR FULL STACK DEVELOPER
              </span>
            </span>
          </a>
          <nav
            className="footer-nav order-2 flex w-full justify-between gap-4 text-xs text-slate-400 md:order-0 md:w-auto md:justify-center md:gap-7"
            aria-label="Footer navigation"
          >
            <a className="hover:text-identity-bright" href="#about">
              About
            </a>
            <a className="hover:text-identity-bright" href="#projects">
              Projects
            </a>
            <a className="hover:text-identity-bright" href="#skills">
              Skills
            </a>
            <a
              className="hover:text-identity-bright"
              href={profile.cvUrl}
              download
            >
              Download CV
            </a>
          </nav>
          <div className="footer-social ml-auto flex items-center gap-3 md:ml-0 md:gap-5">
            <a
              className="grid size-8 place-items-center"
              href={profile.githubUrl}
              aria-label="Seif on GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiGithub size={19} />
            </a>
            <a
              className="grid size-8 place-items-center"
              href={`mailto:${profile.email}`}
              aria-label="Email Seif"
            >
              <Mail size={18} />
            </a>
            <a
              className="back-top grid size-9 place-items-center rounded-full bg-[#dff4ff] text-[#076c9b]"
              href="#home"
              aria-label="Back to top"
            >
              <ArrowUp size={17} />
            </a>
          </div>
        </div>
        <div className="footer-bottom flex flex-col justify-between gap-3 border-t border-white/10 pt-5 font-mono text-[8px] text-slate-400 sm:flex-row">
          <span>© 2026 Seif Ayman. Crafted with intention.</span>
          <span className="tracking-widest">
            ALEXANDRIA, EGYPT · OPEN TO REMOTE
          </span>
        </div>
      </div>
    </footer>
  );
}
