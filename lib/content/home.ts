// User-approved professional content, curated from the supplied CV (29 Oct 2026).
export const profile = {
  name: "Seif Ayman",
  fullName: "Seif Ayman Ahmed",
  handle: "TheSeifDev",
  alias: "Professor / Prof.",
  role: "Senior Full Stack Software Developer",
  experience: "5+",
  platforms: "05",
  githubUrl: "https://github.com/TheSeifDev",
  email: "seif.tanjiro@gmail.com",
  location: "Alexandria, Egypt",
  availability: "Open to remote opportunities",
  cvUrl: "/documents/seif-ayman-cv.pdf",
  summary:
    "I architect and build production-grade platforms, from thoughtful React and Next.js interfaces to NestJS APIs, PostgreSQL data models, and cloud delivery.",
} as const;

export const assets = {
  hero: "/images/blue-hour-world.webp",
  about: "/images/about-ink.webp",
  contact: "/images/contact-moon.webp",
  portrait: "/images/seif-portrait.webp",
} as const;

export const experience = [
  {
    role: "Lead Full Stack Developer & Technical Lead",
    organization: "PHANTOMS Technology Team",
    period: "2025 — Present",
    detail:
      "Architecture, engineering standards, code reviews, and mentoring across web, desktop, AI, and IoT products.",
  },
  {
    role: "IT Support Team Leader",
    organization: "University IT Club",
    period: "2024 — Present",
    detail:
      "Leading technical support, workshops, and infrastructure operations.",
  },
] as const;

export const education = {
  degree: "Bachelor of Technology in Information Technology",
  institution: "Borg El Arab Technological University",
  period: "2025 — Present",
} as const;
