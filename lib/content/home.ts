// Phase 2: verified profile + editorial placeholders, not live integrations.
export const profile = {
  name: "Seif Ayman",
  handle: "TheSeifDev",
  alias: "Professor / Prof.",
  role: "Senior Full Stack Software Developer",
  experience: "5+",
  githubUrl: "https://github.com/TheSeifDev",
} as const;

export const assets = {
  hero: "/images/hero-landscape.webp",
  about: "/images/about-ink.webp",
  contact: "/images/contact-moon.webp",
  portrait: "/images/seif-portrait.webp",
} as const;

export type ProjectPreview = {
  id: string;
  discipline: string;
  visual: "system" | "code" | "product";
};

// These are presentation slots, NOT projects or published drafts.
export const projectPreviews: ProjectPreview[] = [
  { id: "01", discipline: "Product engineering", visual: "product" },
  { id: "02", discipline: "Full stack systems", visual: "system" },
  { id: "03", discipline: "Thoughtful interfaces", visual: "code" },
];

export const buildStack = [
  { name: "Next.js", mark: "N", color: "#16191b" },
  { name: "React", mark: "◉", color: "#06799e" },
  { name: "TypeScript", mark: "TS", color: "#2463a6" },
  { name: "Tailwind", mark: "≈", color: "#087f99" },
  { name: "GSAP", mark: "G", color: "#417517" },
  { name: "Node.js", mark: "JS", color: "#3c782d" },
  { name: "Drizzle", mark: "D", color: "#627e14" },
  { name: "PostgreSQL", mark: "P", color: "#35638b" },
] as const;
