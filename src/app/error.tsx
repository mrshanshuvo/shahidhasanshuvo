"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaRedo, FaHome } from "react-icons/fa";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6 dark:bg-slate-950">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 h-full w-full">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-red-500/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl backdrop-blur-2xl md:p-12 dark:border-white/10 dark:bg-slate-900/50"
      >
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10">
          <FaExclamationTriangle className="text-3xl text-red-500" />
        </div>

        <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl dark:text-white">
          System <span className="text-red-500">Anomaly</span>
        </h1>

        <p className="mb-8 text-lg leading-relaxed font-medium text-slate-600 dark:text-slate-400">
          The application encountered an unexpected runtime exception. Our systems have
          been alerted, but you can try to recover the session.
        </p>

        {error.digest && (
          <div className="mb-8 rounded-xl border border-slate-200 bg-slate-100 p-3 dark:border-white/5 dark:bg-slate-950/50">
            <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
              Error Digest: {error.digest}
            </p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => reset()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-8 py-4 font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:scale-105 hover:bg-red-500 sm:w-auto"
          >
            <FaRedo className="text-sm" />
            Retry System
          </button>

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-8 py-4 font-bold text-slate-900 transition-all hover:bg-slate-200 sm:w-auto dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <FaHome className="text-sm" />
            Back to Safety
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
