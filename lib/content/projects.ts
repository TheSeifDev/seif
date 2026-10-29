// Project entries curated from the CV and verified public sources.
// See docs/content-sources.md. `live` and `repo` exist only for URLs that
// were opened and confirmed; never add an action for an unverified link.

export type ProjectLink = {
  url: string;
  label: string;
  note?: string;
};

export type ProjectFeatureGroup = {
  title: string;
  items: readonly string[];
};

export type ProjectArchitectureStep = {
  name: string;
  detail: string;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  domains: readonly string[];
  kanji: string;
  kanjiMeaning: string;
  summary: string;
  description: string;
  highlights: readonly string[];
  features?: readonly ProjectFeatureGroup[];
  architecture?: {
    steps: readonly ProjectArchitectureStep[];
    note: string;
  };
  stack: readonly string[];
  live?: ProjectLink;
  repo?: ProjectLink;
  /** A capture of the public landing page; never a private app. */
  image?: { src: string; alt: string; caption: string };
  availability?: string;
  featured: boolean;
  sources: readonly string[];
};

export const projects: readonly Project[] = [
  {
    slug: "rafiq",
    title: "RAFIQ AI Assistant",
    category: "AI · Healthcare · Desktop",
    domains: ["AI", "Desktop", "IoT"],
    kanji: "相棒",
    kanjiMeaning: "Companion",
    summary:
      "An AI-powered smart medical and home assistant — a local-first desktop app with a modular RAG workflow and real-time MQTT.",
    description:
      "RAFIQ is a flagship AI assistant that combines healthcare support with smart-home automation. It runs as a cross-platform, local-first desktop application with Electron, Fastify and SQLite, uses a modular Retrieval-Augmented Generation workflow for context-aware responses, and communicates with devices in real time over MQTT.",
    highlights: [
      "Designed and built the flagship assistant combining healthcare support with smart-home automation.",
      "Architected a modular RAG workflow for context-aware assistant responses.",
      "Implemented real-time MQTT communication for device monitoring and home automation.",
      "Resolved critical data-persistence and AI-chat reliability issues, improving production stability.",
    ],
    architecture: {
      steps: [
        {
          name: "rafiq-ai",
          detail: "Speech-to-text, LLM and text-to-speech services",
        },
        {
          name: "rafiq-backend",
          detail: "Fastify, SQLite, Server-Sent Events and MQTT",
        },
        {
          name: "rafiq-gui",
          detail: "Electron and React desktop interface",
        },
      ],
      note: "The interface never talks to the AI service directly — every request flows through the backend, which streams results to the GUI over SSE.",
    },
    stack: [
      "Electron",
      "React",
      "TypeScript",
      "Fastify",
      "SQLite",
      "MQTT",
      "RAG",
      "RESTful APIs",
    ],
    live: { url: "https://phantomsio.vercel.app/rafiq", label: "Watch Live" },
    repo: {
      url: "https://github.com/TheSeifDev/rafiq-system",
      label: "Go to Repo",
    },
    image: {
      src: "/images/projects/rafiq.webp",
      alt: "RAFIQ public landing page on the PHANTOMS website",
      caption: "Public landing page capture",
    },
    featured: true,
    sources: [
      "CV — Featured Projects",
      "github.com/TheSeifDev/rafiq-system README",
      "phantomsio.vercel.app/rafiq",
    ],
  },
  {
    slug: "it-sum",
    title: "IT-SUM Platform",
    category: "Education · Web platform",
    domains: ["Education", "Web"],
    kanji: "学び",
    kanjiMeaning: "Learning",
    summary:
      "A learning platform for IT students with content delivery, quizzes, academic management and admin dashboards.",
    description:
      "IT-SUM is an educational and academic management platform — a content hub for IT students that brings course content, quizzes and academic management together, with authentication, a relational data model and dashboards for administrators and students.",
    highlights: [
      "Built a learning platform with content delivery, quizzes and academic management.",
      "Designed authentication and a scalable relational database architecture.",
      "Implemented dashboards and content-management tooling for administrators and students.",
    ],
    stack: [
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "Supabase",
      "Prisma ORM",
      "RESTful APIs",
    ],
    live: { url: "https://it-sum-seven.vercel.app", label: "Watch Live" },
    repo: {
      url: "https://github.com/TheSeifDev/it-sum",
      label: "Go to Repo",
      note: "Backend repository — REST API in Go, Gin and PostgreSQL",
    },
    image: {
      src: "/images/projects/itsum.webp",
      alt: "IT Summarize public landing page, a content hub for IT students",
      caption: "Public landing page capture",
    },
    featured: true,
    sources: [
      "CV — Featured Projects",
      "it-sum-seven.vercel.app",
      "github.com/TheSeifDev/it-sum README",
    ],
  },
  {
    slug: "phantoms",
    title: "PHANTOMS Platform",
    category: "Team platform · Frontend",
    domains: ["Web"],
    kanji: "幻影",
    kanjiMeaning: "Phantom",
    summary:
      "The official PHANTOMS team platform, built on a scalable frontend architecture and a reusable UI component system.",
    description:
      "The official platform and digital presence of the PHANTOMS Technology Team. I owned the product architecture and technical decisions, built a scalable frontend architecture with a reusable UI component system shared across projects, and tuned performance and experience across desktop and mobile.",
    highlights: [
      "Designed and developed the official platform, owning product architecture and technical decisions.",
      "Built a scalable frontend architecture and reusable UI component system shared across projects.",
      "Optimized performance, scalability and user experience across desktop and mobile.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    live: { url: "https://phantomsio.vercel.app", label: "Watch Live" },
    image: {
      src: "/images/projects/phantoms.webp",
      alt: "PHANTOMS team platform public landing page",
      caption: "Public landing page capture",
    },
    featured: true,
    sources: ["CV — Featured Projects", "phantomsio.vercel.app"],
  },
  {
    slug: "nabd-masr",
    title: "Nabd Masr",
    category: "Healthcare · Community",
    domains: ["Web", "Healthcare"],
    kanji: "鼓動",
    kanjiMeaning: "Heartbeat",
    summary:
      "A blood donation platform connecting donors with recipients in real time.",
    description:
      "Nabd Masr is a blood donation management platform that connects blood donors with recipients in real time. It includes authentication, user profiles and secure REST APIs behind a responsive, accessible interface.",
    highlights: [
      "Developed a platform connecting blood donors with recipients in real time.",
      "Implemented authentication, user profiles and secure REST APIs.",
      "Built responsive, accessible interfaces.",
    ],
    stack: ["Next.js", "React", "Prisma ORM", "MySQL", "NextAuth"],
    availability: "Public preview is currently restricted",
    featured: false,
    sources: ["CV — Featured Projects"],
  },
  {
    slug: "personal-portfolio",
    title: "Personal Portfolio",
    category: "Case studies · Web",
    domains: ["Web"],
    kanji: "作品",
    kanjiMeaning: "Works",
    summary:
      "My previous portfolio — technical case studies with reusable UI architecture, SEO and interactive interfaces.",
    description:
      "A high-performance, accessible portfolio for technical case studies, built with a reusable UI architecture, search-engine optimization and interactive interfaces.",
    highlights: [
      "Built a high-performance, accessible portfolio with reusable UI architecture.",
      "SEO optimization and interactive interfaces.",
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "SEO",
    ],
    live: { url: "https://seifdev.vercel.app", label: "Watch Live" },
    image: {
      src: "/images/projects/portfolio.webp",
      alt: "Previous Seif Ayman portfolio landing page",
      caption: "Public landing page capture",
    },
    featured: false,
    sources: ["CV — Featured Projects", "seifdev.vercel.app"],
  },
  {
    slug: "trackup",
    title: "TrackUp",
    category: "Video analytics · SaaS",
    domains: ["Web", "Analytics"],
    kanji: "記録",
    kanjiMeaning: "Record",
    summary:
      "Video intelligence and playback analytics — real viewing sessions, scoped team access and provider-aware evidence.",
    description:
      "TrackUp tracks real viewing sessions with sovereign team access and provider-aware playback evidence, while metrics a provider cannot supply stay explicitly unavailable. Teams organise videos into organizations and spaces, share scoped Watch Links, and review persisted viewer, video and session records.",
    highlights: [
      "Provider-aware tracking: play, pause and seek where the provider exposes them, measured watch time and completion, and session timelines — with no inferred metrics.",
      "Multi-tenant organizations and spaces with space-level data isolation and server-side role checks.",
      "Scoped Watch Links, signed HTTP-only sessions and sensitive values kept server-side.",
    ],
    features: [
      {
        title: "Tracking",
        items: [
          "Play, pause and seek events where exposed",
          "Measured watch time and completion",
          "Session and event timelines",
        ],
      },
      {
        title: "Teams & access",
        items: [
          "Multi-tenant organizations and spaces",
          "Owner, Admin and Member roles",
          "Server-side authorization",
        ],
      },
      {
        title: "Sources",
        items: [
          "YouTube and Vimeo player adapters",
          "Direct media playback",
          "Google Drive and Telegram (session-only)",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Viewer and session breakdowns",
          "Provider-aware metrics",
          "CSV export of viewer activity",
        ],
      },
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Recharts",
      "Base UI",
    ],
    live: { url: "https://trakeup.vercel.app/", label: "Watch Live" },
    repo: { url: "https://github.com/TheSeifDev/traking", label: "Go to Repo" },
    image: {
      src: "/images/projects/trackup.webp",
      alt: "TrackUp landing page: Turn videos into actionable insights",
      caption:
        "Public landing page capture — its dashboard image is labelled an illustrative preview",
    },
    featured: false,
    sources: ["trakeup.vercel.app", "github.com/TheSeifDev/traking"],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const moreProjects = projects.filter((project) => !project.featured);

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}

export const projectDomains = [
  "All",
  ...Array.from(new Set(projects.flatMap((project) => project.domains))),
] as const;

/** Short host label for browser frames, e.g. "trakeup.vercel.app". */
export function hostOf(url?: string) {
  if (!url) return undefined;
  try {
    const { host, pathname } = new URL(url);
    return `${host}${pathname === "/" ? "" : pathname}`;
  } catch {
    return undefined;
  }
}
