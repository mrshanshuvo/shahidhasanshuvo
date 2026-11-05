import { ImageResponse } from "next/og";

export const alt = "Shahid Hasan Shovu – Full-Stack Developer & ML Engineer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#020617",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.18), transparent 40%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.15), transparent 45%)",
        padding: "60px 70px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f8fafc",
        position: "relative",
      }}
    >
      {/* Top Header Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            borderRadius: "9999px",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#34d399",
            fontSize: "17px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
            }}
          />
          Available for Opportunities
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "19px",
            fontWeight: 500,
            color: "#94a3b8",
            letterSpacing: "-0.01em",
          }}
        >
          shahidhasanshuvo.vercel.app
        </div>
      </div>

      {/* Center: Name & Headline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div
          style={{
            fontSize: "68px",
            fontWeight: 900,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <span>Shahid Hasan</span>
          <span
            style={{
              color: "#10b981",
            }}
          >
            Shovu
          </span>
        </div>

        <div
          style={{
            fontSize: "30px",
            fontWeight: 400,
            color: "#94a3b8",
            lineHeight: 1.35,
            maxWidth: "920px",
          }}
        >
          Full-Stack Developer & Machine Learning Engineer building cinematic,
          high-performance web applications.
        </div>
      </div>

      {/* Bottom: Tech Badges */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          width: "100%",
        }}
      >
        {[
          "Next.js 16",
          "React 19",
          "TypeScript",
          "Python",
          "Node.js",
          "MongoDB Atlas",
          "Machine Learning",
          "Tailwind CSS",
        ].map((tech) => (
          <div
            key={tech}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#e2e8f0",
              fontSize: "17px",
              fontWeight: 600,
            }}
          >
            {tech}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
    }
  );
}
