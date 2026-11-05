"use client";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import {
  FaGraduationCap,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaPlus,
  FaMinus,
  FaCalendarAlt,
} from "react-icons/fa";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Education } from "@/types";

interface Props {
  education: Education[];
}

export default function EducationClient({ education }: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);

  const isExpanded = (index: number) => expandedIndices.includes(index);

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section
      id="education"
      ref={ref}
      className="relative scroll-mt-28 overflow-hidden bg-white py-16 dark:bg-slate-950"
    >
      <div className="absolute top-20 left-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute right-0 bottom-20 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />

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
              <FaGraduationCap /> Academic Background
            </motion.h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {education.map((edu, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className=""
            >
              <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-white/50 p-1 shadow-2xl backdrop-blur-2xl transition-all duration-700 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] dark:border-white/5 dark:bg-slate-900/40">
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 h-32 w-32 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />

                <div className="relative flex flex-1 flex-col p-6">
                  <CardHeader className="mb-6 p-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Institution Badge */}
                        {edu.link ? (
                          <a
                            href={edu.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/inst inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-500/10 bg-blue-500/5 px-2.5 py-1 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
                          >
                            <span className="flex items-center gap-1 text-[10px] font-black tracking-[0.15em] text-blue-600 uppercase transition-colors duration-300 group-hover/inst:text-blue-500 dark:text-blue-400 dark:group-hover/inst:text-blue-300">
                              {edu.institution}
                              <FaExternalLinkAlt
                                size={8}
                                className="transition-transform group-hover/inst:translate-x-0.5 group-hover/inst:-translate-y-0.5"
                              />
                            </span>
                          </a>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/10 bg-blue-500/5 px-2.5 py-1 dark:bg-blue-500/10">
                            <div className="h-1 w-1 animate-pulse rounded-full bg-blue-500" />
                            <span className="text-[10px] font-black tracking-[0.15em] text-blue-600 uppercase dark:text-blue-400">
                              {edu.institution}
                            </span>
                          </div>
                        )}

                        <h3 className="font-display text-lg leading-[1.2] font-semibold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-blue-500 md:text-xl dark:text-white">
                          {edu.degree}
                        </h3>
                      </div>

                      {/* Logo Container */}
                      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg transition-all duration-500 group-hover:scale-105 dark:border-slate-700 dark:bg-slate-800">
                        {edu.logo ? (
                          <Image
                            src={edu.logo}
                            alt={edu.institution}
                            fill
                            className="object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="text-3xl font-black text-slate-200 uppercase dark:text-slate-600">
                            {edu.institution.charAt(0)}
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-blue-500/5 to-transparent" />
                      </div>
                    </div>

                    {/* Meta Info Bar */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        <FaCalendarAlt className="text-blue-500/50" size={10} />
                        {edu.period}
                      </div>
                      {edu.location && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                          <FaMapMarkerAlt className="text-blue-500/50" size={10} />
                          {edu.location}
                        </div>
                      )}
                      {edu.gpa && (
                        <Badge className="rounded border-none bg-blue-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-md shadow-blue-500/10">
                          CGPA {edu.gpa}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col p-0">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                          Academic Details
                        </span>
                        <button
                          onClick={() => toggleExpand(index)}
                          aria-label={
                            isExpanded(index)
                              ? "Collapse academic details"
                              : "Expand academic details"
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-md transition-all duration-500 ${
                            isExpanded(index)
                              ? "bg-blue-500 text-white shadow-blue-500/30"
                              : "bg-slate-100 text-slate-500 hover:bg-blue-500 hover:text-white hover:shadow-blue-500/10 dark:bg-slate-800"
                          }`}
                        >
                          {isExpanded(index) ? (
                            <FaMinus size={12} />
                          ) : (
                            <FaPlus size={12} />
                          )}
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded(index) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.5,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 border-l border-blue-500/20 pt-3 pb-5 pl-4">
                              {Array.isArray(edu.details) ? (
                                edu.details.map((detail, dIdx) => (
                                  <motion.p
                                    key={dIdx}
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: dIdx * 0.05 }}
                                    className="flex items-start gap-2.5 text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-300"
                                  >
                                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                                    {detail}
                                  </motion.p>
                                ))
                              ) : (
                                <p className="text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-300">
                                  {edu.details}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
