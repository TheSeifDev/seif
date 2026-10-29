export type PortfolioProject = {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  focus: string;
  technologies: string[];
  liveUrl?: string;
  verified?: boolean;
  image?: string;
  imageLabel?: string;
  availabilityNote?: string;
};

/**
 * CV-approved Home project stories. Live URLs stay gated by `verified` until
 * they have been checked in the current review pass; imagery is optional so
 * an editorial visual is never mistaken for a product screenshot.
 */
export const portfolioProjects: PortfolioProject[] = [
  {
    id: "rafiq",
    number: "01",
    title: "RAFIQ AI Assistant",
    category: "AI Assistant",
    description:
      "A local-first desktop assistant for healthcare support and smart-home automation, shaped around modular RAG context responses.",
    focus: "AI · Healthcare · Desktop",
    technologies: [
      "Electron",
      "React",
      "TypeScript",
      "Fastify",
      "SQLite",
      "MQTT",
      "RAG",
      "RESTful APIs",
    ],
    liveUrl: "https://phantomsio.vercel.app/rafiq",
    verified: true,
    image: "/images/projects/rafiq.webp",
    imageLabel: "PUBLIC SITE CAPTURE",
  },
  {
    id: "it-sum",
    number: "02",
    title: "IT-SUM Platform",
    category: "Education platform",
    description:
      "An academic management platform bringing content, quizzes, dashboards, authentication, and relational data into one learning workflow.",
    focus: "Education · Platform · Web",
    technologies: [
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "Supabase",
      "Prisma ORM",
      "RESTful APIs",
    ],
    liveUrl: "https://it-sum-seven.vercel.app",
    verified: true,
    image: "/images/projects/itsum.webp",
    imageLabel: "PUBLIC SITE CAPTURE",
  },
  {
    id: "phantoms",
    number: "03",
    title: "PHANTOMS Platform",
    category: "Team platform",
    description:
      "The official team digital presence, built with a reusable frontend architecture and a responsive interface tuned for devices of every size.",
    focus: "Team · Frontend architecture · UI",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
    ],
    liveUrl: "https://phantomsio.vercel.app",
    verified: true,
    image: "/images/projects/phantoms.webp",
    imageLabel: "PUBLIC SITE CAPTURE",
  },
  {
    id: "nabd-masr",
    number: "04",
    title: "Nabd Masr",
    category: "Blood donation platform",
    description:
      "A focused platform connecting blood donors and recipients through real-time coordination, profiles, authentication, and secure APIs.",
    focus: "Community · Real-time · Platform",
    technologies: ["Next.js", "React", "Prisma ORM", "MySQL", "NextAuth"],
    liveUrl: "https://nabdmasr.vercel.app",
    verified: false,
    availabilityNote: "Public preview currently restricted",
  },
  {
    id: "personal-portfolio",
    number: "05",
    title: "Personal Portfolio",
    category: "Technical case studies",
    description:
      "An accessible portfolio system for technical case studies, with considered UI, search visibility, and purposeful interaction design.",
    focus: "Case studies · Accessibility · SEO",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "SEO",
    ],
    liveUrl: "https://seifdev.vercel.app",
    verified: true,
    image: "/images/projects/portfolio.webp",
    imageLabel: "PUBLIC SITE CAPTURE",
  },
];

export const featuredProjects = portfolioProjects.slice(0, 3);
export const moreProjects = portfolioProjects.slice(3);
