import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Experience from "@/models/Experience";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const exp = await Experience.findByIdAndUpdate(id, body, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(exp);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  await Experience.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
