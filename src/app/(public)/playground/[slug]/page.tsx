import { connectDB } from "@/lib/mongodb";
import DemoModel from "@/models/Demo";
import { notFound } from "next/navigation";

import Navbar from "@/app/components/Navbar/Navbar";
import HeroModel from "@/models/Hero";

import type { Demo } from "@/types";
import type { Metadata } from "next";
import PlaygroundDetailClient from "./PlaygroundDetailClient";
import { getIconRegistry } from "@/lib/iconRegistry";
import Technology from "@/models/Technology";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  const { slug } = await params;
  const demo = await DemoModel.findOne({ slug }).lean();
  if (!demo) return { title: "Experiment Not Found" };

  const title = `${demo.title} · Interactive Playground`;
  const description = demo.description;
  const image =
    demo.image ||
    demo.media?.find((m) => m.type === "image")?.url ||
    "/favicons/android-chrome-512x512.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: demo.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PlaygroundDetailPage({ params }: Props) {
  await connectDB();
  const { slug } = await params;

  const _modelRef = [Technology];
  if (_modelRef.length > 0) {
  }

  const raw = await DemoModel.findOne({ slug }).populate("technologyIds").lean();
  if (!raw) notFound();

  const heroDoc = await HeroModel.findOne().lean();
  const resumeUrl = heroDoc?.resumeUrl || "/Resume_of_Shahid_Hasan_Shuvo.pdf";

  const mapped = {
    ...raw,
    tech: Array.isArray(raw.technologyIds)
      ? raw.technologyIds.map((t: any) => t.name || t.toString())
      : [],
  };

  const demo: Demo = JSON.parse(JSON.stringify(mapped));

  const iconRegistry = await getIconRegistry();

  return (
    <>
      <Navbar resumeUrl={resumeUrl} />
      <PlaygroundDetailClient demo={demo} iconRegistry={iconRegistry} />
    </>
  );
}
