import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/cms/server";
import { getCopy } from "@/lib/cms/copy";

export const alt = "Seif Ayman — Senior Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const content = await getSiteContent();
  const siteHostname = new URL(content.seo.siteOrigin).hostname;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 78px",
          background: "#05070a",
          color: "#f5f7fb",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#55b9ff",
              boxShadow: "0 0 36px #55b9ff",
            }}
          />
          <span
            style={{ fontSize: 28, letterSpacing: "0.18em", color: "#aab6c8" }}
          >
            {content.profile.handle.toUpperCase()}
          </span>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.055em",
              lineHeight: 1,
            }}
          >
            {content.profile.name}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 34,
              color: "#55b9ff",
              letterSpacing: "-0.02em",
            }}
          >
            {content.profile.shortRole}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 25,
              lineHeight: 1.35,
              color: "#aab6c8",
            }}
          >
            {getCopy(
              content.copy,
              "social.description",
              content.profile.headline,
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 21,
            color: "#77869c",
          }}
        >
          <span>{content.profile.location}</span>
          <span>{siteHostname}</span>
        </div>
      </div>
    ),
    size,
  );
}
