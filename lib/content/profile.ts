// Professional content curated from the user-supplied CV (29 Oct 2026).
// Sources and constraints: docs/content-sources.md. Do not add metrics,
// clients or achievements that are not in that file.

export const profile = {
  name: "Seif Ayman",
  firstName: "Seif",
  lastName: "Ayman",
  fullName: "Seif Ayman Ahmed",
  handle: "TheSeifDev",
  alias: "Professor",
  role: "Senior Full Stack Software Developer",
  shortRole: "Senior Full Stack Developer",
  experienceYears: "5+",
  platforms: "5",
  email: "seif.tanjiro@gmail.com",
  githubUrl: "https://github.com/TheSeifDev",
  location: "Alexandria, Egypt",
  availability: "Open to remote roles and freelance work",
  cvUrl: "/documents/seif-ayman-cv.pdf",
  japaneseMotto: "テクノロジーで、より良い未来をつくる。",
  japaneseMottoMeaning: "Building a better future through technology.",
  headline: "I build products that solve real problems.",
  intro:
    "I architect and deliver production-grade platforms end to end — from TypeScript, React and Next.js interfaces to NestJS and Node.js APIs, PostgreSQL data models and cloud deployment.",
  summary:
    "Senior Full Stack Software Developer who architects and delivers production-grade web platforms end to end. I have shipped five production platforms across education, healthcare and AI-driven products, including a RAG-powered assistant and real-time MQTT/IoT systems. I pair system design, clean architecture and scalable API design with technical leadership: setting engineering standards, driving code reviews and mentoring cross-functional engineers.",
} as const;

export const assets = {
  heroBackground: "/images/hero-landscape.webp",
  heroWorld: "/images/blue-hour-world.webp",
  aboutInk: "/images/about-ink.webp",
  contactScene: "/images/contact-moon.webp",
  portrait: "/images/seif-portrait.webp",
} as const;

export const experience = [
  {
    role: "Lead Full Stack Software Developer & Technical Lead",
    organization: "PHANTOMS Technology Team",
    location: "Alexandria, Egypt",
    period: "2025 — Present",
    points: [
      "Architect and deliver five production platforms spanning web, desktop and IoT, owning every layer from database schema and REST APIs to frontend and deployment.",
      "Define software architecture, API conventions and coding standards for a cross-functional engineering group covering software, UI/UX and hardware.",
      "Lead sprint planning, technical reviews and delivery across concurrent product initiatives, coordinating frontend, backend, AI and IoT workstreams.",
      "Integrate LLM and Retrieval-Augmented Generation (RAG) workflows and real-time MQTT messaging into customer-facing products.",
      "Mentor developers on best practices, code quality and system design.",
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "NestJS",
      "Node.js",
      "PostgreSQL",
      "Supabase",
      "Prisma",
      "Electron",
      "MQTT",
      "RAG",
    ],
  },
  {
    role: "IT Support Team Leader",
    organization: "University IT Club",
    location: "Alexandria, Egypt",
    period: "2024 — Present",
    points: [
      "Lead technical support operations, resolving software, networking and hardware issues to minimize downtime.",
      "Design and deliver technical workshops on IT fundamentals, networking and troubleshooting.",
      "Support IT infrastructure and operations for club-wide initiatives and events.",
    ],
    stack: [],
  },
] as const;

export const education = {
  degree: "Bachelor of Technology in Information Technology",
  institution: "Borg El Arab Technological University",
  period: "2025 — Present",
} as const;

export const training = [
  {
    provider: "Cisco Networking Academy",
    items: ["Internet of Things", "Cybersecurity", "JavaScript Essentials 1"],
  },
  {
    provider: "New Horizons",
    items: ["Full-stack web development"],
  },
] as const;

/** Working principles shown in About. Phrased as approach, not as results. */
export const principles = [
  {
    title: "Modern solutions",
    body: "Scalable web, desktop and mobile applications built on current, well-supported technology.",
    icon: "box",
  },
  {
    title: "Clean code",
    body: "Readable, maintainable code with clear conventions and reviews that keep it that way.",
    icon: "code",
  },
  {
    title: "End-to-end ownership",
    body: "From database schema and APIs to interface and deployment — one accountable owner.",
    icon: "layers",
  },
  {
    title: "User-centred design",
    body: "Complex problems turned into simple, accessible and considered experiences.",
    icon: "user",
  },
] as const;

/** Home Journey chapters — each maps to a CV fact. */
export const journey = [
  {
    id: "foundations",
    index: "01",
    kanji: "基",
    reading: "Kiso",
    meaning: "Foundation",
    period: "5+ years",
    title: "Full-stack foundations",
    body: "Five-plus years of building across every layer — interfaces in React and Next.js, APIs in Node.js, NestJS and Laravel, and relational data in PostgreSQL and MySQL.",
    facts: [
      { label: "Interface", value: "React · Next.js · TypeScript" },
      { label: "Services", value: "Node.js · NestJS · Laravel" },
      { label: "Data", value: "PostgreSQL · MySQL · SQLite" },
    ],
  },
  {
    id: "training",
    index: "02",
    kanji: "学",
    reading: "Manabi",
    meaning: "Learning",
    period: "Formal training",
    title: "Structured learning",
    body: "Cisco Networking Academy courses in IoT, cybersecurity and JavaScript, New Horizons full-stack training, and a Bachelor of Technology in Information Technology in progress.",
    facts: [
      { label: "Cisco", value: "IoT · Cybersecurity · JavaScript" },
      { label: "New Horizons", value: "Full-stack web development" },
      { label: "University", value: "B.Tech IT · 2025 — Present" },
    ],
  },
  {
    id: "community",
    index: "03",
    kanji: "支",
    reading: "Sasae",
    meaning: "Support",
    period: "2024 — Present",
    title: "IT Support Team Leader",
    body: "Leading technical support at the University IT Club — resolving software, networking and hardware issues, running workshops and supporting infrastructure for club-wide events.",
    facts: [
      { label: "Operations", value: "Software · Network · Hardware" },
      { label: "Teaching", value: "Workshops on IT fundamentals" },
      { label: "Scope", value: "Club-wide initiatives & events" },
    ],
  },
  {
    id: "leadership",
    index: "04",
    kanji: "導",
    reading: "Michibiki",
    meaning: "Guidance",
    period: "2025 — Present",
    title: "Lead Developer & Technical Lead",
    body: "At PHANTOMS Technology Team I define architecture, API conventions and coding standards, lead sprint planning and reviews, and mentor engineers across web, desktop, AI and IoT work.",
    facts: [
      { label: "Platforms", value: "Five in production" },
      { label: "Practice", value: "Architecture · Reviews · Mentoring" },
      { label: "Domains", value: "Web · Desktop · AI · IoT" },
    ],
  },
] as const;

/** How I work — Discover, Design, Build, Ship. */
export const processSteps = [
  {
    id: "discover",
    index: "01",
    title: "Discover",
    kanji: "探",
    summary: "Understand the problem, the people and the constraints.",
    detail:
      "Clarify goals, users and success criteria before writing code. Map existing systems, data and risks so the scope is honest.",
    outputs: ["Problem statement", "Scope & constraints", "Technical risks"],
  },
  {
    id: "design",
    index: "02",
    title: "Design",
    kanji: "設",
    summary: "Shape the architecture and the experience together.",
    detail:
      "Choose the data model, API contracts and system boundaries alongside the interface, so both are designed for the same product.",
    outputs: ["Data model", "API conventions", "Interface direction"],
  },
  {
    id: "build",
    index: "03",
    title: "Build",
    kanji: "築",
    summary: "Develop in small, reviewed, testable increments.",
    detail:
      "Ship vertical slices across database, server and UI with code reviews and clear conventions, keeping the codebase readable as it grows.",
    outputs: ["Reviewed increments", "Typed contracts", "Reusable components"],
  },
  {
    id: "ship",
    index: "04",
    title: "Ship",
    kanji: "届",
    summary: "Deploy, measure and keep improving.",
    detail:
      "Configure environments, deploy, and watch real behaviour in production — then iterate on performance, reliability and experience.",
    outputs: ["Deployment", "Environment config", "Iteration plan"],
  },
] as const;

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
