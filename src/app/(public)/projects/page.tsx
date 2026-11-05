import { connectDB } from "@/lib/mongodb";
import ProjectModel from "@/models/Project";
import type { Project } from "@/types";
import ProjectsArchiveClient from "./ProjectsArchiveClient";
import Navbar from "@/app/components/Navbar/Navbar";
import HeroModel from "@/models/Hero";
import type { Metadata } from "next";
import { getIconRegistry } from "@/lib/iconRegistry";
import Technology from "@/models/Technology";
import Category from "@/models/Category";

export const metadata: Metadata = {
  title: "Projects Archive | Shahid Hasan Shovu",
  description:
    "A comprehensive showcase of my technical projects across various domains.",
};

async function getProjects(): Promise<Project[]> {
  await connectDB();
  const _modelRef = [Technology, Category];
  if (_modelRef.length > 0) {
  }

  const raw = await ProjectModel.find()
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

  return JSON.parse(JSON.stringify(mapped));
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  const iconRegistry = await getIconRegistry();

  // Need this for Navbar consistency
  const heroDoc = await HeroModel.findOne().lean();

  const resumeUrl = heroDoc?.resumeUrl || "/Resume_of_Shahid_Hasan_Shuvo.pdf";

  return (
    <>
      <Navbar resumeUrl={resumeUrl} />
      <ProjectsArchiveClient projects={projects} iconRegistry={iconRegistry} />
    </>
  );
}
