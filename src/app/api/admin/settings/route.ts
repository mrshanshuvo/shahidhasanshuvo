import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    let settings = await Setting.findOne().lean();
    if (!settings) {
      settings = await Setting.create({});
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await connectDB();

    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
