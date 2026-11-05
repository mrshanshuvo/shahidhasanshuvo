import { connectDB } from "@/lib/mongodb";
import SkillModel from "@/models/Skill";
import TechnologyModel from "@/models/Technology";
import TechModel from "@/models/Tech";
import SkillsClient from "./SkillsClient";

async function getSkillsData() {
  await connectDB();
  const [skillDocs, techDocs, legacyTechDoc] = await Promise.all([
    SkillModel.find().sort({ order: 1 }).lean(),
    TechnologyModel.find().sort({ order: 1 }).lean(),
    TechModel.findOne().lean(),
  ]);

  return {
    expertises: JSON.parse(JSON.stringify(skillDocs)),
    brandTechs: JSON.parse(JSON.stringify(techDocs)),
    techList: legacyTechDoc?.techList || [],
  };
}

export default async function Skills() {
  const { expertises, brandTechs, techList } = await getSkillsData();
  if (
    (!expertises || expertises.length === 0) &&
    (!brandTechs || brandTechs.length === 0)
  )
    return null;
  return (
    <SkillsClient expertises={expertises} brandTechs={brandTechs} techList={techList} />
  );
}
