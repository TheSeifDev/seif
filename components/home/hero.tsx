import Image from "next/image";
import { Moon } from "@/components/visuals/moon";
import { ArrowDown, Braces, Download } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { assets, profile } from "@/lib/content/home";
import { frame } from "@/lib/ui/layout";
import { ActionLink } from "./primitives";

export function Hero() {
  return (
    <section
      id="home"
      className="hero relative isolate overflow-clip"
      aria-labelledby="hero-title"
    >
      <div
        className="hero-landscape absolute -inset-y-12 inset-x-0 -z-40 opacity-70"
        aria-hidden="true"
      >
        <Image
          src={assets.hero}
          alt=""
          fill
          sizes="100vw"
          preload
          className="object-cover object-[65%_center]"
        />
      </div>
      <div
        className="hero-horizon absolute inset-0 -z-30 bg-linear-to-r from-[#080b0d] via-[#080b0d]/65 to-transparent"
        aria-hidden="true"
      />
      <div
        className="hero-moon absolute top-[48%] right-[5%] -z-20 size-[240px] sm:top-[42%] sm:right-[12%] sm:size-[300px] lg:top-16 lg:right-[29%] lg:size-[340px]"
        aria-hidden="true"
      >
        <Moon />
      </div>
      <div
        className="hero-fog absolute inset-x-0 top-[65%] bottom-0 -z-10 bg-[radial-gradient(ellipse_at_80%_80%,#49baf124,transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className={`${frame} hero-inner relative min-h-[850px] sm:min-h-[970px] lg:h-[90svh] lg:min-h-[680px] lg:max-h-[850px]`}
      >
        <div className="hero-copy relative z-20 pt-[132px] sm:pt-[142px] lg:w-[54%] lg:pt-[clamp(160px,20svh,220px)]">
          <p className="mb-6 flex items-center gap-3 font-mono text-[9px] tracking-[0.12em] text-slate-300 sm:text-[11px]">
            <span className="size-1.5 rounded-full bg-identity shadow-[0_0_10px_#49baf180]" />{" "}
            SENIOR FULL STACK DEVELOPER
          </p>
          <h1
            id="hero-title"
            className="m-0 text-[clamp(64px,21vw,116px)] leading-[0.88] font-extrabold tracking-[-0.065em] lg:text-[clamp(106px,11vw,160px)]"
            aria-label="Seif Ayman"
          >
            <span className="block overflow-clip pb-[0.07em]">
              <span data-hero-word className="inline-block">
                SEIF
              </span>
            </span>
            <span className="-mt-[0.02em] block overflow-clip pb-[0.07em] text-identity">
              <span data-hero-word className="inline-block">
                AYMAN.
              </span>
            </span>
          </h1>
          <p className="mt-5 mb-4 font-mono text-[10px] tracking-[0.16em] text-slate-400">
            THESEIFDEV <span className="px-2 text-identity">/</span> PROFESSOR
          </p>
          <p className="mb-6 max-w-[37ch] text-[13px] leading-relaxed text-slate-300 sm:text-sm">
            I build products that solve real problems.
            <br />
            From the interface to the architecture behind it.
          </p>
          <div className="flex items-center gap-4">
            <ActionLink href="#projects">Explore my work</ActionLink>
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seif on GitHub"
              className="grid size-11 place-items-center rounded-full border border-white/20 transition-colors hover:border-identity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-identity"
            >
              <SiGithub size={20} />
            </a>
          </div>
          <a
            href={profile.cvUrl}
            download
            className="mt-5 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white focus-visible:outline-identity"
          >
            <Download size={14} />
            Download CV
            <span className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[9px]">
              PDF
            </span>
          </a>
        </div>
        <div className="portrait-wrap pointer-events-none absolute -right-4 -bottom-1 z-10 w-[78%] max-w-[365px] sm:right-[5%] sm:max-w-[430px] lg:top-[75px] lg:right-[6%] lg:bottom-auto lg:w-[47%] lg:max-w-[610px]">
          <Image
            src={assets.portrait}
            alt="Seif Ayman Ahmed, Senior Full Stack Software Developer"
            width={1200}
            height={1600}
            sizes="(max-width:1023px) 80vw,48vw"
            preload
            className="hero-portrait block h-auto w-full"
          />
        </div>
        <aside
          className="absolute bottom-[84px] left-0 z-30 w-[128px] rounded-2xl border border-identity/25 bg-[#0c1720]/95 p-4 shadow-[0_12px_40px_#02070b66] sm:bottom-[110px] lg:top-[44%] lg:right-0 lg:bottom-auto lg:left-auto lg:w-[165px] lg:p-5"
          aria-label="Experience"
        >
          <Braces size={24} className="mb-4 text-identity" />
          <strong className="block text-[42px] leading-none tracking-tight lg:text-5xl">
            {profile.experience}
          </strong>
          <span className="mt-2 block font-mono text-[9px] leading-relaxed tracking-wide">
            YEARS OF EXPERIENCE
          </span>
          <p className="mt-4 hidden text-[11px] leading-relaxed text-slate-400 lg:block">
            Turning ideas into well-built products.
          </p>
          <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[9px] text-slate-400">
            SEIF AYMAN — PROF.
          </div>
        </aside>
        <span
          className="pointer-events-none absolute top-[130px] right-0 hidden text-[44px] tracking-widest text-white/70 xl:block"
          aria-hidden="true"
        >
          未来をつくる
        </span>
        <div className="absolute inset-x-0 bottom-8 z-30 flex items-center justify-between font-mono text-[10px] tracking-[0.12em] text-slate-400">
          <a href="#about" className="flex items-center gap-3">
            <span className="h-px w-8 bg-identity" />
            SCROLL TO EXPLORE
            <ArrowDown size={13} />
          </a>
          <span className="hidden lg:block">
            ALEXANDRIA <span className="px-2 text-identity">/</span> BUILDING
            FOR THE WORLD
          </span>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-24 bg-linear-to-t from-[#080b0d] to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
