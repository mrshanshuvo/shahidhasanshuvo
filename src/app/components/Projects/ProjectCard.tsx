"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaExternalLinkAlt, FaStar } from "react-icons/fa";
import type { Project } from "@/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProjectCard({
  project,
  index,
  iconRegistry,
}: {
  project: Project;
  index: number;
  iconRegistry?: Record<string, string>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative h-100 w-full sm:h-112.5"
    >
      <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]">
        <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-20">
          <span className="sr-only">View Project Details</span>
        </Link>

        {/* Full Card Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={project.image || "/images/placeholder.png"}
            alt={project.title}
            fill
            priority={index < 4}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-slate-900/10 opacity-90 transition-opacity duration-500 group-hover:opacity-85" />
        </div>

        {/* Top Section: Badges & Live Button */}
        <div className="pointer-events-none absolute top-5 right-5 left-5 z-30 flex items-start justify-between">
          {/* Left: Featured Icon & Categories */}
          <div className="pointer-events-auto flex max-w-[calc(100%-60px)] flex-wrap gap-2">
            {project.featured && (
              <div
                className="flex shrink-0 items-center justify-center rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold tracking-widest text-white uppercase shadow-lg"
                title="Featured Project"
              >
                <FaStar className="text-xs" />
              </div>
            )}
            {Array.isArray(project.category)
              ? project.category.map((cat) => (
                  <div
                    key={cat}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg backdrop-blur-md dark:bg-black/40"
                  >
                    {cat}
                  </div>
                ))
              : project.category && (
                  <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg backdrop-blur-md dark:bg-black/40">
                    {project.category}
                  </div>
                )}
          </div>

          <div className="pointer-events-auto shrink-0">
            {project.live && project.live.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                nativeButton={false}
                render={
                  <a
                    href={project.live[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="rounded-full border border-white/20 bg-white/10 p-7 text-white shadow-lg backdrop-blur-md transition-colors hover:border-emerald-400/50 hover:bg-white/10 hover:text-emerald-400"
                title="Live Demo"
              >
                <FaExternalLinkAlt className="size-6 drop-shadow-sm" />
              </Button>
            )}
          </div>
        </div>

        {/* Floating Content at Bottom */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-30 flex flex-col p-6">
          <div className="mb-3">
            <h3 className="font-display line-clamp-1 flex items-center gap-1.5 text-2xl font-bold text-emerald-400 drop-shadow-md transition-colors duration-300 group-hover:text-emerald-300">
              <span>{project.title}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="inline-block h-5 w-5 shrink-0 opacity-60 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100 motion-reduce:transition-none"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </h3>
          </div>

          <p className="mb-6 line-clamp-2 text-sm leading-relaxed font-medium text-slate-300 drop-shadow-sm transition-colors duration-300 group-hover:text-slate-100">
            {project.description}
          </p>

          {/* Tech stack */}
          <div className="pointer-events-auto flex flex-wrap gap-2">
            {(project.techNames || []).slice(0, 4).map((name) => {
              const iconUrl = iconRegistry?.[name];
              return (
                <Badge
                  key={name}
                  variant="outline"
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5 text-[10px] font-bold text-emerald-300 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-emerald-400/40 group-hover:bg-emerald-500/20 group-hover:text-emerald-200 dark:bg-emerald-950/40"
                  title={name}
                >
                  {iconUrl && (
                    <Image
                      src={iconUrl}
                      alt={name}
                      width={14}
                      height={14}
                      className="shrink-0 object-contain"
                    />
                  )}
                  {name}
                </Badge>
              );
            })}
            {(project.techNames || []).length > 4 && (
              <Badge
                variant="outline"
                className="flex items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5 text-[10px] font-bold text-emerald-300 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-emerald-400/40 group-hover:bg-emerald-500/20 group-hover:text-emerald-200 dark:bg-emerald-950/40"
              >
                +{(project.techNames?.length || 0) - 4}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
