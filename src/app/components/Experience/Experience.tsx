import { connectDB } from "@/lib/mongodb";
import ExperienceModel from "@/models/Experience";
import type { Experience } from "@/types";
import ExperienceClient from "./ExperienceClient";

async function getExperiences() {
  await connectDB();
  const raw = await ExperienceModel.find().sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(raw));
}

export default async function Experience() {
  const experiences = await getExperiences();
  return <ExperienceClient experiences={experiences} />;
}
