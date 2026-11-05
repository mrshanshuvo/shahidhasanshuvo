"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/types";
import ProjectCard from "@/app/components/Projects/ProjectCard";
import { Button } from "@/components/ui/button";
import { FaArchive } from "react-icons/fa";

interface Props {
  projects: Project[];
  iconRegistry?: Record<string, string>;
}

export default function ProjectsArchiveClient({ projects, iconRegistry }: Props) {
  const [activeCategory, setActiveCategory] = useState("All");

  const allCats = projects.flatMap((p) =>
    Array.isArray(p.category) ? p.category : p.category ? [p.category] : []
  );
  const categories = ["All", ...Array.from(new Set(allCats))];

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) =>
          Array.isArray(p.category)
            ? p.category.includes(activeCategory)
            : p.category === activeCategory
        );

  return (
    <div className="relative min-h-screen overflow-hidden bg-white pt-32 pb-24 dark:bg-slate-950">
      {/* Cinematic Background */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-full w-full -translate-x-1/2">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center justify-center gap-3 text-sm font-black tracking-[0.3em] text-emerald-500 uppercase"
          >
            <FaArchive /> The Complete Archive
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-5xl font-black tracking-tight text-slate-900 md:text-7xl dark:text-white"
          >
            Technical{" "}
            <span className="bg-linear-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Showcases
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-400"
          >
            A curated collection of production applications, custom packages, and
            open-source contributions.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 flex flex-wrap justify-center gap-3"
        >
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setActiveCategory(category)}
              variant={activeCategory === category ? "default" : "outline"}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                activeCategory === category
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : "text-slate-600 hover:border-emerald-500 dark:text-slate-400"
              }`}
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project._id || project.slug}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={project} index={i} iconRegistry={iconRegistry} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <p className="text-xl font-medium text-slate-500">
              No projects found in this category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
