"use client";
import { FaBriefcase, FaLink } from "react-icons/fa";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Experience } from "@/types";

interface Props {
  experiences: Experience[];
}

export default function ExperienceClient({ experiences }: Props) {
  return (
    <section id="experience" className="scroll-mt-28 bg-slate-50 py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="text-left">
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-3 text-sm font-black tracking-[0.2em] text-emerald-500 uppercase md:text-xl"
            >
              <FaBriefcase /> Professional History
            </motion.h2>
          </div>
        </motion.div>

        {experiences.length === 0 ? (
          <p className="text-center text-slate-400">No entries yet.</p>
        ) : (
          <div className="group/list flex flex-col gap-12 px-12 lg:gap-8">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp._id ?? i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:group-hover/list:opacity-50 lg:hover:opacity-100!"
              >
                {/* Hover Background */}
                <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-xl transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-200/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg dark:lg:group-hover:bg-slate-800/50" />

                {/* Date Column */}
                <header
                  className="z-10 mt-1 mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase sm:col-span-2"
                  aria-label={exp.duration}
                >
                  {exp.duration}
                </header>

                {/* Content Column */}
                <div className="z-10 sm:col-span-6">
                  <h3 className="leading-snug font-medium text-slate-900 dark:text-slate-200">
                    {exp.url ? (
                      <a
                        href={exp.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group/link inline-flex items-baseline text-lg leading-tight font-bold text-slate-900 transition-colors group-hover:text-emerald-600 md:text-xl dark:text-slate-200 dark:group-hover:text-emerald-400"
                      >
                        <span>
                          {exp.title} · <span className="inline-block">{exp.org}</span>
                        </span>
                        <ArrowUpRight className="ml-1 inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                      </a>
                    ) : (
                      <div className="inline-flex items-baseline text-lg leading-tight font-bold text-slate-900 transition-colors group-hover:text-emerald-600 md:text-xl dark:text-slate-200 dark:group-hover:text-emerald-400">
                        <span>
                          {exp.title} · <span className="inline-block">{exp.org}</span>
                        </span>
                      </div>
                    )}
                  </h3>

                  {exp.previousTitles && exp.previousTitles.length > 0 && (
                    <div className="mt-1 mb-2 flex flex-col gap-1">
                      {exp.previousTitles.map((prev, idx) => (
                        <div
                          key={idx}
                          className="text-base font-medium text-slate-500 dark:text-slate-400"
                        >
                          {prev}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 md:text-base dark:text-slate-400">
                    {exp.details.map((item, idx) => (
                      <p key={idx}>{item}</p>
                    ))}
                  </div>

                  {exp.links && exp.links.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      {exp.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400"
                        >
                          <FaLink size={12} />
                          <span>{link.label || link.url}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {exp.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
