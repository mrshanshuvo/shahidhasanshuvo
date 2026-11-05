import { connectDB } from "@/lib/mongodb";
import HeroModel from "@/models/Hero";
import SocialLinkModel from "@/models/SocialLink";
import type { Hero } from "@/types";
import HeroClient from "./HeroClient";

export default async function Hero() {
  await connectDB();
  const [heroDoc, socialDocs] = await Promise.all([
    HeroModel.findOne().lean(),
    SocialLinkModel.find().sort({ order: 1 }).lean(),
  ]);

  const raw = heroDoc ? JSON.parse(JSON.stringify(heroDoc)) : {};
  const socials = socialDocs ? JSON.parse(JSON.stringify(socialDocs)) : [];

  const hero: Hero = {
    _id: raw._id?.toString(),
    name: raw.name ?? "Shahid Hasan",
    lastName: raw.lastName ?? "Shuvo",
    typeSequences: raw.typeSequences?.length
      ? raw.typeSequences
      : [{ text: "Full-Stack Web Developer", delay: 2000 }],
    tagline: raw.tagline ?? "Jr. Frontend Developer at Softvence Agency",
    bio: raw.bio ?? "I am a passionate Full-Stack Web Developer and Computer Engineer...",
    profileImage: raw.profileImage ?? "/PP1.jpeg",
    resumeUrl: raw.resumeUrl ?? "/Resume_of_Shahid_Hasan_Shuvo.pdf",
    socialLinks: socials,
  };

  return <HeroClient hero={hero} />;
}
