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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FaPlus, FaBriefcase } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExpRow, SortableExpRow, type ExperienceItem } from "./_components/ExperienceRow";
import { ExperienceDialog } from "./_components/ExperienceDialog";
import { AdminToast, useAdminToast } from "../components/AdminToast";

export default function AdminExperiencePage() {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<ExperienceItem[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentExp, setCurrentExp] = useState<ExperienceItem | null>(null);
  const { toast, showToast } = useAdminToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: fetchedData, isLoading: loading } = useQuery<ExperienceItem[]>({
    queryKey: ["experience"],
    queryFn: async () => {
      const r = await fetch("/api/admin/experience");
      if (!r.ok) throw new Error("Failed to fetch experience");
      return r.json();
    },
  });

  const data = localData ?? fetchedData ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/experience?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setLocalData((prev) => (prev ?? data).filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      showToast("Record deleted.");
      setDeletingId(null);
    },
    onError: () => {
      showToast("Failed to delete.", "error");
      setDeletingId(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (exp: ExperienceItem) => {
      const isEdit = !!exp._id;
      const url = isEdit
        ? `/api/admin/experience?id=${exp._id}`
        : "/api/admin/experience";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exp),
      });
      if (!res.ok) throw new Error("Failed to save");
      return { isEdit };
    },
    onSuccess: ({ isEdit }) => {
      setIsDialogOpen(false);
      showToast(isEdit ? "Experience updated!" : "Experience added!");
      setLocalData(null);
      queryClient.invalidateQueries({ queryKey: ["experience"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteMutation.mutate(id);
  }

  function handleSave(exp: ExperienceItem) {
    saveMutation.mutate(exp);
  }

  function openEdit(item: ExperienceItem) {
    setCurrentExp({
      ...item,
      details: item.details || [],
      previousTitles: item.previousTitles || [],
      technologies: item.technologies || [],
      links: item.links || [],
    });
    setIsDialogOpen(true);
  }

  function openNew() {
    setCurrentExp({
      title: "",
      org: "",
      duration: "",
      details: [],
      url: "",
      previousTitles: [],
      links: [],
      technologies: [],
      order: data.length,
    });
    setIsDialogOpen(true);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = data.findIndex((i) => i._id === active.id);
      const newIndex = data.findIndex((i) => i._id === over.id);
      const newData = arrayMove(data, oldIndex, newIndex);
      setLocalData(newData);
      // Auto save order using PATCH
      fetch("/api/admin/experience", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["experience"] });
        setLocalData(null);
      });
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
        <AdminToast toast={toast} />

        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400"
              >
                {data.length} Work Experience
              </Badge>
            </div>
            <Button
              onClick={openNew}
              className="group h-10 rounded-xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95"
            >
              <FaPlus className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
              Add Experience
            </Button>
          </div>

          <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Professional Timeline
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
                  <FaBriefcase
                    className="mx-auto mb-4 text-slate-200 dark:text-slate-800"
                    size={40}
                  />
                  <p className="font-medium text-slate-400 dark:text-slate-500">
                    No experience records found. Add your first job above.
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={data.map((s) => s._id!)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {data.map((exp) => (
                        <SortableExpRow
                          key={exp._id}
                          exp={exp}
                          onEdit={() => openEdit(exp)}
                          onDelete={() => handleDelete(exp._id!)}
                          isDeleting={deletingId === exp._id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              )}

              {!loading && data.length > 0 && (
                <p className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-700">
                  Drag rows to reorder • Changes save automatically
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <ExperienceDialog
          key={currentExp?._id ?? (isDialogOpen ? "open-new" : "closed")}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          experience={currentExp}
          onSave={handleSave}
          isSaving={saveMutation.isPending}
        />

        <DragOverlay zIndex={99999} dropAnimation={null}>
          {activeId ? (
            <ExpRow exp={data.find((s) => s._id === activeId)!} isOverlay />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
