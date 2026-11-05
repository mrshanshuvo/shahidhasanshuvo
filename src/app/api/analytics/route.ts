import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Visitor from "@/models/Visitor";

export async function POST() {
  try {
    await connectDB();

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    await Visitor.findOneAndUpdate(
      { date: today },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const totalViews = await Visitor.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);

    const recentStats = await Visitor.find().sort({ date: -1 }).limit(7).lean();

    return NextResponse.json({
      total: totalViews[0]?.total || 0,
      recent: recentStats,
    });
  } catch (error) {
    return NextResponse.json({ total: 0, recent: [] });
  }
}
