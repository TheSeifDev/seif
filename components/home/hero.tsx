import Image from "next/image";
import { ArrowDown, ArrowUpRight, Braces, Download } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { assets, profile } from "@/lib/content/home";
import { frame } from "@/lib/ui/layout";
import { ActionLink } from "./primitives";

// Semantic class names below are GSAP hooks, not stylesheet selectors.
export function Hero() {
  return (
    <section
      id="home"
      className="hero relative isolate overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div
        className="hero-landscape absolute -top-[7%] -bottom-[5%] inset-x-0 -z-50 opacity-65 min-[901px]:opacity-85"
        aria-hidden="true"
        data-depth="8"
      >
        <Image
          src={assets.hero}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[65%_center]"
          preload
        />
      </div>
      <div
        className="hero-moon absolute right-[-25%] bottom-16 -z-40 aspect-square w-[100vw] rounded-full bg-radial from-[#eef8ff] via-identity to-identity/70 opacity-80 shadow-2xl shadow-identity/25 min-[901px]:top-9 min-[901px]:right-[15%] min-[901px]:bottom-auto min-[901px]:w-[min(48vw,650px)]"
        aria-hidden="true"
        data-depth="14"
      />
      <div
        className="hero-atmosphere absolute inset-x-0 top-[35%] bottom-0 -z-30 bg-radial from-identity/20 via-identity/5 to-transparent min-[901px]:inset-0"
        aria-hidden="true"
      />
      <div
        className="hero-fog absolute -inset-x-[10%] top-1/2 -bottom-[7%] -z-20 bg-radial from-identity/15 to-transparent opacity-65"
        aria-hidden="true"
        data-depth="20"
      />
      <div
        className="hero-shade absolute inset-0 -z-10 bg-linear-to-b from-[#080b0d] via-[#080b0d]/80 to-transparent min-[901px]:bg-linear-to-r min-[901px]:via-[#080b0d]/50"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-[#080b0d] to-transparent"
        aria-hidden="true"
      />
      <div
        className={`hero-inner ${frame} relative flex flex-col pb-16 min-[901px]:block min-[901px]:min-h-[clamp(740px,88svh,900px)] min-[901px]:pb-0`}
      >
        <div className="hero-copy relative z-10 w-full pt-[130px] min-[901px]:w-[58%] min-[901px]:pt-[clamp(185px,22svh,240px)]">
          <p className="hero-eyebrow eyebrow mb-6 flex items-center gap-3 font-mono text-[8px] tracking-[0.15em] text-slate-300 sm:text-[10px]">
            <span className="size-[7px] shrink-0 rounded-full bg-identity shadow-sm shadow-identity/40" />
            SENIOR FULL STACK DEVELOPER
          </p>
          <h1
            id="hero-title"
            className="m-0 text-[clamp(72px,23vw,137px)] leading-[0.88] font-extrabold tracking-[-0.07em] sm:text-[120px] min-[901px]:text-[clamp(108px,11.9vw,172px)]"
            aria-label="Seif Ayman"
          >
            <span className="hero-line -mb-[0.06em] block overflow-hidden pb-[0.06em]">
              <span className="hero-word inline-block">SEIF</span>
            </span>
            <span className="hero-line hero-name-accent -mb-[0.06em] block overflow-hidden pb-[0.06em] text-identity-bright">
              <span className="hero-word inline-block">
                AYMAN<span className="text-[0.75em]">.</span>
              </span>
            </span>
          </h1>
          <p className="hero-meta hero-alias mt-6 mb-4 font-mono text-[9px] tracking-[0.2em] text-slate-400">
            THESEIFDEV <span className="px-3 text-identity-bright">/</span>{" "}
            PROFESSOR
          </p>
          <p className="hero-meta hero-description mb-6 text-xs leading-relaxed text-slate-300 sm:text-sm">
            I build products that solve real problems.
            <br />
            From the interface to the architecture behind it.
          </p>
          <div
            className="hero-actions flex items-center gap-4"
            data-hero-actions
          >
            <ActionLink href="#projects">Explore my work</ActionLink>
            <a
              className="grid size-11 place-items-center rounded-full border border-white/20 text-slate-200 transition-colors hover:border-identity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-identity"
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seif on GitHub"
            >
              <SiGithub size={20} />
            </a>
          </div>
          <a
            className="hero-meta cv-link mt-5 inline-flex items-center gap-2 text-[11px] text-slate-400 transition-colors hover:text-white"
            href={profile.cvUrl}
            download
          >
            <Download size={14} />
            Download CV
            <span className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[8px]">
              PDF
            </span>
          </a>
        </div>
        <div className="portrait-wrap pointer-events-none relative z-[3] -mr-3 mt-5 h-[clamp(380px,60vw,600px)] w-[min(100%,560px)] self-end overflow-hidden min-[901px]:absolute min-[901px]:top-[77px] min-[901px]:right-[9%] min-[901px]:m-0 min-[901px]:h-auto min-[901px]:w-[47%] min-[901px]:overflow-visible">
          <Image
            src={assets.portrait}
            alt="Seif Ayman Ahmed, Senior Full Stack Software Developer"
            width={1200}
            height={1600}
            sizes="(max-width:900px) 90vw,48vw"
            preload
            className="hero-portrait block h-auto w-full"
          />
        </div>
        <aside
          className="hero-side hero-meta absolute bottom-[113px] left-0 z-20 min-[901px]:top-[190px] min-[901px]:right-0 min-[901px]:bottom-auto min-[901px]:left-auto"
          aria-label="Experience"
        >
          <span className="vertical-note mb-20 hidden text-right font-mono text-[9px] tracking-[0.2em] text-slate-300 min-[1101px]:block">
            DESIGN · CODE · PURPOSE
          </span>
          <div className="experience-card w-32 rounded-xl border border-white/15 bg-[#0d1820]/85 p-4 backdrop-blur-xl min-[901px]:w-[155px] min-[1101px]:w-[174px] min-[1101px]:px-5 min-[1101px]:pt-6">
            <Braces
              size={25}
              className="experience-icon mb-4 text-identity-bright"
            />
            <strong className="block text-[39px] leading-none font-normal tracking-[-0.06em] min-[1101px]:text-[47px]">
              {profile.experience}
            </strong>
            <span className="experience-label mt-2 block font-mono text-[7px] leading-relaxed tracking-wide min-[1101px]:text-[8px]">
              YEARS OF EXPERIENCE
            </span>
            <p className="mt-4 mb-5 hidden text-[11px] leading-relaxed text-slate-400 min-[1101px]:block">
              Engineering thoughtful
              <br />
              products, end to end.
            </p>
            <div className="experience-signature mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[7px]">
              SEIF AYMAN
              <ArrowUpRight size={14} />
            </div>
          </div>
        </aside>
        <div className="hero-bottom hero-meta absolute inset-x-0 bottom-7 z-20 flex items-center justify-between">
          <a
            href="#about"
            className="scroll-prompt flex items-center gap-3 font-mono text-[8px] tracking-[0.12em] text-slate-400"
          >
            <span className="h-px w-9 bg-identity" />
            SCROLL TO EXPLORE
            <ArrowDown size={14} />
          </a>
          <span className="edition-note hidden items-center gap-3 font-mono text-[8px] tracking-wide text-slate-400 min-[901px]:flex">
            BASED IN ALEXANDRIA<span className="text-identity-bright">—</span>
            BUILDING FOR THE WORLD
          </span>
        </div>
      </div>
    </section>
  );
}
