"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FaLayerGroup, FaCode } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Skill, Technology } from "@/types";

interface Props {
  expertises: Skill[];
  brandTechs: Technology[];
  techList: string[];
}

export default function SkillsClient({ expertises, brandTechs, techList }: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Fall back to legacy techList strings if no brandTechs exist yet
  const marqueeItems =
    brandTechs.length > 0
      ? brandTechs.map((t) => ({ name: t.name, iconUrl: t.iconUrl }))
      : techList.map((name) => ({ name, iconUrl: undefined }));
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section
      id="skills"
      ref={ref}
      className="relative scroll-mt-28 overflow-hidden bg-white py-16 dark:bg-slate-950"
    >
      <div className="absolute top-20 left-0 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="text-left">
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-3 text-sm font-black tracking-[0.2em] text-emerald-500 uppercase md:text-lg"
            >
              <FaLayerGroup /> Technical Mastery
            </motion.h2>
          </div>
        </motion.div>
        <div className="space-y-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              variants={itemVariants}
              className="rounded-[1rem] border border-slate-200/50 p-10 shadow-xl backdrop-blur-xl dark:border-white/10"
            >
              <div className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
                {expertises.map((skill) => {
                  return (
                    <motion.div key={skill.name} variants={itemVariants}>
                      <div className="flex items-start gap-5">
                        <div className="flex items-center justify-center rounded-2xl transition-transform">
                          {skill.iconUrl ? (
                            <Image
                              src={skill.iconUrl}
                              alt={skill.name}
                              width={50}
                              height={50}
                              className="object-contain"
                            />
                          ) : (
                            <FaCode className="text-3xl text-emerald-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                              {skill.name}
                            </span>
                          </div>
                          <div className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {skill.tech}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Tech banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-8 text-center">
              <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Technologies I Work With
              </h4>
            </div>
            <div className="relative overflow-hidden py-6">
              {/* Premium Gradient Edge Fade Overlays */}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent md:w-32 dark:from-slate-950" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent md:w-32 dark:from-slate-950" />

              <motion.div
                className="flex w-max flex-nowrap"
                animate={{ x: ["0%", "-33.3333%"] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                }}
              >
                {/* Triple the list inside identical tracks to guarantee mathematically perfect seamless looping on any screen size */}
                {[0, 1, 2].map((trackIndex) => (
                  <div key={trackIndex} className="flex shrink-0 gap-12 pr-12">
                    {marqueeItems.map((tech, techIndex) => {
                      return (
                        <Badge
                          key={`${trackIndex}-${techIndex}`}
                          variant="outline"
                          className="flex cursor-default items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 font-medium whitespace-nowrap text-slate-700 shadow-sm transition-all hover:scale-102 hover:border-emerald-500/30 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-400/30 dark:hover:text-emerald-400"
                        >
                          {tech.iconUrl ? (
                            <Image
                              src={tech.iconUrl}
                              alt={tech.name}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          ) : (
                            <FaCode className="text-xl text-slate-400" />
                          )}
                          <span className="text-lg font-bold">{tech.name}</span>
                        </Badge>
                      );
                    })}
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
