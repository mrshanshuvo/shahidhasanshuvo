import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Hero from "@/models/Hero";
import SocialLink from "@/models/SocialLink";
import { revalidatePortfolio } from "@/lib/revalidate";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const hero = await Hero.findOne().lean();
  const socialLinks = await SocialLink.find().sort({ order: 1 }).lean();

  return NextResponse.json({
    ...(hero ?? {}),
    socialLinks: socialLinks || [],
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await request.json();

  const heroData = { ...body };
  const socialLinks = body.socialLinks;

  delete heroData._id;
  delete heroData.socialLinks;

  // 1. Update Hero
  const hero = await Hero.findOneAndUpdate({}, heroData, {
    returnDocument: "after",
    upsert: true,
    runValidators: true,
  });

  revalidatePortfolio();

  return NextResponse.json({ ...hero.toObject(), socialLinks });
}
