"use client";
import { useState } from "react";
import Image from "next/image";
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
  FaGraduationCap,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaUniversity,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaLink,
  FaAward,
  FaInfoCircle,
} from "react-icons/fa";
import { AdminDialogShell } from "../components/AdminDialogShell";
import { AdminField, AdminInput } from "../components/AdminFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ImageUpload from "../components/ImageUpload";

interface Education {
  _id?: string;
  degree: string;
  institution: string;
  location: string;
  logo: string;
  period: string;
  gpa: string;
  details: string[];
  link: string;
  order: number;
}

function SortableEduRow({
  edu,
  onEdit,
  onDelete,
  isDeleting,
}: {
  edu: Education;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: edu._id! });

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
        isDragging && "z-50 border-emerald-500/50 shadow-2xl shadow-emerald-500/10"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-300 transition-colors hover:text-emerald-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-emerald-400"
      >
        <FaGripVertical size={14} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {edu.logo ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/5">
              <Image
                src={edu.logo}
                alt={edu.institution}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <FaGraduationCap size={14} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {edu.degree}
            </h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {edu.institution}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 pr-2">
        <div className="hidden items-center gap-2 text-slate-500 md:flex">
          <FaCalendarAlt size={10} />
          <span className="text-[10px] font-medium">{edu.period}</span>
        </div>

        <div className="flex items-center gap-2 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-blue-400/10 hover:text-blue-400"
          >
            <FaEdit size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
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

function EduOverlay({ edu }: { edu: Education }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-emerald-500/30 bg-white p-4 shadow-2xl dark:bg-slate-800">
      <div className="shrink-0 cursor-grabbing text-emerald-500">
        <FaGripVertical size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {edu.logo ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/5">
              <Image
                src={edu.logo}
                alt={edu.institution}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="shrink-0 rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <FaGraduationCap size={14} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {edu.degree}
            </h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {edu.institution}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 pr-2">
        <div className="hidden items-center gap-2 text-slate-500 md:flex">
          <FaCalendarAlt size={10} />
          <span className="text-[10px] font-medium">{edu.period}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminEducationPage() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Education[]>([]);
  const [prevFetchedData, setPrevFetchedData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEdu, setCurrentEdu] = useState<Education | null>(null);
  const [detailInput, setDetailInput] = useState("");
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

  const { data: fetchedData, isLoading: loading } = useQuery({
    queryKey: ["education"],
    queryFn: async () => {
      const r = await fetch("/api/admin/education");
      if (!r.ok) throw new Error("Failed to fetch education");
      return r.json();
    },
  });

  if (fetchedData !== prevFetchedData) {
    setPrevFetchedData(fetchedData);
    if (fetchedData) {
      setData(Array.isArray(fetchedData) ? fetchedData : []);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/education?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setData((prev) => prev.filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["education"] });
      showToast("Record deleted.");
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
      showToast(isEdit ? "Education updated!" : "Education added!");
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  async function handleAddOrUpdate() {
    if (!currentEdu?.degree || !currentEdu?.institution) return;
    saveMutation.mutate(currentEdu);
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

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = data.findIndex((i) => i._id === active.id);
      const newIndex = data.findIndex((i) => i._id === over.id);
      const newData = arrayMove(data, oldIndex, newIndex);
      setData(newData);
      // Auto save order using PATCH
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
      <div className="space-y-4 p-4 md:p-8">
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
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400"
              >
                {data.length} Records
              </Badge>
            </div>
            <Button
              onClick={openNew}
              className="group h-10 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-95"
            >
              <FaPlus className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
              Add Education
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
        </div>{" "}
        <AdminDialogShell
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={currentEdu?._id ? "Edit Academic Record" : "Add New Education"}
          subtitle="Chronicle your academic journey and achievements"
          icon={FaGraduationCap}
          iconColor="text-blue-400"
          accentColor="from-blue-500/5 to-indigo-500/5"
          onSave={handleAddOrUpdate}
          saving={saveMutation.isPending}
          saveLabel={currentEdu?._id ? "Update Academic File" : "Finalize Admission"}
          savingLabel="Recording..."
          maxWidth="5xl"
        >
          {currentEdu && (
            <div className="px-1">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_3fr]">
                {/* Left Column: Branding */}
                <div className="space-y-4">
                  <AdminField label="Institution Logo">
                    <ImageUpload
                      value={currentEdu.logo}
                      onChange={(url) => setCurrentEdu({ ...currentEdu, logo: url })}
                    />
                  </AdminField>

                  <AdminField label="Period">
                    <AdminInput
                      icon={FaCalendarAlt}
                      value={currentEdu.period}
                      onChange={(e) =>
                        setCurrentEdu({
                          ...currentEdu,
                          period: e.target.value,
                        })
                      }
                      placeholder="e.g. 2020 - 2024"
                    />
                  </AdminField>
                  <AdminField label="Grade / GPA">
                    <AdminInput
                      icon={FaAward}
                      value={currentEdu.gpa}
                      onChange={(e) =>
                        setCurrentEdu({ ...currentEdu, gpa: e.target.value })
                      }
                      placeholder="e.g. 3.9 / 4.0"
                    />
                  </AdminField>
                </div>

                {/* Right Column: Academic Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <AdminField label="Degree / Course">
                      <AdminInput
                        icon={FaGraduationCap}
                        value={currentEdu.degree}
                        onChange={(e) =>
                          setCurrentEdu({
                            ...currentEdu,
                            degree: e.target.value,
                          })
                        }
                        placeholder="e.g. B.Sc in Computer Science"
                      />
                    </AdminField>
                    <AdminField label="Institution">
                      <AdminInput
                        icon={FaUniversity}
                        value={currentEdu.institution}
                        onChange={(e) =>
                          setCurrentEdu({
                            ...currentEdu,
                            institution: e.target.value,
                          })
                        }
                        placeholder="e.g. Stanford University"
                      />
                    </AdminField>
                  </div>

                  <AdminField label="Location">
                    <AdminInput
                      icon={FaMapMarkerAlt}
                      value={currentEdu.location}
                      onChange={(e) =>
                        setCurrentEdu({
                          ...currentEdu,
                          location: e.target.value,
                        })
                      }
                      placeholder="e.g. California, USA"
                    />
                  </AdminField>

                  <AdminField label="Official Website">
                    <AdminInput
                      icon={FaLink}
                      value={currentEdu.link}
                      onChange={(e) =>
                        setCurrentEdu({ ...currentEdu, link: e.target.value })
                      }
                      placeholder="https://university.edu"
                    />
                  </AdminField>

                  <AdminField label="Academic Highlights">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <AdminInput
                          icon={FaInfoCircle}
                          value={detailInput}
                          onChange={(e) => setDetailInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (detailInput.trim()) {
                                setCurrentEdu({
                                  ...currentEdu,
                                  details: [...currentEdu.details, detailInput.trim()],
                                });
                                setDetailInput("");
                              }
                            }
                          }}
                          placeholder="e.g. Dean's List, Research in AI, etc."
                          className="h-12"
                        />
                        <Button
                          onClick={() => {
                            if (detailInput.trim()) {
                              setCurrentEdu({
                                ...currentEdu,
                                details: [...currentEdu.details, detailInput.trim()],
                              });
                              setDetailInput("");
                            }
                          }}
                          className="h-12 rounded-xl border border-slate-200 bg-slate-900 px-6 font-bold text-white shadow-inner shadow-black/5 hover:bg-slate-800 dark:border-white/5 dark:bg-slate-800 dark:shadow-black/20 dark:hover:bg-slate-700"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <AnimatePresence mode="popLayout">
                          {currentEdu.details.map((detail, i) => (
                            <motion.div
                              key={i}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="group/item flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 shadow-inner shadow-black/5 dark:border-white/5 dark:bg-slate-950/40 dark:shadow-black/10"
                            >
                              <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {detail}
                              </span>
                              <button
                                onClick={() =>
                                  setCurrentEdu({
                                    ...currentEdu,
                                    details: currentEdu.details.filter(
                                      (_, idx) => idx !== i
                                    ),
                                  })
                                }
                                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-400/10 hover:text-red-400"
                              >
                                <FaTimes size={14} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </AdminField>
                </div>
              </div>
            </div>
          )}
        </AdminDialogShell>
        <DragOverlay dropAnimation={null}>
          {activeId ? <EduOverlay edu={data.find((s) => s._id === activeId)!} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
