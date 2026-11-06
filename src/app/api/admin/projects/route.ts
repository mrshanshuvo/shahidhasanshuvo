import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Technology from "@/models/Technology";
import Category from "@/models/Category";
import { revalidatePortfolio } from "@/lib/revalidate";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const projects = await Project.find()
      .populate("technologyIds")
      .populate("categoryIds")
      .sort({ order: 1 })
      .lean();

    // Sanitize for frontend consistency (self-healing on read) and map to legacy fields
    const sanitized = projects.map((p: any) => ({
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
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const items: any[] = await req.json();

    // Clean slate synchronization
    await Project.deleteMany({});

    if (items.length > 0) {
      // Find all unique techNames and category names inside items to do a single batch query for ObjectIds
      const allTechNames = Array.from(
        new Set(
          items.flatMap((it: any) => (Array.isArray(it.techNames) ? it.techNames : []))
        )
      );
      const allCategoryNames = Array.from(
        new Set(
          items.flatMap((it: any) =>
            Array.isArray(it.category)
              ? it.category
              : it.category
                ? [it.category]
                : ["Full Stack"]
          )
        )
      );

      const [allTechs, allCategories] = await Promise.all([
        Technology.find({ name: { $in: allTechNames } }),
        Category.find({
          $or: [
            { name: { $in: allCategoryNames } },
            {
              slug: {
                $in: allCategoryNames.map((c) => c.toLowerCase().replace(/ /g, "-")),
              },
            },
          ],
        }),
      ]);

      const techsMap = new Map(allTechs.map((t) => [t.name, t._id]));
      const categoriesMap = new Map(allCategories.map((c) => [c.name, c._id]));
      const categoriesSlugMap = new Map(allCategories.map((c) => [c.slug, c._id]));

      const sanitized = items.map((it: any, i: number) => {
        let media = Array.isArray(it.media) ? it.media : [];
        if (media.length === 0 && it.image) {
          media = [{ type: "image", url: it.image, caption: "Project Showcase" }];
        }

        const techList = Array.isArray(it.techNames) ? it.techNames : [];
        const technologyIds = techList
          .map((name: string) => techsMap.get(name))
          .filter(Boolean);

        const categoryList = Array.isArray(it.category)
          ? it.category
          : it.category
            ? [it.category]
            : ["Full Stack"];
        const categoryIds = categoryList
          .map((name: string) => {
            return (
              categoriesMap.get(name) ||
              categoriesSlugMap.get(name.toLowerCase().replace(/ /g, "-"))
            );
          })
          .filter(Boolean);

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
            ? it.github.map((g: any) => ({
                label: g.label || "Repository",
                url: g.url || "",
              }))
            : it.github
              ? [{ label: "Repository", url: it.github }]
              : [],
          live: Array.isArray(it.live)
            ? it.live.map((l: any) => ({
                label: l.label || "Live Demo",
                url: l.url || "",
              }))
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
          order: i,
        };
      });

      await Project.insertMany(sanitized);
    }

    revalidatePortfolio(["/projects", "/sitemap.xml"]);

    return NextResponse.json({ message: "Projects synchronized" });
  } catch (error: any) {
    console.error("Project Sync Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save" },
      { status: 500 }
    );
  }
}
