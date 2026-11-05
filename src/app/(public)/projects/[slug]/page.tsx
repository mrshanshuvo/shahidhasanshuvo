import { connectDB } from "@/lib/mongodb";
import ProjectModel from "@/models/Project";
import { notFound } from "next/navigation";

import Navbar from "@/app/components/Navbar/Navbar";
import HeroModel from "@/models/Hero";

import type { Project } from "@/types";
import type { Metadata } from "next";
import ProjectDetailClient from "./ProjectDetailClient";
import { getIconRegistry } from "@/lib/iconRegistry";
import Technology from "@/models/Technology";
import Category from "@/models/Category";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  const { slug } = await params;
  const project = await ProjectModel.findOne({ slug }).lean();
  if (!project) return { title: "Project Not Found" };

  const title = `${project.title} · Projects`;
  const description = project.description;
  const image = project.image || null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(image
        ? { images: [{ url: image, width: 1200, height: 630, alt: project.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  await connectDB();
  const { slug } = await params;

  const _modelRef = [Technology, Category];
  if (_modelRef.length > 0) {
  }

  const raw = await ProjectModel.findOne({ slug })
    .populate("technologyIds")
    .populate("categoryIds")
    .lean();
  if (!raw) notFound();

  const heroDoc = await HeroModel.findOne().lean();
  const resumeUrl = heroDoc?.resumeUrl || "/Resume_of_Shahid_Hasan_Shuvo.pdf";
  const iconRegistry = await getIconRegistry();

  const mapped = {
    ...raw,
    techNames: Array.isArray(raw.technologyIds)
      ? raw.technologyIds.map((t: any) => t.name || t.toString())
      : [],
    category: Array.isArray(raw.categoryIds)
      ? raw.categoryIds.map((c: any) => c.name || c.toString())
      : [],
  };

  const project: Project = JSON.parse(JSON.stringify(mapped));

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-500/30 dark:bg-[#020617] dark:text-slate-50">
      <Navbar resumeUrl={resumeUrl} />
      <ProjectDetailClient project={project} iconRegistry={iconRegistry} />
    </div>
  );
}
