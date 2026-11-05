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
  FaBriefcase,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaUniversity,
  FaCalendarAlt,
  FaInfoCircle,
  FaLink,
  FaRocket,
  FaPenNib,
} from "react-icons/fa";
import { AdminDialogShell } from "../components/AdminDialogShell";
import { AdminField, AdminInput } from "../components/AdminFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Experience {
  _id?: string;
  title: string;
  org: string;
  duration: string;
  details: string[];
  order: number;
  url?: string;
  previousTitles?: string[];
  links?: { label?: string; url: string }[];
  technologies?: string[];
}

import { forwardRef } from "react";

const ExpRow = forwardRef<HTMLDivElement, any>(
  (
    {
      exp,
      isOverlay,
      isDragging,
      isDeleting,
      onEdit,
      onDelete,
      attributes,
      listeners,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        style={style}
        {...props}
        className={cn(
          "group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900 dark:shadow-none",
          !isOverlay &&
            "transition-colors duration-300 hover:border-slate-300 dark:bg-slate-900/40 dark:hover:border-white/10",
          isDragging && !isOverlay && "opacity-50",
          isOverlay &&
            "z-99999 scale-[1.02] cursor-grabbing border-emerald-500/50 shadow-2xl shadow-emerald-500/20"
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "text-slate-300 transition-colors dark:text-slate-600",
            isOverlay
              ? "cursor-grabbing"
              : "cursor-grab hover:text-emerald-500 dark:hover:text-emerald-400"
          )}
        >
          <FaGripVertical size={14} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <FaBriefcase size={14} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {exp.title}
              </h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {exp.org}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 pr-2">
          <div className="hidden items-center gap-2 text-slate-500 md:flex">
            <FaCalendarAlt size={10} />
            <span className="text-[10px] font-medium">{exp.duration}</span>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 transition-opacity",
              isOverlay ? "opacity-0" : ""
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 rounded-lg text-slate-400 hover:bg-emerald-400/10 hover:text-emerald-400"
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
);
ExpRow.displayName = "ExpRow";

function SortableExpRow({ exp, onEdit, onDelete, isDeleting }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exp._id! });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <ExpRow
      ref={setNodeRef}
      style={style}
      exp={exp}
      isDragging={isDragging}
      attributes={attributes}
      listeners={listeners}
      onEdit={onEdit}
      onDelete={onDelete}
      isDeleting={isDeleting}
    />
  );
}

export default function AdminExperiencePage() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Experience[]>([]);
  const [prevFetchedData, setPrevFetchedData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentExp, setCurrentExp] = useState<Experience | null>(null);
  const [detailInput, setDetailInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [prevTitleInput, setPrevTitleInput] = useState("");
  const [linkLabelInput, setLinkLabelInput] = useState("");
  const [linkUrlInput, setLinkUrlInput] = useState("");
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
    queryKey: ["experience"],
    queryFn: async () => {
      const r = await fetch("/api/admin/experience");
      if (!r.ok) throw new Error("Failed to fetch experience");
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
      const res = await fetch(`/api/admin/experience?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setData((prev) => prev.filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["experience"] });
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
    mutationFn: async (exp: Experience) => {
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
      queryClient.invalidateQueries({ queryKey: ["experience"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  async function handleAddOrUpdate() {
    if (!currentExp?.title || !currentExp?.org) return;
    saveMutation.mutate(currentExp);
  }

  function openEdit(item: Experience) {
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
      setData(newData);
      // Auto save order using PATCH
      fetch("/api/admin/experience", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["experience"] }));
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

        <AdminDialogShell
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={currentExp?._id ? "Refine Work History" : "New Career Milestone"}
          subtitle="Document your professional evolution and impact"
          icon={FaBriefcase}
          iconColor="text-emerald-400"
          accentColor="from-emerald-500/5 to-teal-500/5"
          onSave={handleAddOrUpdate}
          saving={saveMutation.isPending}
          saveLabel={currentExp?._id ? "Update Chronicle" : "Save Experience"}
          savingLabel="Archiving..."
          maxWidth="5xl"
        >
          {currentExp && (
            <div className="space-y-8 px-1">
              {/* Top Info Grid */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <AdminField label="Job Title">
                  <AdminInput
                    icon={FaBriefcase}
                    value={currentExp.title}
                    onChange={(e) =>
                      setCurrentExp({ ...currentExp, title: e.target.value })
                    }
                    placeholder="e.g. Senior Software Engineer"
                  />
                </AdminField>
                <AdminField label="Organization">
                  <AdminInput
                    icon={FaUniversity}
                    value={currentExp.org}
                    onChange={(e) =>
                      setCurrentExp({ ...currentExp, org: e.target.value })
                    }
                    placeholder="e.g. Google"
                  />
                </AdminField>
                <AdminField label="Duration">
                  <AdminInput
                    icon={FaCalendarAlt}
                    value={currentExp.duration}
                    onChange={(e) =>
                      setCurrentExp({ ...currentExp, duration: e.target.value })
                    }
                    placeholder="e.g. Jan 2022 - Present"
                  />
                </AdminField>
                <AdminField label="Website URL">
                  <AdminInput
                    icon={FaLink}
                    value={currentExp.url || ""}
                    onChange={(e) =>
                      setCurrentExp({ ...currentExp, url: e.target.value })
                    }
                    placeholder="e.g. https://google.com"
                  />
                </AdminField>
              </div>

              {/* Arrays Section in Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Previous Titles */}
                <AdminField label="Previous Titles (Optional)">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <AdminInput
                        icon={FaBriefcase}
                        value={prevTitleInput}
                        onChange={(e) => setPrevTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (prevTitleInput.trim()) {
                              setCurrentExp({
                                ...currentExp,
                                previousTitles: [
                                  ...(currentExp.previousTitles || []),
                                  prevTitleInput.trim(),
                                ],
                              });
                              setPrevTitleInput("");
                            }
                          }
                        }}
                        placeholder="e.g. Software Engineer II"
                      />
                      <Button
                        onClick={() => {
                          if (prevTitleInput.trim()) {
                            setCurrentExp({
                              ...currentExp,
                              previousTitles: [
                                ...(currentExp.previousTitles || []),
                                prevTitleInput.trim(),
                              ],
                            });
                            setPrevTitleInput("");
                          }
                        }}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(currentExp.previousTitles || []).map((t, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="gap-2 py-1.5 pr-2 pl-3"
                        >
                          {t}
                          <button
                            onClick={() =>
                              setCurrentExp({
                                ...currentExp,
                                previousTitles: (currentExp.previousTitles || []).filter(
                                  (_, idx) => idx !== i
                                ),
                              })
                            }
                            className="hover:text-red-500"
                          >
                            <FaTimes size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AdminField>

                {/* Technologies */}
                <AdminField label="Technologies Used">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <AdminInput
                        icon={FaRocket}
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (techInput.trim()) {
                              setCurrentExp({
                                ...currentExp,
                                technologies: [
                                  ...(currentExp.technologies || []),
                                  techInput.trim(),
                                ],
                              });
                              setTechInput("");
                            }
                          }
                        }}
                        placeholder="e.g. React"
                      />
                      <Button
                        onClick={() => {
                          if (techInput.trim()) {
                            setCurrentExp({
                              ...currentExp,
                              technologies: [
                                ...(currentExp.technologies || []),
                                techInput.trim(),
                              ],
                            });
                            setTechInput("");
                          }
                        }}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(currentExp.technologies || []).map((t, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="gap-2 border-emerald-500/30 py-1.5 pr-2 pl-3 text-emerald-600 dark:text-emerald-400"
                        >
                          {t}
                          <button
                            onClick={() =>
                              setCurrentExp({
                                ...currentExp,
                                technologies: (currentExp.technologies || []).filter(
                                  (_, idx) => idx !== i
                                ),
                              })
                            }
                            className="hover:text-red-500"
                          >
                            <FaTimes size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AdminField>
              </div>

              {/* Custom Links */}
              <AdminField label="Custom Links (e.g., Company Post, Project)">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <AdminInput
                      icon={FaPenNib}
                      value={linkLabelInput}
                      onChange={(e) => setLinkLabelInput(e.target.value)}
                      placeholder="Label (e.g. Blog Post)"
                    />
                    <AdminInput
                      icon={FaLink}
                      value={linkUrlInput}
                      onChange={(e) => setLinkUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (linkUrlInput.trim()) {
                            setCurrentExp({
                              ...currentExp,
                              links: [
                                ...(currentExp.links || []),
                                {
                                  label: linkLabelInput.trim() || undefined,
                                  url: linkUrlInput.trim(),
                                },
                              ],
                            });
                            setLinkLabelInput("");
                            setLinkUrlInput("");
                          }
                        }
                      }}
                      placeholder="URL (https://...)"
                    />
                    <Button
                      onClick={() => {
                        if (linkUrlInput.trim()) {
                          setCurrentExp({
                            ...currentExp,
                            links: [
                              ...(currentExp.links || []),
                              {
                                label: linkLabelInput.trim() || undefined,
                                url: linkUrlInput.trim(),
                              },
                            ],
                          });
                          setLinkLabelInput("");
                          setLinkUrlInput("");
                        }
                      }}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <AnimatePresence>
                      {(currentExp.links || []).map((link, i) => (
                        <motion.div
                          key={i}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-900"
                        >
                          <div className="flex items-center gap-3">
                            <FaLink className="text-slate-400" />
                            <div>
                              <span className="block text-sm font-bold">
                                {link.label || "Link"}
                              </span>
                              <span className="text-xs text-slate-500">{link.url}</span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setCurrentExp({
                                ...currentExp,
                                links: (currentExp.links || []).filter(
                                  (_, idx) => idx !== i
                                ),
                              })
                            }
                            className="p-2 text-slate-400 hover:text-red-500"
                          >
                            <FaTimes />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </AdminField>

              {/* Impact & Details */}
              <AdminField label="Impact & Responsibilities">
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
                            setCurrentExp({
                              ...currentExp,
                              details: [...currentExp.details, detailInput.trim()],
                            });
                            setDetailInput("");
                          }
                        }
                      }}
                      placeholder="e.g. Spearheaded the migration to microservices architecture..."
                      className="h-12"
                    />
                    <Button
                      onClick={() => {
                        if (detailInput.trim()) {
                          setCurrentExp({
                            ...currentExp,
                            details: [...currentExp.details, detailInput.trim()],
                          });
                          setDetailInput("");
                        }
                      }}
                      className="h-12 rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode="popLayout">
                      {(currentExp.details || []).map((detail, i) => (
                        <motion.div
                          key={i}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="group/item flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner shadow-black/5 dark:border-white/5 dark:bg-slate-950/40 dark:shadow-black/10"
                        >
                          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                            {detail}
                          </span>
                          <button
                            onClick={() =>
                              setCurrentExp({
                                ...currentExp,
                                details: currentExp.details.filter((_, idx) => idx !== i),
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
          )}
        </AdminDialogShell>

        <DragOverlay zIndex={99999} dropAnimation={null}>
          {activeId ? (
            <ExpRow exp={data.find((s) => s._id === activeId)!} isOverlay />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
