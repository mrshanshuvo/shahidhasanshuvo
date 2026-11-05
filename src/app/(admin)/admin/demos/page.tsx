"use client";
import { useState, useEffect } from "react";
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
  FaFlask,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaLink,
  FaInfoCircle,
  FaStar,
  FaImage,
  FaGithub,
  FaSearch,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import MediaGalleryManager from "../components/MediaGalleryManager";
import ImageUpload from "../components/ImageUpload";
import { AdminDialogShell } from "../components/AdminDialogShell";
import { AdminField, AdminInput, AdminTextarea } from "../components/AdminFields";
import TechCombobox from "../components/TechCombobox";
import type { Technology } from "@/types";

interface Demo {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  url: string;
  github?: string;
  featured?: boolean;
  image?: string;
  tech: string[];
  media: any[];
  order: number;
}

function SortableDemoRow({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: Demo;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const thumb = item.media?.find((m) => m.type === "image")?.url || item.image || "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none dark:hover:border-white/10"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none text-slate-700 transition-colors hover:text-slate-400 active:cursor-grabbing"
      >
        <FaGripVertical size={14} />
      </div>

      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-slate-800">
        {thumb ? (
          <div className="relative h-full w-full">
            <Image src={thumb} alt={item.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-700 dark:text-slate-400">
            <FaFlask size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          {item.featured && <FaStar className="shrink-0 text-amber-400" size={11} />}
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {item.title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.tech.slice(0, 3).map((t, i) => (
            <span
              key={i}
              className="rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-400"
            >
              {t}
            </span>
          ))}
          {item.tech.length > 3 && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              +{item.tech.length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-600 dark:text-slate-400">
          {(item.media?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <FaImage size={9} /> {item.media.length}
            </span>
          )}
          {item.github && (
            <span className="flex items-center gap-1">
              <FaGithub size={9} /> Source
            </span>
          )}
          {item.url && (
            <span className="flex items-center gap-1">
              <FaLink size={9} /> Live
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-indigo-500/10 hover:text-indigo-600 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400"
        >
          <FaEdit size={12} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={isDeleting}
          className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-red-500/10 hover:text-red-600 disabled:opacity-40 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          {isDeleting ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
          ) : (
            <FaTrash size={12} />
          )}
        </Button>
      </div>
    </div>
  );
}

function DemoOverlay({ demo }: { demo: Demo }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-indigo-500/30 bg-white p-4 shadow-2xl dark:bg-slate-800">
      <div className="shrink-0 cursor-grabbing text-indigo-500">
        <FaGripVertical size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
            <FaFlask size={14} />
          </div>
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-900 dark:text-white">
              {demo.featured && <FaStar className="shrink-0 text-amber-400" size={11} />}
              {demo.title}
            </h3>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {demo.tech.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-400"
                >
                  {t}
                </span>
              ))}
              {demo.tech.length > 3 && (
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  +{demo.tech.length - 3}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-600 dark:text-slate-400">
              {(demo.media?.length ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <FaImage size={9} /> {demo.media.length}
                </span>
              )}
              {demo.github && (
                <span className="flex items-center gap-1">
                  <FaGithub size={9} /> Source
                </span>
              )}
              {demo.url && (
                <span className="flex items-center gap-1">
                  <FaLink size={9} /> Live
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDemosPage() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Demo[]>([]);
  const [prevFetchedData, setPrevFetchedData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<Demo | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
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

  const { data: fetchedData, isLoading: loading } = useQuery({
    queryKey: ["demos"],
    queryFn: async () => {
      const r = await fetch("/api/admin/demos");
      if (!r.ok) throw new Error("Failed to fetch demos");
      return r.json();
    },
  });

  if (fetchedData !== prevFetchedData) {
    setPrevFetchedData(fetchedData);
    if (fetchedData) {
      setData(Array.isArray(fetchedData) ? fetchedData : []);
    }
  }

  // Fetch technologies from the API
  useEffect(() => {
    fetch("/api/admin/technologies")
      .then((r) => r.json())
      .then((data) => {
        setTechnologies(Array.isArray(data) ? data : []);
      })
      .catch(console.error);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/demos?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setData((prev) => prev.filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["demos"] });
      showToast("Demo deleted.");
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
    mutationFn: async (demo: Demo) => {
      const isEdit = !!demo._id;
      const url = isEdit ? `/api/admin/demos?id=${demo._id}` : "/api/admin/demos";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demo),
      });
      if (!res.ok) throw new Error("Failed to save");
      return { isEdit };
    },
    onSuccess: ({ isEdit }) => {
      setIsDialogOpen(false);
      showToast(isEdit ? "Demo updated!" : "Demo added!");
      queryClient.invalidateQueries({ queryKey: ["demos"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  async function handleAddOrUpdate() {
    if (!currentDemo?.title || !currentDemo?.url) return;
    saveMutation.mutate(currentDemo);
  }

  function openEdit(item: Demo) {
    setCurrentDemo({ ...item });
    setIsDialogOpen(true);
  }

  function openNew() {
    setCurrentDemo({
      title: "",
      slug: "",
      description: "",
      url: "",
      github: "",
      featured: false,
      image: "",
      tech: [],
      media: [],
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
      fetch("/api/admin/demos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["demos"] }));
    }
    setActiveId(null);
  }

  const filtered = data.filter((d) => {
    const mSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.tech ?? []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return mSearch;
  });

  const isFiltered = !!searchQuery;

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
                className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-xs text-slate-900 shadow-sm focus-visible:ring-indigo-500/30 dark:border-white/5 dark:bg-slate-950 dark:text-white dark:shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search demos..."
              />
            </div>

            <Badge
              variant="outline"
              className="rounded-full border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-400"
            >
              {data.length} {data.length === 1 ? "Demo" : "Demos"}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={openNew}
              className="h-10 rounded-xl bg-indigo-600 px-6 text-xs font-black text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
            >
              <FaPlus className="mr-2" size={12} /> Add Demo
            </Button>
          </div>
        </div>

        <div className="w-full">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-[1.5rem] border border-white/5 bg-slate-900/30"
                />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-[3rem] border-2 border-dashed border-white/5 py-32 text-center">
              <FaFlask size={48} className="mx-auto mb-4 animate-pulse text-slate-800" />
              <h3 className="mb-2 text-xl font-bold text-slate-400">No demos yet</h3>
              <p className="mb-8 text-sm text-slate-600">
                Share your interactive experiments with the world.
              </p>
              <Button
                onClick={openNew}
                className="h-12 rounded-xl border border-indigo-500/20 bg-indigo-600/10 px-8 font-bold text-indigo-400 hover:bg-indigo-600/20"
              >
                <FaPlus className="mr-2" /> Add First Demo
              </Button>
            </div>
          ) : (
            <>
              {isFiltered ? (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((item) => (
                      <SortableDemoRow
                        key={item._id}
                        item={item}
                        onEdit={() => openEdit(item)}
                        onDelete={() => handleDelete(item._id!)}
                        isDeleting={deletingId === item._id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <SortableContext
                  items={data.map((s) => s._id!)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {data.map((item) => (
                        <SortableDemoRow
                          key={item._id}
                          item={item}
                          onEdit={() => openEdit(item)}
                          onDelete={() => handleDelete(item._id!)}
                          isDeleting={deletingId === item._id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              )}

              <p className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-700 uppercase">
                {isFiltered
                  ? `Showing ${filtered.length} of ${data.length} demos`
                  : "Drag rows to reorder • Changes save automatically"}
              </p>
            </>
          )}
        </div>

        <AdminDialogShell
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={currentDemo?._id ? "Refine Experiment" : "New Playground Demo"}
          subtitle="Curate and showcase your interactive experiments"
          icon={FaFlask}
          iconColor="text-indigo-400"
          accentColor="from-indigo-500/5 to-purple-500/5"
          onSave={handleAddOrUpdate}
          saving={saveMutation.isPending}
          saveLabel={currentDemo?._id ? "Update Demo" : "Publish Demo"}
          savingLabel="Processing..."
          maxWidth="5xl"
        >
          {currentDemo && (
            <div className="px-1">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
                {/* Left Column: Visuals */}
                <div className="space-y-6">
                  <AdminField label="Media Gallery">
                    <div className="mb-4 flex items-start gap-4 rounded-3xl border border-indigo-500/10 bg-indigo-500/5 p-6 shadow-sm dark:border-indigo-500/20 dark:shadow-none">
                      <FaInfoCircle
                        className="mt-1 shrink-0 text-indigo-600 dark:text-indigo-400"
                        size={16}
                      />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black tracking-wider text-indigo-600 uppercase dark:text-indigo-400/90">
                          Visual Engagement
                        </p>
                        <p className="text-[11px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                          Showcase your work visually. You can add multiple images or
                          videos to document your experiment.
                        </p>
                      </div>
                    </div>
                    <MediaGalleryManager
                      media={currentDemo.media}
                      onChange={(newMedia) =>
                        setCurrentDemo({ ...currentDemo, media: newMedia })
                      }
                    />
                  </AdminField>

                  <AdminField label="Thumbnail / Cover">
                    <ImageUpload
                      value={currentDemo.image || ""}
                      onChange={(url) => setCurrentDemo({ ...currentDemo, image: url })}
                    />
                  </AdminField>
                </div>

                {/* Right Column: Information */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <AdminField label="Demo Title">
                      <AdminInput
                        icon={FaFlask}
                        value={currentDemo.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          const slug = title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)+/g, "");
                          setCurrentDemo({
                            ...currentDemo,
                            title,
                            slug: currentDemo._id ? currentDemo.slug : slug,
                          });
                        }}
                        placeholder="e.g. AI-Powered Chatbot"
                      />
                    </AdminField>
                    <AdminField label="Slug">
                      <AdminInput
                        icon={FaLink}
                        value={currentDemo.slug || ""}
                        onChange={(e) =>
                          setCurrentDemo({
                            ...currentDemo,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-"),
                          })
                        }
                        placeholder="ai-powered-chatbot"
                      />
                    </AdminField>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <AdminField label="Live URL">
                      <AdminInput
                        icon={FaLink}
                        value={currentDemo.url}
                        onChange={(e) =>
                          setCurrentDemo({
                            ...currentDemo,
                            url: e.target.value,
                          })
                        }
                        placeholder="https://playground..."
                      />
                    </AdminField>
                    <AdminField label="GitHub Repository URL">
                      <AdminInput
                        icon={FaGithub}
                        value={currentDemo.github || ""}
                        onChange={(e) =>
                          setCurrentDemo({
                            ...currentDemo,
                            github: e.target.value,
                          })
                        }
                        placeholder="https://github.com/..."
                      />
                    </AdminField>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <AdminField label="Featured Flag">
                      <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-900/20 px-4 dark:border-white/5 dark:bg-slate-950/40">
                        <label className="flex w-full cursor-pointer items-center gap-3 select-none">
                          <input
                            type="checkbox"
                            checked={!!currentDemo.featured}
                            onChange={(e) =>
                              setCurrentDemo({
                                ...currentDemo,
                                featured: e.target.checked,
                              })
                            }
                            className="size-4 cursor-pointer rounded border-slate-300 accent-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-slate-950"
                          />
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <FaStar className="text-amber-400" size={11} /> Featured Lab
                            Experiment
                          </span>
                        </label>
                      </div>
                    </AdminField>
                  </div>

                  <AdminField label="Description">
                    <AdminTextarea
                      value={currentDemo.description}
                      onChange={(e) =>
                        setCurrentDemo({
                          ...currentDemo,
                          description: e.target.value,
                        })
                      }
                      placeholder="What is this experiment about?..."
                      className="min-h-30"
                    />
                  </AdminField>

                  <AdminField label="Technologies Used">
                    <TechCombobox
                      value={currentDemo.tech}
                      onChange={(val) => setCurrentDemo({ ...currentDemo, tech: val })}
                      technologies={technologies}
                    />
                  </AdminField>
                </div>
              </div>
            </div>
          )}
        </AdminDialogShell>

        <DragOverlay dropAnimation={null}>
          {activeId ? <DemoOverlay demo={data.find((s) => s._id === activeId)!} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
