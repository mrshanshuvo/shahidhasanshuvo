"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Demo } from "@/types";
import PlaygroundCard from "@/app/components/Playground/PlaygroundCard";
import { Button } from "@/components/ui/button";
import { FaFlask } from "react-icons/fa";

interface Props {
  demos: Demo[];
}

export default function PlaygroundArchiveClient({ demos }: Props) {
  const [activeTech, setActiveTech] = useState("All");

  const allTech = ["All", ...Array.from(new Set(demos.flatMap((d) => d.tech)))];

  const filteredDemos =
    activeTech === "All" ? demos : demos.filter((demo) => demo.tech.includes(activeTech));

  return (
    <div className="relative min-h-screen overflow-hidden bg-white pt-32 pb-24 dark:bg-slate-950">
      {/* Cinematic Background */}
      <div className="absolute top-0 left-1/2 -z-10 h-full w-full -translate-x-1/2">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-pink-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center justify-center gap-3 text-sm font-black tracking-[0.3em] text-purple-500 uppercase"
          >
            <FaFlask /> The Technical Lab
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-5xl font-black tracking-tight text-slate-900 md:text-7xl dark:text-white"
          >
            Interactive{" "}
            <span className="bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Playground
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-400"
          >
            Where ideas take shape. A collection of experiments, prototypes, and technical
            explorations.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 flex flex-wrap justify-center gap-2"
        >
          {allTech.map((tech) => (
            <Button
              key={tech}
              onClick={() => setActiveTech(tech)}
              variant={activeTech === tech ? "default" : "outline"}
              className={`rounded-full px-5 py-2 text-xs font-black transition-all ${
                activeTech === tech
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "border-slate-200 bg-slate-100 text-slate-600 hover:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              {tech}
            </Button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredDemos.map((demo, i) => (
              <motion.div
                key={demo._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <PlaygroundCard demo={demo} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredDemos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <p className="text-xl font-medium text-slate-500">
              No experiments found with this technology.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
