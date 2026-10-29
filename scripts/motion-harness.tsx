import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollExperience } from "../components/motion/scroll-experience";
import { HomeScenes } from "../components/motion/home-scenes";
import { JourneyPin } from "../components/motion/journey-pin";
import { HorizontalProjects } from "../components/motion/horizontal-projects";
import { SkillsSection } from "../components/home/skills-section";
import { Moon } from "../components/visuals/moon";
const container=document.getElementById('qa-root')!;
let root:ReturnType<typeof createRoot>|undefined;
let refreshCount=0;ScrollTrigger.addEventListener('refresh',()=>refreshCount++);
function mount(){root=createRoot(container);root.render(<StrictMode><ScrollExperience><HomeScenes>
 <section id="home" className="hero relative h-[700px]"><span data-hero-word>SEIF</span><div className="hero-landscape"/><div className="hero-moon size-[340px]"><Moon/></div><div className="hero-fog"/><div className="portrait-wrap"/></section>
 <section id="about" className="h-[500px]"><span data-about-line>About</span><p data-about-copy>Practice</p><div data-about-mask><div className="ink-landscape"/></div></section>
 <JourneyPin>{['foundation','products','leadership'].map(x=><article key={x} data-journey-panel className="relative min-h-[30rem] bg-slate-900 p-10 data-[mode=desktop]:absolute data-[mode=desktop]:inset-0 data-[mode=desktop]:min-h-0"><h2>{x}</h2></article>)}</JourneyPin>
 <HorizontalProjects>{['one','two','three'].map(x=><article key={x} data-project-slide className="h-[600px] w-full shrink-0"><a href="#contact">{x}</a></article>)}</HorizontalProjects>
 <SkillsSection/>
 <section id="process" className="h-[500px]"><div data-process-progress/><div data-process-step>Discover</div></section>
 <section id="contact" className="h-[600px]"><span data-contact-line>Contact</span><div data-contact-mask/><div className="contact-card"/><div className="contact-fog"/></section>
 </HomeScenes></ScrollExperience></StrictMode>);}
const qa={mount,unmount:()=>{root?.unmount();root=undefined;},snapshot:()=>({triggers:ScrollTrigger.getAll().map(t=>t.vars.id),refreshCount,spacers:document.querySelectorAll('.pin-spacer').length,canvases:document.querySelectorAll('canvas').length})};
Object.assign(window,{__motionQa:qa});mount();
