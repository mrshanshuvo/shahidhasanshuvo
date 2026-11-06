"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Hero } from "@/types";
import { FaSave, FaCheck, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { HeroIdentitySection } from "./_components/HeroIdentitySection";
import { HeroBioEditor } from "./_components/HeroBioEditor";
import { TypeSequenceSection } from "./_components/TypeSequenceSection";

const DEFAULT: Hero = {
  name: "Shahid Hasan",
  lastName: "Shovu",
  typeSequences: [
    { text: "Full-Stack Web Developer", delay: 2000 },
    { text: "Computer Engineer", delay: 2000 },
  ],
  tagline: "Jr. Frontend Developer at Softvence Agency",
  bio: "I am a passionate Full-Stack Web Developer and Computer Engineer...",
  profileImage: "/PP1.jpeg",
  resumeUrl: "/Resume_of_Shahid_Hasan_Shuvo.pdf",
  socialLinks: [],
};

function HeroFormClient({ initialData }: { initialData: Hero }) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Hero>(initialData);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const saveMutation = useMutation({
    mutationFn: async (heroData: Hero) => {
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(heroData),
      });
      if (!res.ok) throw new Error("Failed to save hero");
      return heroData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero"] });
      showToast("Hero section saved successfully!");
    },
    onError: () => {
      showToast("Failed to save changes.", "error");
    },
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={cn(
              "fixed top-8 left-1/2 z-50 flex items-center gap-3 rounded-2xl border px-6 py-3 shadow-2xl backdrop-blur-xl",
              toast.type === "success"
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                : "border-red-500/50 bg-red-500/20 text-red-400"
            )}
          >
            <div
              className={cn(
                "rounded-full p-1.5",
                toast.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20"
              )}
            >
              {toast.type === "success" ? <FaCheck size={10} /> : <FaTimes size={10} />}
            </div>
            <span className="text-sm font-bold tracking-tight">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-350 space-y-6">
        <div className="space-y-8">
          <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-700 md:grid-cols-2">
            <HeroIdentitySection data={data} onChange={setData} />

            <div className="flex flex-col gap-6">
              <HeroBioEditor
                bio={data.bio}
                onChange={(bio) => setData((d) => ({ ...d, bio }))}
              />
              <TypeSequenceSection
                typeSequences={data.typeSequences}
                onChange={(updater) =>
                  setData((d) => ({
                    ...d,
                    typeSequences: updater(d.typeSequences),
                  }))
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed right-10 bottom-10 z-50">
        <Button
          onClick={() => saveMutation.mutate(data)}
          disabled={saveMutation.isPending}
          className="group rounded-xl bg-emerald-600 p-6 text-base font-black text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 active:scale-95"
        >
          <FaSave
            className={cn(
              "mr-1 transition-transform duration-500",
              saveMutation.isPending ? "animate-spin" : "group-hover:rotate-12"
            )}
            size={20}
          />
          {saveMutation.isPending ? "Saving DNA..." : "Apply Changes"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminHeroPage() {
  const { data: fetchedData, isLoading: loading } = useQuery({
    queryKey: ["hero"],
    queryFn: async () => {
      const r = await fetch("/api/admin/hero");
      if (!r.ok) throw new Error("Failed to fetch hero");
      return r.json();
    },
  });

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="mx-auto max-w-350 space-y-6">
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/20 dark:shadow-none">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800/40" />
                      <div className="space-y-2">
                        <div className="h-5 w-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
                        <div className="h-3 w-48 animate-pulse rounded-lg bg-slate-800/30" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="h-12 animate-pulse rounded-2xl bg-slate-800/20" />
                      <div className="h-12 animate-pulse rounded-2xl bg-slate-800/20" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const initialData =
    fetchedData && Object.keys(fetchedData).length
      ? { ...DEFAULT, ...fetchedData }
      : DEFAULT;

  return <HeroFormClient initialData={initialData} />;
}
