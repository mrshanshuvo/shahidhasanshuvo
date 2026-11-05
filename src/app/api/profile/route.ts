import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Hero from "@/models/Hero";
import SocialLink from "@/models/SocialLink";
import Skill from "@/models/Skill";
import Technology from "@/models/Technology";
import Certification from "@/models/Certification";
import Blog from "@/models/Blog";
import Demo from "@/models/Demo";

export async function GET() {
  await connectDB();

  const [hero, socialLinks, skills, technologies, certifications, blogs, demos] =
    await Promise.all([
      Hero.findOne().lean(),
      SocialLink.find().sort({ order: 1 }).lean(),
      Skill.find().sort({ order: 1 }).lean(),
      Technology.find().sort({ order: 1 }).lean(),
      Certification.find().sort({ order: 1 }).lean(),
      Blog.find().sort({ order: 1 }).lean(),
      Demo.find().sort({ order: 1 }).lean(),
    ]);

  const profile = {
    ...(hero || {}),
    socialLinks: socialLinks || [],
    skills: skills || [],
    technologies: technologies || [],
    certifications: certifications || [],
    blogs: blogs || [],
    demos: demos || [],
  };

  return NextResponse.json(profile, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
