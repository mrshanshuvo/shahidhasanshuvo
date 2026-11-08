import { describe, it, expect } from "vitest";
import {
  blogSchema,
  demoSchema,
  projectSchema,
  socialLinkSchema,
  educationSchema,
  certificationSchema,
  expertiseSchema,
  experienceSchema,
  heroSchema,
  technologySchema,
  settingSchema,
} from "./validations";

describe("Zod Validation Schemas", () => {
  describe("blogSchema", () => {
    it("validates a complete blog post", () => {
      const valid = {
        title: "Mastering Next.js 16",
        description: "A deep dive into Next.js 16 features",
        link: "https://example.com/blog/nextjs-16",
        date: "2026-11-08T00:00:00.000Z",
        tags: ["Next.js", "React"],
        image: "https://example.com/cover.png",
        order: 1,
      };
      const result = blogSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects blog post with empty title or invalid URL", () => {
      const invalid = {
        title: "",
        link: "not-a-valid-url",
      };
      const result = blogSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("demoSchema", () => {
    it("validates a valid playground experiment", () => {
      const valid = {
        title: "AI Shader Lab",
        url: "https://shaderlab.demo",
        tech: ["Three.js", "GLSL"],
        featured: true,
      };
      const result = demoSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when url is not valid", () => {
      const result = demoSchema.safeParse({ title: "Demo", url: "bad-url" });
      expect(result.success).toBe(false);
    });
  });

  describe("projectSchema", () => {
    it("validates a valid project payload", () => {
      const valid = {
        title: "Portfolio 2026",
        slug: "portfolio-2026",
        description: "Modern portfolio application",
        featured: true,
      };
      const result = projectSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when title is empty", () => {
      const result = projectSchema.safeParse({ title: "   " });
      expect(result.success).toBe(false);
    });
  });

  describe("socialLinkSchema", () => {
    it("validates a social link", () => {
      const valid = {
        label: "GitHub",
        href: "https://github.com/mrshanshuvo",
      };
      const result = socialLinkSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails without label or valid URL", () => {
      const result = socialLinkSchema.safeParse({ label: "", href: "bad" });
      expect(result.success).toBe(false);
    });
  });

  describe("educationSchema", () => {
    it("validates valid academic record", () => {
      const valid = {
        degree: "B.Sc in Computer Science",
        institution: "State University",
        period: "2020 - 2024",
      };
      const result = educationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when institution or degree is missing", () => {
      const result = educationSchema.safeParse({ degree: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("certificationSchema", () => {
    it("validates credential", () => {
      const valid = {
        title: "AWS Certified Developer",
        issuer: "Amazon Web Services",
      };
      const result = certificationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when issuer is missing", () => {
      const result = certificationSchema.safeParse({ title: "Cert", issuer: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("expertiseSchema", () => {
    it("validates technical domain", () => {
      const valid = {
        name: "Full Stack Development",
        tech: "React, Node.js, Next.js",
      };
      const result = expertiseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when name is empty", () => {
      const result = expertiseSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("experienceSchema", () => {
    it("validates professional experience item", () => {
      const valid = {
        title: "Software Engineer",
        org: "Tech Innovations Inc.",
        duration: "2024 - Present",
        details: ["Built full-stack applications"],
      };
      const result = experienceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when title, org, or duration is empty", () => {
      const result = experienceSchema.safeParse({ title: "", org: "", duration: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("heroSchema", () => {
    it("validates hero identity configuration", () => {
      const valid = {
        name: "Shahid Hasan",
        lastName: "Shovu",
        tagline: "Full-Stack Engineer",
      };
      const result = heroSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when name is empty", () => {
      const result = heroSchema.safeParse({ name: "", lastName: "Shovu" });
      expect(result.success).toBe(false);
    });
  });

  describe("technologySchema", () => {
    it("validates valid technology record", () => {
      const valid = {
        name: "Next.js",
        iconUrl: "/icons/nextjs.svg",
        brandColor: "#000000",
      };
      const result = technologySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when name or iconUrl is empty", () => {
      const result = technologySchema.safeParse({ name: "", iconUrl: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("settingSchema", () => {
    it("validates global site settings", () => {
      const valid = {
        siteName: "Shahid Hasan Shovu Portfolio",
        siteDescription: "Senior Full Stack Engineer",
        contactEmail: "shovu@example.com",
        accentColor: "emerald",
      };
      const result = settingSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails on invalid email", () => {
      const result = settingSchema.safeParse({ contactEmail: "not-an-email" });
      expect(result.success).toBe(false);
    });
  });
});
