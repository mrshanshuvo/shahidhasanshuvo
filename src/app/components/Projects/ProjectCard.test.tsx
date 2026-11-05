import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/types";

// Mock framer-motion to simplify DOM output
const cleanProps = ({
  whileHover,
  whileTap,
  whileInView,
  initial,
  animate,
  transition,
  viewport,
  ...rest
}: any) => rest;

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...cleanProps(props)}>{children}</div>,
  },
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, priority, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockProject: Project = {
  _id: "p1",
  title: "CareCamp Medical Portal",
  slug: "carecamp",
  description: "Comprehensive medical camp management with Stripe billing.",
  image: "https://res.cloudinary.com/demo/image.png",
  featured: true,
  category: ["Full Stack", "Healthcare"],
  techNames: ["Next.js", "React", "TypeScript", "MongoDB", "Tailwind CSS"],
  github: [{ label: "Repository", url: "https://github.com/example/carecamp" }],
  live: [{ label: "Production", url: "https://carecamp.example.com" }],
  improvements: ["Add WebSockets for live status updates"],
};

describe("ProjectCard Component", () => {
  it("renders the project title, description, and details link", () => {
    render(<ProjectCard project={mockProject} index={0} />);

    expect(screen.getByText("CareCamp Medical Portal")).toBeInTheDocument();
    expect(
      screen.getByText("Comprehensive medical camp management with Stripe billing.")
    ).toBeInTheDocument();

    const detailLink = screen.getByRole("link", {
      name: /view project details/i,
    });
    expect(detailLink).toHaveAttribute("href", "/projects/carecamp");
  });

  it("renders featured indicator badge when project.featured is true", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    const featuredEl = screen.getByTitle("Featured Project");
    expect(featuredEl).toBeInTheDocument();
  });

  it("renders category badges and technology stack pills", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    expect(screen.getByText("Full Stack")).toBeInTheDocument();
    expect(screen.getByText("Healthcare")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument(); // 5 techNames -> 4 rendered + 1 overflow
  });

  it("renders the live demo button with secure link attributes", () => {
    render(<ProjectCard project={mockProject} index={0} />);
    const liveLink = screen.getByRole("button", {
      name: /open carecamp medical portal live demo/i,
    });
    expect(liveLink).toHaveAttribute("href", "https://carecamp.example.com");
    expect(liveLink).toHaveAttribute("target", "_blank");
    expect(liveLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
