"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaExternalLinkAlt, FaCode } from "react-icons/fa";
import type { Project } from "@/types";

import ProjectCard from "./ProjectCard";

interface Props {
  projects: Project[];
  iconRegistry: Record<string, string>;
}

export default function ProjectsClient({ projects, iconRegistry }: Props) {
  return (
    <section id="projects" className="scroll-mt-28 bg-white py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-left"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-sm font-black tracking-[0.2em] text-emerald-500 uppercase md:text-lg"
            >
              <FaCode /> Featured Projects
            </motion.h2>
          </motion.div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex shrink-0"
          >
            <Link
              href="/projects"
              className="group flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              View All Projects
              <FaExternalLinkAlt
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                size={12}
              />
            </Link>
          </motion.div>
        </div>

        {/* Featured grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard
              key={project._id ?? project.slug}
              project={project}
              index={i}
              iconRegistry={iconRegistry}
            />
          ))}
        </div>

        {projects.length === 0 && (
          <p className="py-20 text-center text-slate-400">No featured projects yet.</p>
        )}
      </div>
    </section>
  );
}
