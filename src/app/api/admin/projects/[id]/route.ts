import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Technology from "@/models/Technology";
import Category from "@/models/Category";
import { revalidatePortfolio } from "@/lib/revalidate";

type Params = { params: Promise<{ id: string }> };

async function sanitizeProject(it: any) {
  let media = Array.isArray(it.media) ? it.media : [];
  if (media.length === 0 && it.image) {
    media = [{ type: "image", url: it.image, caption: "Project Showcase" }];
  }

  // Retrieve technology ObjectIds for matching techNames
  const techNames = Array.isArray(it.techNames) ? it.techNames : [];
  const techs = await Technology.find({ name: { $in: techNames } });
  const technologyIds = techs.map((t) => t._id);

  // Retrieve category ObjectIds for matching categories
  const categoryNames = Array.isArray(it.category)
    ? it.category
    : it.category
      ? [it.category]
      : ["Full Stack"];
  const categories = await Category.find({
    $or: [
      { name: { $in: categoryNames } },
      {
        slug: {
          $in: categoryNames.map((c: string) => c.toLowerCase().replace(/ /g, "-")),
        },
      },
    ],
  });
  const categoryIds = categories.map((c: any) => c._id);

  return {
    title: it.title,
    slug:
      it.slug ||
      it.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""),
    description: it.description,
    image: it.image || (media[0]?.type === "image" ? media[0].url : ""),
    technologyIds,
    categoryIds,
    github: Array.isArray(it.github)
      ? it.github.map((g: any) => ({ label: g.label || "Repository", url: g.url || "" }))
      : it.github
        ? [{ label: "Repository", url: it.github }]
        : [],
    live: Array.isArray(it.live)
      ? it.live.map((l: any) => ({ label: l.label || "Live Demo", url: l.url || "" }))
      : it.live
        ? [{ label: "Live Demo", url: it.live }]
        : [],
    featured: !!it.featured,
    improvements: Array.isArray(it.improvements) ? it.improvements : [],
    media: media.map((m: any) => ({
      type: ["image", "video", "embed"].includes(m.type) ? m.type : "image",
      url: m.url || "",
      caption: m.caption || "",
      thumbnail: m.thumbnail || "",
    })),
    order: it.order ?? 0,
  };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const project = await Project.findById(id)
      .populate("technologyIds")
      .populate("categoryIds")
      .lean();
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const p = project as any;
    // Map backend relation ObjectIds back to string arrays for admin frontend compatibility
    return NextResponse.json({
      ...p,
      techNames: Array.isArray(p.technologyIds)
        ? p.technologyIds.map((t: any) => t.name || t.toString())
        : [],
      category: Array.isArray(p.categoryIds)
        ? p.categoryIds.map((c: any) => c.name || c.toString())
        : [],
      github: Array.isArray(p.github)
        ? p.github
        : p.github
          ? [{ label: "Repository", url: p.github }]
          : [],
      live: Array.isArray(p.live)
        ? p.live
        : p.live
          ? [{ label: "Live Demo", url: p.live }]
          : [],
      media: Array.isArray(p.media) ? p.media : [],
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const sanitized = await sanitizeProject(body);

    const updated = await Project.findByIdAndUpdate(id, sanitized, {
      returnDocument: "after",
    })
      .populate("technologyIds")
      .populate("categoryIds")
      .lean();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const u = updated as any;
    revalidatePortfolio(["/projects", `/projects/${u.slug}`, "/sitemap.xml"]);

    return NextResponse.json({
      ...u,
      techNames: Array.isArray(u.technologyIds)
        ? u.technologyIds.map((t: any) => t.name || t.toString())
        : [],
      category: Array.isArray(u.categoryIds)
        ? u.categoryIds.map((c: any) => c.name || c.toString())
        : [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    await Project.findByIdAndDelete(id);
    revalidatePortfolio(["/projects", "/sitemap.xml"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
