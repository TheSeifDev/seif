export type SkillGroup = {
  name: string;
  skills: readonly string[];
};

export type MarqueeRow = {
  label: string;
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

export const marqueeRows = [
  {
    label: "BUILD",
    items: [
      "React",
      "TypeScript",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Tailwind CSS",
      "Docker",
      "GitHub",
      "Figma",
      "Supabase",
      "Python",
      "Socket.IO",
    ],
  },
  {
    label: "SHIP",
    items: [
      "JavaScript",
      "React Native",
      "Express.js",
      "MongoDB",
      "Redis",
      "Redux Toolkit",
      "Vite",
      "Cloudflare",
      "Vercel",
      "Firebase",
      "Postman",
      "Electron.js",
    ],
  },
  {
    label: "THINK",
    items: [
      "HTML5",
      "CSS3",
      "NestJS",
      "MySQL",
      "Prisma ORM",
      "FastAPI",
      "TanStack Query",
      "WebSockets",
      "RAG Systems",
      "MQTT",
      "System Design",
      "Clean Architecture",
    ],
  },
] as const satisfies readonly MarqueeRow[];

export const allSkills = skillGroups.flatMap((group) => group.skills);
