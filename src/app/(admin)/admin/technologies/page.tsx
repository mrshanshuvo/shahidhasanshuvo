"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaPlus, FaTimes, FaCheck, FaCode, FaEdit, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminDialogShell } from "../components/AdminDialogShell";
import { AdminField, AdminInput } from "../components/AdminFields";
import ImageUpload from "../components/ImageUpload";
import type { Technology } from "@/types";

export default function AdminTechnologiesPage() {
  const queryClient = useQueryClient();
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [prevData, setPrevData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTech, setCurrentTech] = useState<Technology | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const { data, isLoading: loading } = useQuery({
    queryKey: ["technologies"],
    queryFn: async () => {
      const r = await fetch("/api/admin/technologies");
      if (!r.ok) throw new Error("Failed to fetch technologies");
      return r.json();
    },
  });

  if (data !== prevData) {
    setPrevData(data);
    if (data) {
      setTechnologies(Array.isArray(data) ? data : []);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/technologies?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setTechnologies((prev) => prev.filter((t) => t._id !== id));
      queryClient.invalidateQueries({ queryKey: ["technologies"] });
      showToast("Technology deleted.");
    },
    onError: () => {
      showToast("Failed to delete.", "error");
    },
  });

  async function handleDelete(id: string) {
    deleteMutation.mutate(id);
  }

  const saveMutation = useMutation({
    mutationFn: async (tech: Technology) => {
      const isEdit = !!tech._id;
      const url = isEdit
        ? `/api/admin/technologies?id=${tech._id}`
        : "/api/admin/technologies";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tech),
      });
      if (!res.ok) throw new Error("Failed to save");
      return { isEdit };
    },
    onSuccess: ({ isEdit }) => {
      setIsDialogOpen(false);
      showToast(isEdit ? "Technology updated!" : "Technology added!");
      queryClient.invalidateQueries({ queryKey: ["technologies"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  async function handleAddOrUpdate() {
    if (!currentTech?.name || !currentTech?.iconUrl) {
      showToast("Name and Icon are required", "error");
      return;
    }
    saveMutation.mutate(currentTech);
  }

  function openEdit(tech: Technology) {
    setCurrentTech({ ...tech });
    setIsDialogOpen(true);
  }

  function openNew() {
    setCurrentTech({ name: "", iconUrl: "" });
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
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

      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="animate-in fade-in overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl duration-700 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
          <CardHeader className="p-4 pb-1">
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <FaCode size={20} />
                </div>
                <div>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Brand Tech Registry ({technologies.length})
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-500">
                    Technologies with custom colors & icons selectable in Projects.
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={openNew}
                className="h-9 cursor-pointer rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-95"
              >
                <FaPlus className="mr-1.5" size={10} /> Add Tech
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {loading ? (
              <div className="flex gap-2 p-4">
                <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/20" />
                <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/20" />
              </div>
            ) : (
              <div className="grid min-h-20 grid-cols-2 gap-4 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {technologies.map((t) => (
                  <div
                    key={t._id}
                    className="group relative flex cursor-default flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/5 dark:bg-slate-900/40 dark:hover:shadow-2xl"
                  >
                    {/* Dynamic Brand Glow */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10"
                      style={{ backgroundColor: t.brandColor || "#3b82f6" }}
                    />

                    {/* Top border accent */}
                    <div
                      className="absolute top-0 right-0 left-0 h-1 opacity-50 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ backgroundColor: t.brandColor || "#3b82f6" }}
                    />

                    {/* Icon */}
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                      {t.iconUrl ? (
                        <Image
                          src={t.iconUrl}
                          alt={t.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      ) : (
                        <FaCode className="text-slate-400" size={20} />
                      )}
                    </div>

                    {/* Name */}
                    <span className="z-10 w-full truncate text-center text-xs font-bold text-slate-700 dark:text-slate-200">
                      {t.name}
                    </span>

                    {/* Action Buttons Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/60 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-80">
                      <button
                        onClick={() => openEdit(t)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all hover:scale-110 hover:bg-blue-500 hover:text-white"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id!)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all hover:scale-110 hover:bg-red-500 hover:text-white"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {technologies.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                    <FaCode size={32} className="mb-4 opacity-20" />
                    <p className="text-xs font-bold tracking-widest uppercase">
                      No technologies registered
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AdminDialogShell
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={currentTech?._id ? "Edit Technology" : "Add Technology"}
        subtitle=""
        icon={FaCode}
        iconColor="text-blue-400"
        accentColor="from-blue-500/5 to-cyan-500/5"
        onSave={handleAddOrUpdate}
        saving={saveMutation.isPending}
        saveLabel={currentTech?._id ? "Update Tech" : "Save Tech"}
        savingLabel="Processing..."
        maxWidth="xl"
      >
        {currentTech && (
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="w-40 shrink-0">
              <AdminField label="Logo (SVG/PNG)">
                <ImageUpload
                  value={currentTech.iconUrl || ""}
                  onChange={(val) =>
                    setCurrentTech((prev) => (prev ? { ...prev, iconUrl: val } : null))
                  }
                />
              </AdminField>
            </div>
            <div className="w-full flex-1">
              <AdminField label="Technology Name">
                <AdminInput
                  icon={FaCode}
                  value={currentTech.name}
                  onChange={(e) =>
                    setCurrentTech((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  placeholder="e.g. React"
                />
              </AdminField>
            </div>
          </div>
        )}
      </AdminDialogShell>
    </div>
  );
}
