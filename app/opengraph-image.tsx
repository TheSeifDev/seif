import { ImageResponse } from "next/og";

export const alt = "Seif Ayman — Senior Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          <span style={{ fontSize: 28, letterSpacing: "0.18em", color: "#aab6c8" }}>
            THESEIFDEV
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-0.055em", lineHeight: 1 }}>
            Seif Ayman
          </div>
          <div style={{ marginTop: 24, fontSize: 34, color: "#55b9ff", letterSpacing: "-0.02em" }}>
            Senior Full Stack Developer
          </div>
          <div style={{ marginTop: 24, fontSize: 25, lineHeight: 1.35, color: "#aab6c8" }}>
            Production-grade web, desktop, AI and IoT products — owned end to end.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21, color: "#77869c" }}>
          <span>Alexandria, Egypt</span>
          <span>prof-zeta-one.vercel.app</span>
        </div>
      </div>
    ),
    size,
  );
}
