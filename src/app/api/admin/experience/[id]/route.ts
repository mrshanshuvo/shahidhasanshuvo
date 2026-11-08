import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Experience from "@/models/Experience";
import { revalidatePortfolio } from "@/lib/revalidate";
import { experienceSchema } from "@/lib/validations";

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

  const validation = experienceSchema.partial().safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    );
  }

  const exp = await Experience.findByIdAndUpdate(id, validation.data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidatePortfolio();
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
  revalidatePortfolio();
  return NextResponse.json({ success: true });
}
