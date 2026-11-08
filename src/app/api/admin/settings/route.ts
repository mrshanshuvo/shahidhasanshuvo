import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { auth } from "@/lib/auth";
import { revalidatePortfolio } from "@/lib/revalidate";
import { settingSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const validation = settingSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    await connectDB();

    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: validation.data },
      { upsert: true, returnDocument: "after" }
    );

    revalidatePortfolio();

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
