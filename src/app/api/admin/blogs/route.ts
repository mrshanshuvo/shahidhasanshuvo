import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { revalidatePortfolio } from "@/lib/revalidate";
import { blogSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const item = await Blog.findById(id);
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(item);
    }

    const data = await Blog.find().sort({ order: 1 }).lean();
    return NextResponse.json(data);
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

    const validation = blogSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const lastItem = await Blog.findOne().sort({ order: -1 });
    const order = lastItem ? lastItem.order + 1 : 0;

    const newItem = await Blog.create({ ...validation.data, order });
    revalidatePortfolio(["/blog", "/feed.xml", "/sitemap.xml"]);
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
      const updated = await Blog.findByIdAndUpdate(id, body, { returnDocument: "after" });
      if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
      revalidatePortfolio(["/blog", "/feed.xml", "/sitemap.xml"]);
      return NextResponse.json(updated);
    }

    if (Array.isArray(body)) {
      const updates = body.map((item, idx) =>
        Blog.findByIdAndUpdate(item._id, { order: idx })
      );
      await Promise.all(updates);
      revalidatePortfolio(["/blog", "/feed.xml", "/sitemap.xml"]);
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

    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    revalidatePortfolio(["/blog", "/feed.xml", "/sitemap.xml"]);
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
      const updates = items.map((item, idx) =>
        Blog.findByIdAndUpdate(item._id, { ...item, order: idx }, { upsert: true })
      );
      await Promise.all(updates);
      revalidatePortfolio(["/blog", "/feed.xml", "/sitemap.xml"]);
      return NextResponse.json({ message: "Bulk saved" });
    }

    return NextResponse.json({ error: "Array required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
