import Image from "next/image";
import { ArrowDown, ArrowUpRight, Code2 } from "lucide-react";
import { assets, profile } from "@/lib/content/home";
import { ActionLink } from "./primitives";

export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div
        className="hero-landscape"
        style={{ backgroundImage: `url('${assets.hero}')` }}
        aria-hidden="true"
        data-parallax
      />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-moon" aria-hidden="true" />
      <div className="hero-halo" aria-hidden="true" />
      <div className="hero-inner container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            SENIOR FULL STACK DEVELOPER
          </p>
          <h1 id="hero-title">
            <span>SEIF</span>
            <span className="hero-name-accent">
              AYMAN<span className="name-period">.</span>
            </span>
          </h1>
          <p className="hero-alias">
            THESEIFDEV <span>/</span> PROFESSOR
          </p>
          <p className="hero-description">
            I build thoughtful web products.
            <br />
            From the first idea to the final detail.
          </p>
          <div className="hero-actions">
            <ActionLink href="#projects">Explore my work</ActionLink>
            <a
              className="icon-link"
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Seif on GitHub"
            >
              <Code2 size={21} />
            </a>
          </div>
        </div>
        <div className="portrait-wrap">
          <Image
            src={assets.portrait}
            alt="Seif Ayman, Senior Full Stack Software Developer"
            width={1200}
            height={1600}
            sizes="(max-width: 700px) 90vw, 52vw"
            preload
            className="hero-portrait"
          />
        </div>
        <div className="hero-side">
          <span className="vertical-note">CRAFT WITH PURPOSE</span>
          <div className="experience-card">
            <span className="experience-icon">
              <Code2 size={23} />
            </span>
            <strong>{profile.experience}</strong>
            <span className="experience-label">YEARS OF EXPERIENCE</span>
            <p>
              Turning ideas into
              <br />
              real, usable products.
            </p>
            <div className="experience-signature">
              SEIF AYMAN <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <a href="#about" className="scroll-prompt">
            <span className="scroll-line" />
            SCROLL TO EXPLORE <ArrowDown size={14} />
          </a>
          <span className="edition-note">
            PERSONAL PORTFOLIO <span>—</span> VOL. 01
          </span>
        </div>
      </div>
    </section>
  );
}
