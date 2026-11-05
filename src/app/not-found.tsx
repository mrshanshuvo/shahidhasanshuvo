"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaHome, FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 dark:bg-slate-950">
      {/* Ambient blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px] dark:bg-emerald-500/10" />
      <div className="absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-500/10" />

      <div className="max-w-2xl text-center">
        {/* Animated 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display bg-linear-to-br from-emerald-400 to-cyan-500 bg-clip-text text-[12rem] leading-none font-black text-transparent select-none md:text-[16rem]"
        >
          404
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="mb-4 flex items-center justify-center gap-3 text-sm font-black tracking-[0.3em] text-emerald-500 uppercase">
            Page Not Found
          </p>
          <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            You&apos;ve wandered off the map
          </h1>
          <p className="mb-10 text-lg leading-relaxed font-medium text-slate-600 dark:text-slate-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 hover:bg-emerald-700"
          >
            <FaHome className="transition-transform group-hover:scale-110" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-8 py-4 font-bold text-slate-900 transition-all hover:scale-105 hover:bg-slate-200 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
