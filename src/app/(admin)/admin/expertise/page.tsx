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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FaPlus,
  FaTimes,
  FaCheck,
  FaCode,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaLaptopCode,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminDialogShell } from "../components/AdminDialogShell";
import { AdminField, AdminInput } from "../components/AdminFields";
import ImageUpload from "../components/ImageUpload";
import type { Skill } from "@/types";

function SortableSkillRow({
  skill,
  onEdit,
  onDelete,
  isDeleting,
}: {
  skill: Skill;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: skill._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none dark:hover:border-white/10",
        isDragging && "z-50 border-purple-500/50 shadow-2xl shadow-purple-500/10"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-300 transition-colors hover:text-purple-500 active:cursor-grabbing dark:text-slate-600"
      >
        <FaGripVertical size={14} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
            {skill.iconUrl ? (
              <Image
                src={skill.iconUrl}
                alt={skill.name}
                width={14}
                height={14}
                className="object-contain"
              />
            ) : (
              <FaCode size={14} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {skill.name}
            </h3>
            <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase dark:text-slate-500">
              {skill.tech}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-purple-400/10 hover:text-purple-400"
          >
            <FaEdit size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-400/10 hover:text-red-400"
          >
            {isDeleting ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
            ) : (
              <FaTrash size={12} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExpertiseOverlay({ skill }: { skill: Skill }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-purple-500/30 bg-white p-4 shadow-2xl dark:bg-slate-800">
      <FaGripVertical className="text-purple-500" size={14} />
      <div className="flex items-center justify-center rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
        {skill.iconUrl ? (
          <Image
            src={skill.iconUrl}
            alt={skill.name}
            width={14}
            height={14}
            className="object-contain"
          />
        ) : (
          <FaCode size={14} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {skill.name}
        </h3>
        <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase dark:text-slate-500">
          {skill.tech}
        </p>
      </div>
    </div>
  );
}

export default function AdminExpertisePage() {
  const queryClient = useQueryClient();
  const [expertises, setExpertises] = useState<Skill[]>([]);
  const [prevData, setPrevData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [newTechName, setNewTechName] = useState("");
  const [newTechIcon, setNewTechIcon] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
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

  const { data, isLoading: loading } = useQuery({
    queryKey: ["expertises"],
    queryFn: async () => {
      const r = await fetch("/api/admin/expertise");
      if (!r.ok) throw new Error("Failed to fetch expertises");
      return r.json();
    },
  });

  const { data: techData } = useQuery({
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
      setExpertises(Array.isArray(data) ? data : []);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/expertise?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setExpertises((prev) => prev.filter((s) => s._id !== id));
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
    onSuccess: (newTech) => {
      queryClient.invalidateQueries({ queryKey: ["technologies"] });
      setNewTechName("");
      setNewTechIcon("");
      setShowQuickAdd(false);
      if (currentSkill) {
        const selectedTechs = currentSkill.tech
          ? currentSkill.tech
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        if (!selectedTechs.includes(newTech.name)) {
          setCurrentSkill({
            ...currentSkill,
            tech: [...selectedTechs, newTech.name].join(", "),
          });
        }
      }
      showToast("Technology added!");
    },
    onError: () => {
      showToast("Failed to add technology", "error");
    },
  });

  async function handleAddOrUpdate() {
    if (!currentSkill?.name) return;
    saveMutation.mutate(currentSkill);
  }

  function openEdit(skill: Skill) {
    setCurrentSkill({ ...skill });
    setIsDialogOpen(true);
  }

  function openNew() {
    setCurrentSkill({ name: "", tech: "", iconUrl: "" });
    setIsDialogOpen(true);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = expertises.findIndex((i) => i._id === active.id);
      const newIndex = expertises.findIndex((i) => i._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reorderedExpertises = arrayMove(expertises, oldIndex, newIndex);
      setExpertises(reorderedExpertises);
      fetch("/api/admin/expertise", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reorderedExpertises),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["expertises"] }));
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

        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
            <Badge
              variant="outline"
              className="rounded-full border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-purple-600 uppercase dark:text-purple-400"
            >
              {expertises.length} Expertise Areas
            </Badge>
            <Button
              onClick={openNew}
              className="group h-10 rounded-xl bg-purple-600 px-6 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-95"
            >
              <FaPlus className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
              Add Expertise
            </Button>
          </div>

          <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Skill Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/20"
                    />
                  ))}
                </div>
              ) : expertises.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm dark:border-white/5 dark:bg-slate-950/20 dark:shadow-none">
                  <FaLaptopCode
                    className="mx-auto mb-4 text-slate-200 dark:text-slate-800"
                    size={40}
                  />
                  <p className="font-medium text-slate-400 dark:text-slate-500">
                    No expertises found. Add your expertise above.
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={expertises.map((s) => s._id!)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {expertises.map((skill) => (
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
              {!loading && expertises.length > 0 && (
                <p className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-700">
                  Drag rows to reorder • Changes save automatically
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <AdminDialogShell
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={currentSkill?._id ? "Refine Expertise" : "Forge New Expertise"}
          subtitle=""
          icon={FaCode}
          iconColor="text-purple-400"
          accentColor="from-purple-500/5 to-pink-500/5"
          onSave={handleAddOrUpdate}
          saving={saveMutation.isPending}
          saveLabel={currentSkill?._id ? "Update Expertise" : "Add Expertise"}
          savingLabel="Processing..."
          maxWidth="5xl"
        >
          {currentSkill && (
            <div className="px-1">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
                {/* Left Column: Visuals */}
                <div className="space-y-8">
                  <AdminField label="Custom Icon (SVG/PNG) (Optional)">
                    <ImageUpload
                      value={currentSkill.iconUrl || ""}
                      onChange={(val) =>
                        setCurrentSkill((prev) =>
                          prev ? { ...prev, iconUrl: val } : null
                        )
                      }
                    />
                  </AdminField>
                </div>

                {/* Right Column: Details */}
                <div className="space-y-6">
                  <AdminField label="Expertise Title">
                    <AdminInput
                      icon={FaLaptopCode}
                      value={currentSkill.name}
                      onChange={(e) =>
                        setCurrentSkill((prev) =>
                          prev ? { ...prev, name: e.target.value } : null
                        )
                      }
                      placeholder="e.g. Full Stack Development"
                    />
                  </AdminField>
                  <AdminField label="Stack / Technologies">
                    <div className="flex flex-col gap-3">
                      <AdminInput
                        icon={FaCode}
                        className="text-sm font-medium"
                        value={currentSkill.tech}
                        onChange={(e) =>
                          setCurrentSkill((prev) =>
                            prev ? { ...prev, tech: e.target.value } : null
                          )
                        }
                        placeholder="e.g. React, Next.js, TypeScript"
                      />
                      <div className="custom-scrollbar flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-950/40">
                        {techData?.map((t: any) => {
                          const selectedTechs = currentSkill.tech
                            ? currentSkill.tech
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            : [];
                          const isSelected = selectedTechs.includes(t.name);
                          return (
                            <Badge
                              key={t._id}
                              variant={isSelected ? "default" : "outline"}
                              className={cn(
                                "flex cursor-pointer items-center gap-2 transition-all active:scale-95",
                                isSelected
                                  ? "border-transparent bg-purple-500 text-white hover:bg-purple-600"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                              )}
                              onClick={() => {
                                let newTechs;
                                if (isSelected) {
                                  newTechs = selectedTechs.filter(
                                    (name) => name !== t.name
                                  );
                                } else {
                                  newTechs = [...selectedTechs, t.name];
                                }
                                setCurrentSkill({
                                  ...currentSkill,
                                  tech: newTechs.join(", "),
                                });
                              }}
                            >
                              {t.iconUrl && (
                                <Image
                                  src={t.iconUrl}
                                  alt={t.name}
                                  width={14}
                                  height={14}
                                  className="object-contain"
                                />
                              )}
                              {t.name}
                            </Badge>
                          );
                        })}
                        {(!techData || techData.length === 0) && (
                          <p className="text-xs text-slate-500">
                            No technologies found. Add some below.
                          </p>
                        )}

                        <button
                          type="button"
                          className={cn(
                            "flex cursor-pointer items-center justify-center rounded-full px-2 transition-all duration-300 active:scale-95",
                            showQuickAdd
                              ? "rotate-45"
                              : "text-slate-400 hover:bg-purple-500/10 hover:text-purple-500"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            setShowQuickAdd((prev) => !prev);
                          }}
                        >
                          <FaPlus size={14} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Quick Add Tech Form */}
                      {showQuickAdd && (
                        <div className="relative mt-3 flex flex-col gap-4 rounded-2xl border border-purple-500/30 bg-white p-5 shadow-[0_10px_40px_rgba(168,85,247,0.15)] dark:bg-slate-900">
                          <button
                            type="button"
                            onClick={() => setShowQuickAdd(false)}
                            className="absolute top-4 right-4 text-slate-400 transition-colors hover:text-slate-200"
                          >
                            <FaTimes size={16} />
                          </button>
                          <p className="text-[10px] font-black tracking-widest text-purple-400 uppercase">
                            Add New Technology
                          </p>

                          <div className="grid grid-cols-[100px_1fr] items-center gap-8">
                            <div className="h-32 w-32">
                              <ImageUpload
                                value={newTechIcon}
                                onChange={(val) => setNewTechIcon(val)}
                              />
                            </div>
                            <div className="flex flex-col gap-3">
                              <AdminInput
                                icon={FaPlus}
                                className="h-11 bg-slate-50 text-sm dark:bg-slate-950"
                                placeholder="Tech Name..."
                                value={newTechName}
                                onChange={(e) => setNewTechName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (newTechName.trim() && newTechIcon.trim()) {
                                      addTechMutation.mutate({
                                        name: newTechName.trim(),
                                        iconUrl: newTechIcon.trim(),
                                      });
                                    }
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                className="h-11 w-full rounded-xl bg-purple-500 font-bold text-white transition-all hover:bg-purple-600 active:scale-95"
                                disabled={
                                  !newTechName.trim() ||
                                  !newTechIcon.trim() ||
                                  addTechMutation.isPending
                                }
                                onClick={() =>
                                  addTechMutation.mutate({
                                    name: newTechName.trim(),
                                    iconUrl: newTechIcon.trim(),
                                  })
                                }
                              >
                                {addTechMutation.isPending ? "Adding..." : "Add Tech"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </AdminField>
                </div>
              </div>
            </div>
          )}
        </AdminDialogShell>

        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <ExpertiseOverlay skill={expertises.find((s) => s._id === activeId)!} />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
