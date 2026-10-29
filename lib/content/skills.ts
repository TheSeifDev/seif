export type SkillGroup = {
  name: string;
  skills: readonly string[];
};

export type MarqueeRow = {
  label: string;
  caption: string;
  direction: "left" | "right";
  items: readonly string[];
};

export const skillGroups = [
  {
    name: "Frontend",
    skills: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "React Native",
      "Bootstrap",
      "Tailwind CSS",
      "NativeWind",
      "Vite",
      "React Router",
    ],
  },
  {
    name: "Backend",
    skills: [
      "Node.js",
      "Express.js",
      "NestJS",
      "Laravel",
      "PHP",
      "FastAPI",
      "RESTful API Design",
    ],
  },
  {
    name: "Databases",
    skills: [
      "PostgreSQL",
      "MySQL",
      "SQLite",
      "MongoDB",
      "Redis",
      "Prisma ORM",
      "Drizzle ORM",
      "Mongoose",
    ],
  },
  {
    name: "Authentication",
    skills: [
      "NextAuth",
      "Better Auth",
      "Supabase Auth",
      "Firebase Auth",
      "Clerk",
      "Auth0",
      "JWT",
      "OAuth2.0",
      "Bcrypt",
    ],
  },
  {
    name: "Cloud",
    skills: ["Cloudflare", "Supabase", "Firebase", "Cloudinary"],
  },
  {
    name: "State / Form",
    skills: [
      "Redux Toolkit",
      "Zustand",
      "TanStack Query",
      "React Hook Form",
      "Zod",
    ],
  },
  {
    name: "Real-time",
    skills: ["Socket.IO", "WebSockets", "SSE", "Event-Driven Architecture"],
  },
  {
    name: "AI",
    skills: [
      "LLM Integration",
      "RAG Systems",
      "Prompt Engineering",
      "Conversational AI",
      "AI Assistants",
    ],
  },
  {
    name: "IoT",
    skills: [
      "MQTT",
      "ESP32",
      "Sensor Integration",
      "Smart Home Systems",
      "Hardware-Software Integration",
    ],
  },
  {
    name: "Desktop",
    skills: [
      "Electron.js",
      "Cross-Platform Desktop Apps",
      "SQLite Integration",
      "Local-First Applications",
    ],
  },
  {
    name: "Architecture",
    skills: [
      "System Design",
      "Software Architecture",
      "Database Design",
      "Clean Architecture",
      "SOLID Principles",
      "Design Patterns",
    ],
  },
  {
    name: "DevOps",
    skills: [
      "Git",
      "GitHub",
      "Docker",
      "Cloudflare",
      "Vercel",
      "Netlify",
      "CI/CD Fundamentals",
      "Environment Configuration",
    ],
  },
  {
    name: "Leadership",
    skills: [
      "Team Leadership",
      "Mentoring",
      "Code Reviews",
      "Sprint Planning",
      "Technical Strategy",
      "Engineering Standards",
      "Cross-Functional Collaboration",
    ],
  },
  {
    name: "Tools",
    skills: ["Postman", "Figma", "AdobeXD"],
  },
  {
    name: "Languages",
    skills: ["JavaScript", "TypeScript", "Python", "PHP", "Dart", "C++"],
  },
] as const satisfies readonly SkillGroup[];

export const skills = skillGroups;

/** Three rows ordered by layer: interface, systems and data, platform. */
export const marqueeRows = [
  {
    label: "Interface",
    caption: "What people touch",
    direction: "left",
    items: [
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "React Native",
      "Tailwind CSS",
      "Vite",
      "Redux Toolkit",
      "TanStack Query",
      "React Hook Form",
      "Zod",
      "Figma",
    ],
  },
  {
    label: "Systems & data",
    caption: "What keeps it running",
    direction: "right",
    items: [
      "Node.js",
      "NestJS",
      "Express.js",
      "Laravel",
      "FastAPI",
      "PostgreSQL",
      "MySQL",
      "SQLite",
      "MongoDB",
      "Redis",
      "Prisma ORM",
      "Drizzle ORM",
      "Socket.IO",
    ],
  },
  {
    label: "Platform & intelligence",
    caption: "Where it ships",
    direction: "left",
    items: [
      "Docker",
      "Vercel",
      "Cloudflare",
      "Supabase",
      "Firebase",
      "GitHub",
      "Electron.js",
      "MQTT",
      "ESP32",
      "LLM Integration",
      "RAG Systems",
      "Python",
    ],
  },
] as const satisfies readonly MarqueeRow[];

export const allSkills = skillGroups.flatMap((group) => group.skills);
