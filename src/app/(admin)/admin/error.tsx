"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FaExclamationCircle, FaSyncAlt, FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Module Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="overflow-hidden rounded-2xl border-red-500/20 bg-slate-900/40 shadow-2xl shadow-red-500/5 backdrop-blur-2xl">
          <CardContent className="p-8 text-center md:p-12">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <FaExclamationCircle className="text-2xl text-red-500" />
            </div>

            <h2 className="mb-3 text-2xl font-black tracking-tight text-white">
              Module <span className="text-red-500">Failed</span> to Load
            </h2>

            <p className="mb-8 text-sm leading-relaxed font-medium text-slate-400">
              We encountered a runtime error while synchronizing this module. This is
              usually temporary and can be resolved by re-attempting the data fetch.
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => reset()}
                className="w-full rounded-2xl bg-red-600 py-6 font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-500"
              >
                <FaSyncAlt className="mr-2 text-xs" />
                Retry Module Initialization
              </Button>

              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="w-full rounded-2xl py-6 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <FaArrowLeft className="mr-2 text-xs" />
                Return to Previous Section
              </Button>
            </div>

            {error.digest && (
              <p className="mt-8 font-mono text-[10px] tracking-widest text-slate-700 uppercase">
                ID: {error.digest}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
