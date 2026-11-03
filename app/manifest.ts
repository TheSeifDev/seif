import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Seif Portfolio Dashboard & Inbox",
    short_name: "Seif CMS",
    description:
      "Editorial portfolio CMS, contact inbox, and omnichannel notification center.",
    start_url: "/dashboard/inbox",
    scope: "/",
    display: "standalone",
    background_color: "#f8f4eb",
    theme_color: "#0f766e",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

