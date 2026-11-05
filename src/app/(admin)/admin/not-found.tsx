"use client";

import { motion } from "framer-motion";
import { FaSearch, FaArrowRight, FaHome } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <Card className="overflow-hidden rounded-2xl border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-2xl">
          <CardContent className="p-10 text-center md:p-14">
            <div className="relative mb-8 inline-block">
              <div className="absolute inset-0 scale-150 rounded-full bg-blue-500/20 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-slate-950 text-blue-400">
                <FaSearch size={32} />
              </div>
            </div>

            <h2 className="mb-4 text-3xl font-black tracking-tight text-white">
              Route <span className="text-blue-400">Not Found</span>
            </h2>

            <p className="mb-10 text-lg leading-relaxed font-medium text-slate-400">
              The administrative module you are looking for does not exist or has been
              relocated within the system.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/admin" className="w-full sm:w-auto">
                <Button className="w-full rounded-2xl bg-blue-600 px-8 py-6 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105 hover:bg-blue-500">
                  <FaHome className="mr-2 text-xs" />
                  Admin Overview
                </Button>
              </Link>

              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="w-full rounded-2xl px-8 py-6 text-slate-500 hover:bg-white/5 hover:text-white sm:w-auto"
              >
                Go Back
                <FaArrowRight className="ml-2 text-xs" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
