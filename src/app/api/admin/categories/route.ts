import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const categories = await Category.find().sort({ order: 1 }).lean();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const items: any[] = await req.json();

    // Clean slate synchronization
    await Category.deleteMany({});

    if (items.length > 0) {
      const sanitized = items.map((it, idx) => {
        const name = (it.name || "Uncategorized").trim();
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");
        return {
          name,
          slug,
          order: it.order ?? idx,
        };
      });
      await Category.insertMany(sanitized);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}
