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
import { FaPlus, FaCheck, FaTimes, FaNewspaper, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SortableBlogRow, BlogOverlay, type Blog } from "./_components/BlogRow";
import { BlogDialog } from "./_components/BlogDialog";

export default function AdminBlogsPage() {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<Blog[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
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

  const { data: fetchedData, isLoading: loading } = useQuery<Blog[]>({
    queryKey: ["blogs"],
    queryFn: async () => {
      const r = await fetch("/api/admin/blogs");
      if (!r.ok) throw new Error("Failed to fetch blogs");
      return r.json();
    },
  });

  const data: Blog[] = localData ?? fetchedData ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/blogs?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setLocalData((prev) => (prev ?? data).filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      showToast("Article deleted.");
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
      setLocalData(null);
      showToast(isEdit ? "Article updated!" : "Article published!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  function handleSave(blog: Blog) {
    if (!blog.title || !blog.link) return;
    saveMutation.mutate(blog);
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item._id === active.id);
      const newIndex = data.findIndex((item) => item._id === over.id);
      const newData = arrayMove(data, oldIndex, newIndex);
      setLocalData(newData);

      fetch("/api/admin/blogs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["blogs"] }));
    }
    setActiveId(null);
  }

  const filtered = data.filter((b) => {
    return (
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.tags ?? []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
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
                className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-xs text-slate-900 shadow-sm focus-visible:ring-orange-500/30 dark:border-white/5 dark:bg-slate-950 dark:text-white dark:shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
              />
            </div>

            <Badge
              variant="outline"
              className="rounded-full border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-orange-600 uppercase dark:text-orange-400"
            >
              {data.length} {data.length === 1 ? "Article" : "Articles"}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={openNew}
              className="h-10 rounded-xl bg-orange-600 px-6 text-xs font-black text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500"
            >
              <FaPlus className="mr-2" size={12} /> Write Article
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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500/10 text-orange-400">
                <FaNewspaper size={24} />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                No articles published yet
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Get started by sharing your first technical publication or insight.
              </p>
              <Button
                onClick={openNew}
                className="mt-6 rounded-xl bg-orange-600 px-6 font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500"
              >
                <FaPlus className="mr-2" size={12} /> Write Article
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
                  items={data.map((b) => b._id!)}
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

        <BlogDialog
          key={currentBlog?._id ?? (isDialogOpen ? "new" : "closed")}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          blog={currentBlog}
          onSave={handleSave}
          isSaving={saveMutation.isPending}
        />

        <DragOverlay dropAnimation={null}>
          {activeId ? <BlogOverlay item={data.find((s) => s._id === activeId)!} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
