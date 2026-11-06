import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Demo from "@/models/Demo";
import Technology from "@/models/Technology";
import { revalidatePortfolio } from "@/lib/revalidate";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const item = await Demo.findById(id).populate("technologyIds").lean();
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const it = item as any;
      return NextResponse.json({
        ...it,
        tech: Array.isArray(it.technologyIds)
          ? it.technologyIds.map((t: any) => t.name || t.toString())
          : [],
      });
    }

    const data = await Demo.find().populate("technologyIds").sort({ order: 1 }).lean();
    const sanitized = data.map((d: any) => ({
      ...d,
      tech: Array.isArray(d.technologyIds)
        ? d.technologyIds.map((t: any) => t.name || t.toString())
        : [],
    }));
    return NextResponse.json(sanitized);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();

    // Map tech names to technologyIds
    const techList = Array.isArray(body.tech) ? body.tech : [];
    const techs = await Technology.find({ name: { $in: techList } });
    const technologyIds = techs.map((t) => t._id);

    const lastItem = await Demo.findOne().sort({ order: -1 });
    const order = lastItem ? lastItem.order + 1 : 0;

    const newItem = await Demo.create({
      ...body,
      technologyIds,
      order,
    });
    revalidatePortfolio(["/playground"]);
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (id) {
      // Map tech names to technologyIds if present in body
      let updatePayload = { ...body };
      if (body.tech) {
        const techList = Array.isArray(body.tech) ? body.tech : [];
        const techs = await Technology.find({ name: { $in: techList } });
        updatePayload.technologyIds = techs.map((t) => t._id);
      }

      const updated = await Demo.findByIdAndUpdate(id, updatePayload, {
        returnDocument: "after",
      });
      if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
      revalidatePortfolio(["/playground"]);
      return NextResponse.json(updated);
    }

    if (Array.isArray(body)) {
      const updates = body.map((item, idx) =>
        Demo.findByIdAndUpdate(item._id, { order: idx })
      );
      await Promise.all(updates);
      revalidatePortfolio(["/playground"]);
      return NextResponse.json({ message: "Order updated" });
    }

    return NextResponse.json({ error: "ID or array required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const deleted = await Demo.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    revalidatePortfolio(["/playground"]);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const items = await req.json();

    if (Array.isArray(items)) {
      // Resolve all technologyIds in a batch
      const allTechNames = Array.from(
        new Set(items.flatMap((it: any) => (Array.isArray(it.tech) ? it.tech : [])))
      );
      const allTechs = await Technology.find({ name: { $in: allTechNames } });
      const techsMap = new Map(allTechs.map((t) => [t.name, t._id]));

      const updates = items.map((item, idx) => {
        const techList = Array.isArray(item.tech) ? item.tech : [];
        const technologyIds = techList
          .map((name: string) => techsMap.get(name))
          .filter(Boolean);

        return Demo.findByIdAndUpdate(
          item._id,
          { ...item, technologyIds, order: idx },
          { upsert: true }
        );
      });
      await Promise.all(updates);
      revalidatePortfolio(["/playground"]);
      return NextResponse.json({ message: "Bulk saved" });
    }

    return NextResponse.json({ error: "Array required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
