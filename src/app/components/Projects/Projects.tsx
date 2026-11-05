import { connectDB } from "@/lib/mongodb";
import ProjectModel from "@/models/Project";
import ProjectsClient from "./ProjectsClient";
import { getIconRegistry } from "@/lib/iconRegistry";
import Technology from "@/models/Technology";
import Category from "@/models/Category";

async function getProjects() {
  await connectDB();
  // Ensure target schemas are registered before populate is called
  const _modelRef = [Technology, Category];
  if (_modelRef.length > 0) {
  }

  const raw = await ProjectModel.find({ featured: true })
    .populate("technologyIds")
    .populate("categoryIds")
    .sort({ order: 1, createdAt: -1 })
    .lean();

  const mapped = raw.map((p: any) => ({
    ...p,
    techNames: Array.isArray(p.technologyIds)
      ? p.technologyIds.map((t: any) => t.name || t.toString())
      : [],
    category: Array.isArray(p.categoryIds)
      ? p.categoryIds.map((c: any) => c.name || c.toString())
      : [],
  }));

  // Ensure deep serialization of subdocuments (github/live links)
  return JSON.parse(JSON.stringify(mapped));
}

export default async function Projects() {
  const projects = await getProjects();
  const iconRegistry = await getIconRegistry();
  return <ProjectsClient projects={projects} iconRegistry={iconRegistry} />;
}
