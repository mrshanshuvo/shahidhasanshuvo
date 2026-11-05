import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Project from "../models/Project";
import Demo from "../models/Demo";
import Technology from "../models/Technology";

// 1. Self-contained .env.local loader
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    console.log("Loading environment from .env.local...");
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.trim().match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        // Remove quotes if present
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  } else {
    console.warn(".env.local not found in current directory!");
  }
}

// 2. Define the project and demo tech stack mappings
const projectTechMapping: Record<string, string[]> = {
  whereisit: ["React", "Node.js", "Express", "MongoDB", "TensorFlow.js", "Firebase"],
  "my-portfolio": ["Next.js", "React", "Tailwind CSS", "Node.js"],
  "car-doctor-nextjs": ["Next.js", "React", "Tailwind CSS", "Node.js"],
  profast: ["React", "Node.js", "Express", "MongoDB", "Leaflet", "Tailwind CSS"],
  mcms: ["React", "Next.js", "Node.js", "MongoDB", "Tailwind CSS"],
};

const demoTechMapping: Record<string, string[]> = {
  "ai-image-classifier": ["TensorFlow.js", "React", "Webcam API"],
  "3d-portfolio-scene": ["Three.js", "R3F", "GLSL"],
};

// All technologies referenced in mappings
const requiredTechNames = Array.from(
  new Set([
    ...Object.values(projectTechMapping).flat(),
    ...Object.values(demoTechMapping).flat(),
  ])
);

async function migrate() {
  loadEnv();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI is not set!");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(uri);
  console.log("Database connected successfully.");

  try {
    // A. ENSURE ALL REQUIRED TECHNOLOGIES EXIST IN DATABASE
    console.log("\n--- Ensuring Technologies Exist ---");
    const existingTechs = await Technology.find().lean();
    const existingTechNamesMap = new Map<string, mongoose.Types.ObjectId>();

    for (const t of existingTechs) {
      existingTechNamesMap.set(
        t.name.toLowerCase().trim(),
        t._id as mongoose.Types.ObjectId
      );
    }

    const techNameMap = new Map<string, mongoose.Types.ObjectId>();

    for (const techName of requiredTechNames) {
      const canonicalKey = techName.toLowerCase().trim();
      const existingId = existingTechNamesMap.get(canonicalKey);

      if (existingId) {
        console.log(`Technology "${techName}" already exists in DB.`);
        techNameMap.set(canonicalKey, existingId);
      } else {
        // Create new Technology brand document
        console.log(`Creating missing technology document for: "${techName}"`);
        const newTech = await Technology.create({
          name: techName,
          iconUrl: "", // Left blank so elegant icon fallback renders until updated with a real Cloudinary SVG
          order: 0,
        });
        techNameMap.set(canonicalKey, newTech._id as mongoose.Types.ObjectId);
      }
    }

    // B. MIGRATE PROJECTS
    console.log("\n--- Migrating Projects ---");
    const projects = await Project.find();
    console.log(`Found ${projects.length} projects to check.`);

    for (const project of projects) {
      console.log(`Processing project: "${project.title}" (slug: "${project.slug}")`);
      const targetTechNames = projectTechMapping[project.slug];

      if (!targetTechNames) {
        console.warn(
          `Warning: No tech mapping defined for project slug "${project.slug}". Skipping tech mapping.`
        );
        continue;
      }

      const technologyIds: mongoose.Types.ObjectId[] = [];
      for (const name of targetTechNames) {
        const id = techNameMap.get(name.toLowerCase().trim());
        if (id) {
          technologyIds.push(id);
        } else {
          console.warn(`Warning: Technology ID not found for "${name}"`);
        }
      }

      console.log(
        `-> Mapping to ${technologyIds.length} technology ObjectIds: [${targetTechNames.join(", ")}]`
      );

      await Project.updateOne(
        { _id: project._id },
        {
          $set: { technologyIds },
          $unset: { skillIds: "" },
        }
      );
      console.log(`-> Updated project "${project.title}" successfully.`);
    }

    // C. MIGRATE PLAYGROUND DEMOS
    console.log("\n--- Migrating Playground Demos ---");
    const demos = await Demo.find();
    console.log(`Found ${demos.length} demos to check.`);

    for (const demo of demos) {
      console.log(`Processing demo: "${demo.title}" (slug: "${demo.slug}")`);
      const targetTechNames = demoTechMapping[demo.slug];

      if (!targetTechNames) {
        console.warn(
          `Warning: No tech mapping defined for demo slug "${demo.slug}". Skipping tech mapping.`
        );
        continue;
      }

      const technologyIds: mongoose.Types.ObjectId[] = [];
      for (const name of targetTechNames) {
        const id = techNameMap.get(name.toLowerCase().trim());
        if (id) {
          technologyIds.push(id);
        } else {
          console.warn(`Warning: Technology ID not found for "${name}"`);
        }
      }

      console.log(
        `-> Mapping to ${technologyIds.length} technology ObjectIds: [${targetTechNames.join(", ")}]`
      );

      await Demo.updateOne(
        { _id: demo._id },
        {
          $set: { technologyIds },
          $unset: { skillIds: "" },
        }
      );
      console.log(`-> Updated demo "${demo.title}" successfully.`);
    }

    console.log("\n🎉 Database migration completed successfully!");
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

migrate();
