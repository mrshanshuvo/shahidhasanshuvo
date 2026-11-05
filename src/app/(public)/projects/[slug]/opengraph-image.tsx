import { ImageResponse } from "next/og";
import { connectDB } from "@/lib/mongodb";
import ProjectModel from "@/models/Project";
import Technology from "@/models/Technology";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  await connectDB();
  const { slug } = await params;

  // Ensure Technology model is registered
  if (Technology) {
    // no-op
  }

  const project = await ProjectModel.findOne({ slug }).populate("technologyIds").lean();

  const title = project?.title || "Portfolio Project";
  const description = project?.description
    ? project.description.length > 140
      ? project.description.slice(0, 137) + "..."
      : project.description
    : "Cinematic full-stack project by Shahid Hasan Shovu";

  const techs: string[] = Array.isArray(project?.technologyIds)
    ? (project.technologyIds as any[])
        .map((t) => t?.name)
        .filter(Boolean)
        .slice(0, 6)
    : [];

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
          "radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.2), transparent 45%), radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.18), transparent 50%)",
        padding: "60px 70px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f8fafc",
        position: "relative",
      }}
    >
      {/* Top Header */}
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
            padding: "8px 18px",
            borderRadius: "9999px",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#34d399",
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
            }}
          />
          Featured Project Showcase
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "18px",
            fontWeight: 500,
            color: "#94a3b8",
          }}
        >
          Shahid Hasan Shovu · Portfolio
        </div>
      </div>

      {/* Center: Project Title & Summary */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: "56px",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#ffffff",
            maxWidth: "1050px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "26px",
            fontWeight: 400,
            color: "#94a3b8",
            lineHeight: 1.4,
            maxWidth: "960px",
          }}
        >
          {description}
        </div>
      </div>

      {/* Bottom: Tech Badges */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          width: "100%",
        }}
      >
        {techs.length > 0 ? (
          techs.map((tech) => (
            <div
              key={tech}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#e2e8f0",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {tech}
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#e2e8f0",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Full-Stack Application
          </div>
        )}
      </div>
    </div>,
    {
      ...size,
    }
  );
}
