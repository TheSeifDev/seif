import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollExperience } from "../components/motion/scroll-experience";
import { SkillsSection } from "../components/home/skills-section";

const container = document.getElementById("qa-root")!;
let root: ReturnType<typeof createRoot> | undefined;
function mount() {
  root = createRoot(container);
  root.render(<StrictMode><ScrollExperience><section id="home" className="hero h-[400px]"><span className="hero-word">SEIF</span><div data-depth="8" /></section><section id="about" className="h-[400px]"><div data-reveal>About</div></section><article data-card className="h-[300px]"><div data-card-visual><a href="#process">Project</a></div></article><SkillsSection/><section id="process" className="h-[400px]"><div className="process-progress"/><div className="process-node">Process</div></section><section id="contact" className="h-[400px]"><span data-contact-line>Contact</span><div className="contact-card"/></section></ScrollExperience></StrictMode>);
}
const qa = {mount,unmount:()=>{root?.unmount();root=undefined;},triggers:()=>ScrollTrigger.getAll().length};
Object.assign(window, {__motionQa:qa});
mount();
