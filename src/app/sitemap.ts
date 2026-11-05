import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import ProjectModel from "@/models/Project";
import DemoModel from "@/models/Demo";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shahidhasanshuvo.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  // Fetch all published project and demo slugs
  const [projects, demos] = await Promise.all([
    ProjectModel.find({}, { slug: 1, updatedAt: 1 }).sort({ order: 1 }).lean(),
    DemoModel.find({}, { slug: 1, updatedAt: 1 }).sort({ order: 1 }).lean(),
  ]);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/playground`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic project routes
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE_URL}/projects/${project.slug}`,
    lastModified: project.updatedAt ?? new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Dynamic playground routes
  const playgroundRoutes: MetadataRoute.Sitemap = demos.map((demo) => ({
    url: `${BASE_URL}/playground/${demo.slug}`,
    lastModified: demo.updatedAt ?? new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes, ...playgroundRoutes];
}
