import { connectDB } from "@/lib/mongodb";
import DemoModel from "@/models/Demo";
import PlaygroundClient from "./PlaygroundClient";
import { getIconRegistry } from "@/lib/iconRegistry";
import Technology from "@/models/Technology";

async function getDemos(): Promise<any[]> {
  await connectDB();
  // Ensure target schemas are registered before populate is called
  const _modelRef = [Technology];
  if (_modelRef.length > 0) {
  }

  const raw = await DemoModel.find()
    .populate("technologyIds")
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const mapped = raw.map((d: any) => ({
    ...d,
    tech: Array.isArray(d.technologyIds)
      ? d.technologyIds.map((t: any) => t.name || t.toString())
      : [],
  }));

  return JSON.parse(JSON.stringify(mapped));
}

export default async function Playground() {
  const demos = await getDemos();
  if (!demos || demos.length === 0) return null;
  const iconRegistry = await getIconRegistry();
  return <PlaygroundClient demos={demos} iconRegistry={iconRegistry} />;
}
