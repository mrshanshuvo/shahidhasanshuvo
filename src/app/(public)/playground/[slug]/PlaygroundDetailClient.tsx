"use client";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaGlobe,
  FaCodeBranch,
  FaFlask,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import type { Demo } from "@/types";

interface PlaygroundDetailClientProps {
  demo: Demo;
  iconRegistry?: Record<string, string>;
}

export default function PlaygroundDetailClient({
  demo,
  iconRegistry,
}: PlaygroundDetailClientProps) {
  const coverImage = demo.image || demo.media?.find((m) => m.type === "image")?.url || "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Background Noise & Vibrant Radial Mesh Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] h-[60%] w-[60%] rounded-full bg-purple-500/10 blur-[140px]" />
        <div className="absolute top-[20%] right-[-10%] h-[60%] w-[60%] rounded-full bg-pink-500/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[50%] w-[50%] rounded-full bg-indigo-500/5 blur-[140px]" />
      </div>

      <section className="relative z-10 mx-auto mt-10 max-w-350 space-y-8 px-4 py-20 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/playground"
            className="group inline-flex items-center gap-2 rounded-full border border-white/5 bg-slate-900/80 px-4 py-2 text-xs font-bold tracking-widest text-slate-400 uppercase shadow-lg backdrop-blur-md transition-all hover:bg-slate-800/80 hover:text-white"
          >
            <FaArrowLeft className="text-[10px] transition-transform group-hover:-translate-x-1" />
            Back to Lab
          </Link>
          {demo.featured && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1.5 text-[10px] font-black tracking-widest text-amber-400 uppercase shadow-md shadow-amber-500/5">
              Featured Experiment
            </span>
          )}
        </div>

        {/* Cinematic Title Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="bg-linear-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-3xl leading-[1.1] font-black tracking-tight text-transparent sm:text-4xl lg:text-5xl">
            {demo.title}
          </h1>
        </motion.div>

        {/* Master Bento Grid */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* COLUMN 1-8: Left Side Content (Showcase, Story) */}
          <div className="space-y-8 lg:col-span-8">
            {/* CARD 1: Main High-Fi Showcase Screen */}
            {coverImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              >
                {/* Ambient light overlay */}
                <div className="absolute inset-0 z-10 bg-linear-to-t from-slate-950/40 via-transparent to-slate-950/20" />
                <Image
                  src={coverImage}
                  alt={demo.title}
                  fill
                  className="z-0 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                  sizes="(max-width: 1200px) 100vw, 80vw"
                  priority
                />
              </motion.div>
            )}

            {/* CARD 2: Description Case Study */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-900/30 p-8 shadow-xl backdrop-blur-2xl md:p-12"
            >
              <div className="absolute top-0 left-0 h-0.5 w-24 bg-linear-to-r from-purple-500 to-pink-500" />
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-purple-400 uppercase">
                  <FaFlask /> Lab Experiment Case Study
                </h2>
                <h3 className="text-2xl font-black tracking-wider text-white uppercase sm:text-3xl">
                  The Story
                </h3>
                <p className="text-lg leading-relaxed font-medium text-slate-300">
                  {demo.description}
                </p>
              </div>
            </motion.div>
          </div>

          {/* COLUMN 9-12: Right Side Sidebar Bento Cards (Links, Tech Stack) */}
          <div className="space-y-8 lg:sticky lg:top-32 lg:col-span-4">
            {/* CARD 3: High-End Launchpad Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative space-y-6 overflow-hidden rounded-xl border border-white/5 bg-slate-900/40 p-8 shadow-xl backdrop-blur-2xl"
            >
              <div className="space-y-1">
                <h2 className="text-xs font-black tracking-[0.2em] text-purple-400 uppercase">
                  Launchpad
                </h2>
                <h3 className="text-2xl font-black tracking-wider text-white uppercase">
                  Interactive Links
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {/* Live Link */}
                {demo.url && (
                  <a
                    href={demo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${demo.title} live experiment`}
                    className="group flex items-center justify-between rounded-lg bg-purple-600 p-4 text-sm font-black text-white shadow-lg shadow-purple-950/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-xl hover:shadow-purple-500/20"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="rounded-md bg-white/10 p-2.5">
                        <FaGlobe className="text-base" />
                      </div>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-sm font-black">Live Experiment</span>
                        <span className="text-[10px] font-semibold tracking-wider text-white/70 uppercase">
                          Open Lab Demo
                        </span>
                      </div>
                    </div>
                    <FaExternalLinkAlt className="text-xs opacity-80 transition-transform group-hover:translate-x-0.5" />
                  </a>
                )}

                {/* GitHub Link */}
                {demo.github && (
                  <a
                    href={demo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${demo.title} source code on GitHub`}
                    className="hover:bg-slate-850 group flex items-center justify-between rounded-lg border border-white/5 bg-slate-900 p-4 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="rounded-md border border-white/5 bg-slate-800 p-2.5">
                        <FaGithub className="text-base" />
                      </div>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-sm font-black">Source Code</span>
                        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                          Git Repository
                        </span>
                      </div>
                    </div>
                    <FaCodeBranch className="text-xs text-slate-400 transition-transform group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>
            </motion.div>

            {/* CARD 4: Tech Stack Matrix Grid */}
            {demo.tech && demo.tech.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6 rounded-xl border border-white/5 bg-slate-900/40 p-8 shadow-xl backdrop-blur-2xl"
              >
                <div className="space-y-1">
                  <h2 className="text-xs font-black tracking-[0.2em] text-purple-400 uppercase">
                    Tech Matrix
                  </h2>
                  <h3 className="text-2xl font-black tracking-wider text-white uppercase">
                    Technology Stack
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  {demo.tech.map((name) => {
                    const iconUrl = iconRegistry?.[name];
                    return (
                      <div
                        key={name}
                        className="group flex flex-col items-center justify-center rounded-lg border border-white/5 bg-slate-950/40 p-4 text-center shadow-sm transition-all duration-300 hover:border-purple-500/20 hover:shadow-md hover:shadow-purple-500/5"
                      >
                        {iconUrl ? (
                          <Image
                            src={iconUrl}
                            alt={name}
                            width={32}
                            height={32}
                            className="mb-2 shrink-0 object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-800 text-xs font-bold text-slate-500">
                            {name[0]}
                          </div>
                        )}
                        <span className="text-[11px] font-bold tracking-wide text-slate-400 transition-colors group-hover:text-slate-200">
                          {name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Full Width Gallery */}
        {demo.media && demo.media.length > 0 && (
          <div className="space-y-8 pt-8">
            <div className="space-y-2 text-center">
              <h2 className="text-xs font-black tracking-[0.2em] text-purple-400 uppercase">
                Visual Showcase
              </h2>
              <h3 className="text-3xl font-black tracking-widest text-white uppercase sm:text-4xl">
                Experiment Gallery
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {demo.media.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
                >
                  {m.type === "video" ? (
                    <video
                      src={m.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                    />
                  ) : m.type === "embed" ? (
                    <iframe
                      src={m.url}
                      className="h-full w-full border-0"
                      allowFullScreen
                    />
                  ) : (
                    <Image
                      src={m.url}
                      alt={m.caption || `${demo.title} screenshot ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                  {m.caption && (
                    <div className="absolute right-0 bottom-0 left-0 z-20 translate-y-full bg-slate-950/85 p-4 backdrop-blur-md transition-transform duration-500 ease-out group-hover:translate-y-0">
                      <p className="text-center text-xs font-bold tracking-wide text-white">
                        {m.caption}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
