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
import { FaPlus, FaFlask, FaSearch } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Technology } from "@/types";
import { SortableDemoRow, DemoOverlay, type Demo } from "./_components/DemoRow";
import { DemoDialog } from "./_components/DemoDialog";
import { AdminToast, useAdminToast } from "../components/AdminToast";

export default function AdminDemosPage() {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<Demo[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<Demo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast, showToast } = useAdminToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: fetchedData, isLoading: loading } = useQuery<Demo[]>({
    queryKey: ["demos"],
    queryFn: async () => {
      const r = await fetch("/api/admin/demos");
      if (!r.ok) throw new Error("Failed to fetch demos");
      return r.json();
    },
  });

  const { data: technologies = [] } = useQuery<Technology[]>({
    queryKey: ["technologies"],
    queryFn: async () => {
      const r = await fetch("/api/admin/technologies");
      if (!r.ok) throw new Error("Failed to fetch technologies");
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const data: Demo[] = localData ?? fetchedData ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/demos?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setLocalData((prev) => (prev ?? data).filter((s) => s._id !== id));
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
      setLocalData(null);
      showToast(isEdit ? "Demo updated!" : "Demo added!");
      queryClient.invalidateQueries({ queryKey: ["demos"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  function handleSave(demo: Demo) {
    if (!demo.title || !demo.url) return;
    saveMutation.mutate(demo);
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item._id === active.id);
      const newIndex = data.findIndex((item) => item._id === over.id);
      const newData = arrayMove(data, oldIndex, newIndex);
      setLocalData(newData);

      fetch("/api/admin/demos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["demos"] }));
    }
    setActiveId(null);
  }

  const filtered = data.filter((d) => {
    return (
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.tech ?? []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
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
        <AdminToast toast={toast} />

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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-400">
                <FaFlask size={24} />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">No demos added yet</h3>
              <p className="mt-1 text-xs text-slate-500">
                Get started by creating your first interactive demo.
              </p>
              <Button
                onClick={openNew}
                className="mt-6 rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
              >
                <FaPlus className="mr-2" size={12} /> Add Demo
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
                  items={data.map((d) => d._id!)}
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

        <DemoDialog
          key={currentDemo?._id ?? (isDialogOpen ? "new" : "closed")}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          demo={currentDemo}
          technologies={technologies}
          onSave={handleSave}
          isSaving={saveMutation.isPending}
        />

        <DragOverlay dropAnimation={null}>
          {activeId ? <DemoOverlay demo={data.find((s) => s._id === activeId)!} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
