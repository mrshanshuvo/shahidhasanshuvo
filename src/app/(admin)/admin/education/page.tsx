"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FaPlus, FaCheck, FaTimes, FaGraduationCap } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SortableEduRow, EduOverlay, type Education } from "./_components/EducationRow";
import { EducationDialog } from "./_components/EducationDialog";

export default function AdminEducationPage() {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<Education[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEdu, setCurrentEdu] = useState<Education | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const { data: fetchedData, isLoading: loading } = useQuery<Education[]>({
    queryKey: ["education"],
    queryFn: async () => {
      const r = await fetch("/api/admin/education");
      if (!r.ok) throw new Error("Failed to fetch education records");
      return r.json();
    },
  });

  const data: Education[] = localData ?? fetchedData ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/education?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setLocalData((prev) => (prev ?? data).filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["education"] });
      showToast("Education record deleted.");
      setDeletingId(null);
    },
    onError: () => {
      showToast("Failed to delete.", "error");
      setDeletingId(null);
    },
  });

  async function handleDelete(id: string) {
    setDeletingId(id);
    deleteMutation.mutate(id);
  }

  const saveMutation = useMutation({
    mutationFn: async (edu: Education) => {
      const isEdit = !!edu._id;
      const url = isEdit ? `/api/admin/education?id=${edu._id}` : "/api/admin/education";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edu),
      });
      if (!res.ok) throw new Error("Failed to save");
      return { isEdit };
    },
    onSuccess: ({ isEdit }) => {
      setIsDialogOpen(false);
      setLocalData(null);
      showToast(isEdit ? "Record updated!" : "Record added!");
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  function handleSave(edu: Education) {
    if (!edu.degree || !edu.institution) return;
    saveMutation.mutate(edu);
  }

  function openEdit(edu: Education) {
    setCurrentEdu({ ...edu });
    setIsDialogOpen(true);
  }

  function openNew() {
    setCurrentEdu({
      degree: "",
      institution: "",
      location: "",
      logo: "",
      period: "",
      gpa: "",
      details: [],
      link: "",
      order: data.length,
    });
    setIsDialogOpen(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item._id === active.id);
      const newIndex = data.findIndex((item) => item._id === over.id);
      const newData = arrayMove(data, oldIndex, newIndex);
      setLocalData(newData);

      fetch("/api/admin/education", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["education"] }));
    }
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
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

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Academic Background
            </h1>
            <p className="text-xs text-slate-500">
              Manage degrees, institutions, GPA, and academic milestones.
            </p>
          </div>

          <Button
            onClick={openNew}
            className="h-10 rounded-xl bg-blue-600 px-6 text-xs font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
          >
            <FaPlus className="mr-2" size={12} /> Add Education
          </Button>
        </div>

        <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Academic Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/20"
                  />
                ))}
              </div>
            ) : data.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm dark:border-white/5 dark:bg-slate-950/20 dark:shadow-none">
                <FaGraduationCap
                  className="mx-auto mb-4 text-slate-200 dark:text-slate-800"
                  size={40}
                />
                <p className="font-medium text-slate-400 dark:text-slate-500">
                  No education history found. Add your first record above.
                </p>
              </div>
            ) : (
              <SortableContext
                items={data.map((s) => s._id!)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {data.map((edu) => (
                      <SortableEduRow
                        key={edu._id}
                        edu={edu}
                        onEdit={() => openEdit(edu)}
                        onDelete={() => handleDelete(edu._id!)}
                        isDeleting={deletingId === edu._id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            )}

            {!loading && data.length > 0 && (
              <p className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-700 uppercase">
                Drag rows to reorder • Changes save automatically
              </p>
            )}
          </CardContent>
        </Card>

        <EducationDialog
          key={currentEdu?._id ?? (isDialogOpen ? "new" : "closed")}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          education={currentEdu}
          onSave={handleSave}
          isSaving={saveMutation.isPending}
        />

        <DragOverlay dropAnimation={null}>
          {activeId ? <EduOverlay edu={data.find((s) => s._id === activeId)!} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
