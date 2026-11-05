import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Experience from "@/models/Experience";
import Project from "@/models/Project";
import Education from "@/models/Education";
import Certification from "@/models/Certification";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const [experienceCount, projectCount, educationCount, certificationCount, blogCount] =
      await Promise.all([
        Experience.countDocuments(),
        Project.countDocuments(),
        Education.countDocuments(),
        Certification.countDocuments(),
        Blog.countDocuments(),
      ]);

    return NextResponse.json({
      experience: experienceCount > 0,
      projects: projectCount > 0,
      education: educationCount > 0,
      certifications: certificationCount > 0,
      blog: blogCount > 0,
    });
  } catch (error) {
    console.error("Error fetching navigation presence status:", error);
    // Fallback to showing all tabs if db query fails
    return NextResponse.json({
      experience: true,
      projects: true,
      education: true,
      certifications: true,
      blog: true,
    });
  }
}
