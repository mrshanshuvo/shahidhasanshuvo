import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Technology from "@/models/Technology";
import Category from "@/models/Category";

// Public: GET /api/projects/[slug]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectDB();
  const { slug } = await params;
  const _modelRef = [Technology, Category];
  if (_modelRef.length > 0) {
    /* register model check */
  }

  const project = await Project.findOne({ slug })
    .populate("technologyIds")
    .populate("categoryIds")
    .lean();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mappedProject = {
    ...project,
    techNames: Array.isArray(project.technologyIds)
      ? project.technologyIds.map((t: any) => t.name || t.toString())
      : [],
    category: Array.isArray(project.categoryIds)
      ? project.categoryIds.map((c: any) => c.name || c.toString())
      : [],
  };

  return NextResponse.json(mappedProject);
}
