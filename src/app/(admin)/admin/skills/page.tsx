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

// Shadcn UI Imports
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
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

interface Skill {
  _id?: string;
  name: string;
  tech: string;
  iconUrl?: string;
  isTechnology?: boolean;
}

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
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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

export default function AdminSkillsPage() {
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [prevData, setPrevData] = useState<any>(null);
  const expertises = skills.filter((s) => !s.isTechnology);
  const technologies = skills.filter((s) => !!s.isTechnology);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
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
    queryKey: ["skills"],
    queryFn: async () => {
      const r = await fetch("/api/admin/skills");
      if (!r.ok) throw new Error("Failed to fetch skills");
      return r.json();
    },
  });

  // Properly sync external query data to local interactive state during render phase
  if (data !== prevData) {
    setPrevData(data);
    if (data) {
      setSkills(Array.isArray(data.skills) ? data.skills : []);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/skills?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setSkills((prev) => prev.filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      showToast("Skill deleted.");
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
      const url = isEdit ? `/api/admin/skills?id=${skill._id}` : "/api/admin/skills";
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
      showToast(isEdit ? "Skill updated!" : "Skill added!");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
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
    setCurrentSkill({
      name: "",
      tech: "",

      iconUrl: "",
      isTechnology: false,
    });
    setIsDialogOpen(true);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = expertises.findIndex((i) => i._id === active.id);
      const newIndex = expertises.findIndex((i) => i._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reorderedExpertises = arrayMove(expertises, oldIndex, newIndex);
      const updatedSkills = skills.map((s) =>
        s.isTechnology ? s : reorderedExpertises.shift()!
      );
      setSkills(updatedSkills);
      fetch("/api/admin/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSkills),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["skills"] }));
    }
    setActiveId(null);
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

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="rounded-full border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-purple-600 uppercase dark:text-purple-400"
            >
              {expertises.length} Expertise Areas
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400"
            >
              {technologies.length} Brand Techs
            </Badge>
          </div>
          <Button
            onClick={openNew}
            className="group h-10 rounded-xl bg-purple-600 px-6 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-95"
          >
            <FaPlus className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
            Add Expertise
          </Button>
        </div>

        <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-700 lg:grid-cols-2">
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(e) => setActiveId(e.active.id as string)}
                  onDragEnd={handleDragEnd}
                >
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

                  <DragOverlay dropAnimation={null}>
                    {activeId ? (
                      <div className="flex scale-105 items-center gap-4 rounded-2xl border border-purple-500/30 bg-white/90 p-4 opacity-90 shadow-2xl backdrop-blur-xl dark:bg-slate-800/90">
                        <FaGripVertical className="text-purple-500" size={14} />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {skills.find((s) => s._id === activeId)?.name}
                          </h3>
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}

              {!loading && expertises.length > 0 && (
                <p className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-700">
                  Drag rows to reorder • Changes save automatically
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
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
                  onClick={() => {
                    setCurrentSkill({
                      name: "",
                      tech: "Technology",

                      iconUrl: "",
                      isTechnology: true,
                    });
                    setIsDialogOpen(true);
                  }}
                  className="h-9 cursor-pointer rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-95"
                >
                  <FaPlus className="mr-1.5" size={10} /> Add Tech
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="flex min-h-20 flex-wrap gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-950/20">
                {technologies.map((t) => (
                  <Badge
                    key={t._id}
                    variant="outline"
                    className="group cursor-default gap-2 rounded-xl border-slate-200 bg-white py-2 pr-2 pl-3 text-slate-700 shadow-sm transition-transform hover:scale-102 dark:border-white/5 dark:bg-slate-950 dark:text-slate-300 dark:shadow-none"
                    style={{
                      borderLeft: `3px solid #10B981`,
                    }}
                  >
                    <span className="text-xs font-black">{t.name}</span>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(t)}
                        className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/20"
                      >
                        <FaEdit size={10} />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id!)}
                        className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20"
                      >
                        <FaTrash size={9} />
                      </button>
                    </div>
                  </Badge>
                ))}
                {technologies.length === 0 && (
                  <p className="m-auto py-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    No brand technologies registered
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AdminDialogShell
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={currentSkill?._id ? "Refine Expertise" : "Forge New Skill"}
        subtitle="Define your expertise level and tech stack"
        icon={FaCode}
        iconColor="text-purple-400"
        accentColor="from-purple-500/5 to-pink-500/5"
        onSave={handleAddOrUpdate}
        saving={saveMutation.isPending}
        saveLabel={currentSkill?._id ? "Update Skill" : "Enshrine Expertise"}
        savingLabel="Processing..."
        maxWidth="5xl"
      >
        {" "}
        {currentSkill && (
          <div className="px-1">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
              {/* Left Column: Visuals & Classification */}
              <div className="space-y-8">
                <AdminField label="Skill Classification">
                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 dark:border-white/5 dark:bg-slate-950/40">
                    <label className="flex w-full cursor-pointer items-center gap-3 select-none">
                      <input
                        type="checkbox"
                        checked={!!currentSkill.isTechnology}
                        onChange={(e) => {
                          const isTech = e.target.checked;
                          setCurrentSkill((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  isTechnology: isTech,
                                  tech: isTech ? "Technology" : "",
                                  iconUrl: prev.iconUrl || "",
                                }
                              : null
                          );
                        }}
                        className="size-4 cursor-pointer rounded border-slate-300 accent-purple-500 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-950"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Is Technology Logo / Brand
                      </span>
                    </label>
                  </div>
                </AdminField>

                <AdminField label="Custom Icon (SVG/PNG)">
                  <ImageUpload
                    value={currentSkill.iconUrl || ""}
                    onChange={(val) =>
                      setCurrentSkill((prev) => (prev ? { ...prev, iconUrl: val } : null))
                    }
                  />
                </AdminField>
              </div>

              {/* Right Column: Skill Identity */}
              <div className="space-y-6">
                <AdminField
                  label={
                    currentSkill.isTechnology
                      ? "Technology Brand Name"
                      : "Expertise Title"
                  }
                >
                  <AdminInput
                    icon={FaLaptopCode}
                    value={currentSkill.name}
                    onChange={(e) =>
                      setCurrentSkill((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    placeholder={
                      currentSkill.isTechnology
                        ? "e.g. React"
                        : "e.g. Full Stack Development"
                    }
                  />
                </AdminField>

                {!currentSkill.isTechnology && (
                  <AdminField label="Stack / Technologies">
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
                  </AdminField>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminDialogShell>
    </div>
  );
}
