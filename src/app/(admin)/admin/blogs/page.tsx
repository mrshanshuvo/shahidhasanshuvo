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
  FaCheck,
  FaTimes,
  FaNewspaper,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaLink,
  FaTag,
  FaBookOpen,
  FaInfoCircle,
  FaSearch,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import ImageUpload from "../components/ImageUpload";
import DateTimePicker from "../components/DateTimePicker";
import { AdminDialogShell } from "../components/AdminDialogShell";
import { AdminField, AdminInput, AdminTextarea } from "../components/AdminFields";

interface Blog {
  _id?: string;
  title: string;
  description: string;
  link: string;
  date: string;
  tags: string[];
  image: string;
  order: number;
}

function SortableBlogRow({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: Blog;
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
        {item.image ? (
          <div className="relative h-full w-full">
            <Image src={item.image} alt={item.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-700 dark:text-slate-400">
            <FaNewspaper size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {item.title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.tags.slice(0, 3).map((t, i) => (
            <span
              key={i}
              className="rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-400"
            >
              {t}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <FaCalendarAlt size={9} /> {formatRelativeTime(item.date)}
          </span>
          {item.link && (
            <span className="flex items-center gap-1">
              <FaLink size={9} /> Link
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
          className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-orange-500/10 hover:text-orange-600 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-orange-500/15 dark:hover:text-orange-400"
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

function BlogOverlay({ item }: { item: Blog }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-orange-500/30 bg-white p-4 shadow-2xl dark:bg-slate-800">
      <div className="shrink-0 cursor-grabbing text-orange-500">
        <FaGripVertical size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-slate-800">
            {item.image ? (
              <div className="relative h-full w-full">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-700 dark:text-slate-400">
                <FaNewspaper size={20} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {item.title}
            </h3>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-400"
                >
                  {t}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <FaCalendarAlt size={9} /> {formatRelativeTime(item.date)}
              </span>
              {item.link && (
                <span className="flex items-center gap-1">
                  <FaLink size={9} /> Link
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogsPage() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Blog[]>([]);
  const [prevFetchedData, setPrevFetchedData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [tagInput, setTagInput] = useState("");
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
    queryKey: ["blogs"],
    queryFn: async () => {
      const r = await fetch("/api/admin/blogs");
      if (!r.ok) throw new Error("Failed to fetch blogs");
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
      const res = await fetch(`/api/admin/blogs?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setData((prev) => prev.filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      showToast("Post deleted.");
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
    mutationFn: async (blog: Blog) => {
      const isEdit = !!blog._id;
      const url = isEdit ? `/api/admin/blogs?id=${blog._id}` : "/api/admin/blogs";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blog),
      });
      if (!res.ok) throw new Error("Failed to save");
      return { isEdit };
    },
    onSuccess: ({ isEdit }) => {
      setIsDialogOpen(false);
      showToast(isEdit ? "Post updated!" : "Post added!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  async function handleAddOrUpdate() {
    if (!currentBlog?.title || !currentBlog?.link) return;
    saveMutation.mutate(currentBlog);
  }

  function openEdit(item: Blog) {
    setCurrentBlog({ ...item });
    setIsDialogOpen(true);
  }

  function openNew() {
    setCurrentBlog({
      title: "",
      description: "",
      link: "",
      date: new Date().toISOString(),
      tags: [],
      image: "",
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
      fetch("/api/admin/blogs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["blogs"] }));
    }
    setActiveId(null);
  }

  const filtered = data.filter((d) => {
    const mSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.tags ?? []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
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
      <div className="space-y-6 p-4 font-sans md:p-8">
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
                className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-xs text-slate-900 shadow-sm focus-visible:ring-orange-500/30 dark:border-white/5 dark:bg-slate-950 dark:text-white dark:shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blog posts..."
              />
            </div>

            <Badge
              variant="outline"
              className="rounded-full border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-orange-600 uppercase dark:text-orange-400"
            >
              {data.length} {data.length === 1 ? "Blog Post" : "Blog Posts"}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={openNew}
              className="h-10 rounded-xl bg-orange-600 px-6 text-xs font-black text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-500 active:scale-95"
            >
              <FaPlus className="mr-2" size={12} /> Add Post
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
            <div className="rounded-[3rem] border-2 border-dashed border-slate-200 py-32 text-center dark:border-white/5">
              <FaNewspaper
                size={48}
                className="mx-auto mb-4 animate-pulse text-slate-800"
              />
              <h3 className="mb-2 text-xl font-bold text-slate-400">No blog posts yet</h3>
              <p className="mb-8 text-sm text-slate-600">
                Share your knowledge and technical insights with the world.
              </p>
              <Button
                onClick={openNew}
                className="h-12 rounded-xl border border-orange-500/20 bg-orange-600/10 px-8 font-bold text-orange-400 hover:bg-orange-600/20"
              >
                <FaPlus className="mr-2" /> Add First Post
              </Button>
            </div>
          ) : (
            <>
              {isFiltered ? (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((item) => (
                      <SortableBlogRow
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
                        <SortableBlogRow
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
                  ? `Showing ${filtered.length} of ${data.length} blog posts`
                  : "Drag rows to reorder • Changes save automatically"}
              </p>
            </>
          )}
        </div>

        <AdminDialogShell
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={currentBlog?._id ? "Refine Article" : "Draft New Insight"}
          subtitle="Share your knowledge and technical insights"
          icon={FaBookOpen}
          iconColor="text-orange-400"
          accentColor="from-orange-500/5 to-red-500/5"
          onSave={handleAddOrUpdate}
          saving={saveMutation.isPending}
          saveLabel={currentBlog?._id ? "Update Article" : "Publish Insight"}
          savingLabel="Publishing..."
          maxWidth="5xl"
        >
          {currentBlog && (
            <div className="px-1">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
                {/* Left Column: Visuals & Branding */}
                <div className="space-y-6">
                  <AdminField label="Cover Narrative Image">
                    <ImageUpload
                      value={currentBlog.image}
                      onChange={(url) => setCurrentBlog({ ...currentBlog, image: url })}
                    />
                  </AdminField>

                  <div className="flex items-start gap-4 rounded-3xl border border-orange-500/10 bg-orange-500/5 p-6">
                    <FaInfoCircle className="mt-1 shrink-0 text-orange-400" size={16} />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black tracking-wider text-orange-400/90 uppercase">
                        Visual Engagement
                      </p>
                      <p className="text-[11px] leading-relaxed font-medium text-slate-400">
                        A high-quality cover image significantly increases click-through
                        rates. Choose an image that visually summarizes your
                        article&apos;s core topic.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Article Details */}
                <div className="space-y-4">
                  <AdminField label="Article Title">
                    <AdminInput
                      icon={FaBookOpen}
                      value={currentBlog.title}
                      onChange={(e) =>
                        setCurrentBlog({
                          ...currentBlog,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g. Master Next.js 14 Server Actions"
                    />
                  </AdminField>

                  <AdminField label="Publish Date">
                    <DateTimePicker
                      value={currentBlog.date}
                      onChange={(val) =>
                        setCurrentBlog({
                          ...currentBlog,
                          date: val,
                        })
                      }
                    />
                  </AdminField>

                  <AdminField label="Article Source URL">
                    <AdminInput
                      icon={FaLink}
                      value={currentBlog.link}
                      onChange={(e) =>
                        setCurrentBlog({ ...currentBlog, link: e.target.value })
                      }
                      placeholder="https://medium.com/your-article"
                    />
                  </AdminField>

                  <AdminField label="Synopsis">
                    <AdminTextarea
                      value={currentBlog.description}
                      onChange={(e) =>
                        setCurrentBlog({
                          ...currentBlog,
                          description: e.target.value,
                        })
                      }
                      placeholder="A compelling summary of the article..."
                      className="min-h-30"
                    />
                  </AdminField>

                  <AdminField label="Taxonomy / Tags">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <AdminInput
                          icon={FaTag}
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (tagInput.trim()) {
                                setCurrentBlog({
                                  ...currentBlog,
                                  tags: [...currentBlog.tags, tagInput.trim()],
                                });
                                setTagInput("");
                              }
                            }
                          }}
                          placeholder="e.g. Next.js"
                          className="h-12 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (tagInput.trim()) {
                              setCurrentBlog({
                                ...currentBlog,
                                tags: [...currentBlog.tags, tagInput.trim()],
                              });
                              setTagInput("");
                            }
                          }}
                          className="h-12 rounded-xl border border-slate-200 bg-slate-900 px-6 font-bold text-white shadow-inner shadow-black/5 hover:bg-slate-800 dark:border-white/5 dark:bg-slate-800 dark:shadow-black/20 dark:hover:bg-slate-700"
                        >
                          <FaPlus size={14} />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <AnimatePresence>
                          {currentBlog.tags.map((tag, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Badge
                                variant="secondary"
                                className="group gap-2 rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-orange-600 shadow-inner shadow-black/5 transition-all dark:border-white/5 dark:bg-slate-950/40 dark:text-orange-400 dark:shadow-black/10"
                              >
                                <span className="text-xs font-bold">{tag}</span>
                                <button
                                  onClick={() =>
                                    setCurrentBlog({
                                      ...currentBlog,
                                      tags: currentBlog.tags.filter(
                                        (_, idx) => idx !== i
                                      ),
                                    })
                                  }
                                  className="p-1 text-slate-500 transition-colors hover:text-red-400"
                                >
                                  <FaTimes size={10} />
                                </button>
                              </Badge>
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
          {activeId ? <BlogOverlay item={data.find((s) => s._id === activeId)!} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
