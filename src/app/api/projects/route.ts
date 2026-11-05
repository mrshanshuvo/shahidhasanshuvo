import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Technology from "@/models/Technology";
import Category from "@/models/Category";

// Public: GET /api/projects — used by portfolio pages
export async function GET() {
  await connectDB();
  // Ensure target schemas are registered before populate is called
  const _modelRef = [Technology, Category];
  if (_modelRef.length > 0) {
    /* register model check */
  }
  const projects = await Project.find()
    .populate("technologyIds")
    .populate("categoryIds")
    .sort({ order: 1, createdAt: -1 })
    .lean();

  const mappedProjects = projects.map((p: any) => ({
    ...p,
    techNames: Array.isArray(p.technologyIds)
      ? p.technologyIds.map((t: any) => t.name || t.toString())
      : [],
    category: Array.isArray(p.categoryIds)
      ? p.categoryIds.map((c: any) => c.name || c.toString())
      : [],
  }));

  return NextResponse.json(mappedProjects, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
