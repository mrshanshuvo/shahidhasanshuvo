"use client";
import { motion } from "framer-motion";
import { Certification } from "../../../types";
import { FaAward } from "react-icons/fa";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

interface CertificationsViewProps {
  certifications: Certification[];
}

export default function CertificationsView({ certifications }: CertificationsViewProps) {
  return (
    <section
      id="certifications"
      className="scroll-mt-28 bg-slate-50 py-16 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="text-left">
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-3 text-sm font-black tracking-[0.2em] text-emerald-500 uppercase md:text-xl"
            >
              <FaAward /> Academic & Credentials
            </motion.h2>
          </div>
        </motion.div>

        <div className="group/list flex flex-col gap-12 px-12 lg:gap-8">
          {certifications.map((cert, idx) => (
            <motion.div
              key={cert._id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:group-hover/list:opacity-50 lg:hover:opacity-100!"
            >
              {/* Hover Background Overlay */}
              <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-xl transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-200/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg dark:lg:group-hover:bg-slate-800/50" />

              {/* Date Column */}
              <header
                className="z-10 mt-1 mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase sm:col-span-2"
                aria-label={cert.date}
              >
                {cert.date}
              </header>

              {/* Content Column */}
              <div className="z-10 sm:col-span-6">
                <h3 className="leading-snug font-medium text-slate-900 dark:text-slate-200">
                  {cert.certificateFile ? (
                    <a
                      href={cert.certificateFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center gap-2 text-lg leading-tight font-bold text-slate-900 transition-colors group-hover:text-emerald-600 md:text-xl dark:text-slate-200 dark:group-hover:text-emerald-400"
                    >
                      {cert.badgeLogo && (
                        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white/5 md:h-6 md:w-6">
                          <Image
                            src={cert.badgeLogo}
                            alt={cert.issuer}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="inline-flex flex-wrap items-baseline">
                        {cert.title} <span className="mx-1.5 opacity-50">·</span>{" "}
                        <span className="inline-block">{cert.issuer}</span>
                      </span>
                      <ArrowUpRight className="ml-1 inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-lg leading-tight font-bold text-slate-900 transition-colors group-hover:text-emerald-600 md:text-xl dark:text-slate-200 dark:group-hover:text-emerald-400">
                      {cert.badgeLogo && (
                        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white/5 md:h-6 md:w-6">
                          <Image
                            src={cert.badgeLogo}
                            alt={cert.issuer}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="inline-flex flex-wrap items-baseline">
                        {cert.title} <span className="mx-1.5 opacity-50">·</span>{" "}
                        <span className="inline-block">{cert.issuer}</span>
                      </span>
                    </div>
                  )}
                </h3>

                {cert.details && cert.details.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {cert.details.map((detail, dIdx) => (
                      <span
                        key={dIdx}
                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
