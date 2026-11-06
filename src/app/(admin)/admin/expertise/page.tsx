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
import { FaPlus, FaTimes, FaCheck, FaLaptopCode, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Skill, Technology } from "@/types";
import { SortableSkillRow, ExpertiseOverlay } from "./_components/ExpertiseRow";
import { ExpertiseDialog } from "./_components/ExpertiseDialog";

export default function AdminExpertisePage() {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<Skill[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const { data: fetchedData, isLoading: loading } = useQuery<Skill[]>({
    queryKey: ["expertises"],
    queryFn: async () => {
      const r = await fetch("/api/admin/expertise");
      if (!r.ok) throw new Error("Failed to fetch expertises");
      return r.json();
    },
  });

  const { data: technologies = [] } = useQuery<Technology[]>({
    queryKey: ["technologies"],
    queryFn: async () => {
      const r = await fetch("/api/admin/technologies");
      if (!r.ok) throw new Error("Failed to fetch technologies");
      const d = await r.json();
      return Array.isArray(d) ? d : [];
    },
  });

  const expertises: Skill[] = localData ?? fetchedData ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/expertise?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setLocalData((prev) => (prev ?? expertises).filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["expertises"] });
      showToast("Expertise deleted.");
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
    mutationFn: async (skill: Skill) => {
      const isEdit = !!skill._id;
      const url = isEdit
        ? `/api/admin/expertise?id=${skill._id}`
        : "/api/admin/expertise";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill),
      });
      if (!res.ok) throw new Error("Failed to save");
      return { isEdit };
    },
    onSuccess: ({ isEdit }) => {
      setIsDialogOpen(false);
      setLocalData(null);
      showToast(isEdit ? "Expertise updated!" : "Expertise added!");
      queryClient.invalidateQueries({ queryKey: ["expertises"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  const addTechMutation = useMutation({
    mutationFn: async ({ name, iconUrl }: { name: string; iconUrl: string }) => {
      const res = await fetch("/api/admin/technologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, iconUrl }),
      });
      if (!res.ok) throw new Error("Failed to add tech");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technologies"] });
      showToast("Technology added!");
    },
    onError: () => {
      showToast("Failed to add technology", "error");
    },
  });

  function handleSave(skill: Skill) {
    if (!skill.name) return;
    saveMutation.mutate(skill);
  }

  function openEdit(skill: Skill) {
    setCurrentSkill({ ...skill });
    setIsDialogOpen(true);
  }

  function openNew() {
    setCurrentSkill({ name: "", tech: "", iconUrl: "" });
    setIsDialogOpen(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = expertises.findIndex((i) => i._id === active.id);
      const newIndex = expertises.findIndex((i) => i._id === over.id);
      const newData = arrayMove(expertises, oldIndex, newIndex);
      setLocalData(newData);

      fetch("/api/admin/expertise", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["expertises"] }));
    }
    setActiveId(null);
  }

  const filtered = expertises.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tech ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl md:flex-row md:items-center dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
          <div className="flex flex-1 flex-wrap items-center gap-4">
            <div className="relative max-w-xs min-w-45 flex-1">
              <FaSearch
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-600"
                size={12}
              />
              <Input
                className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-xs text-slate-900 shadow-sm focus-visible:ring-purple-500/30 dark:border-white/5 dark:bg-slate-950 dark:text-white dark:shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search domains..."
              />
            </div>

            <Badge
              variant="outline"
              className="rounded-full border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-purple-600 uppercase dark:text-purple-400"
            >
              {expertises.length} {expertises.length === 1 ? "Domain" : "Domains"}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={openNew}
              className="h-10 rounded-xl bg-purple-600 px-6 text-xs font-black text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500"
            >
              <FaPlus className="mr-2" size={12} /> Add Domain
            </Button>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Technical Domains
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Organize your core engineering specializations and relevant tech stacks.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl border border-white/5 bg-slate-900/30"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <FaLaptopCode className="mx-auto text-slate-700" size={32} />
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  {searchQuery
                    ? "No domains match your search."
                    : "No domains added yet."}
                </p>
              </div>
            ) : (
              <SortableContext
                items={expertises.map((s) => s._id!)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((skill) => (
                      <SortableSkillRow
                        key={skill._id}
                        skill={skill}
                        onEdit={() => openEdit(skill)}
                        onDelete={() => handleDelete(skill._id!)}
                        isDeleting={deletingId === skill._id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            )}

            <p className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-700 uppercase">
              {searchQuery
                ? `Showing ${filtered.length} of ${expertises.length} domains`
                : "Drag rows to reorder • Changes save automatically"}
            </p>
          </CardContent>
        </Card>

        <ExpertiseDialog
          key={currentSkill?._id ?? (isDialogOpen ? "new" : "closed")}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          skill={currentSkill}
          technologies={technologies}
          onSave={handleSave}
          isSaving={saveMutation.isPending}
          onAddTechnology={addTechMutation.mutateAsync}
          isAddingTech={addTechMutation.isPending}
        />

        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <ExpertiseOverlay skill={expertises.find((s) => s._id === activeId)!} />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
