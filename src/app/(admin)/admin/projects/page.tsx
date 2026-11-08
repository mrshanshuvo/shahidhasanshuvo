"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FaFolderOpen } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Project } from "@/types";
import type { ICategory } from "@/models/Category";
import { SortableProjectCard, DragOverlayCard } from "./_components/ProjectCardRow";
import { ProjectListToolbar } from "./_components/ProjectListToolbar";
import { AdminToast, useAdminToast } from "../components/AdminToast";

export default function AdminProjectsListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<Project[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast, showToast } = useAdminToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const { data: projectsData, isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const { data: categoriesData, isLoading: loadingCategories } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const data = localData ?? projectsData ?? [];
  const categories = categoriesData ?? [];
  const loading = loadingProjects || loadingCategories;

  const refreshCategories = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  function openEdit(project: Project) {
    router.push(`/admin/projects/${project._id}`);
  }

  function openNew() {
    router.push("/admin/projects/new");
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = data.findIndex((p) => p._id === active.id);
    const newIndex = data.findIndex((p) => p._id === over.id);

    const newData = arrayMove(data, oldIndex, newIndex).map((p, i) => ({
      ...p,
      order: i,
    }));

    setLocalData(newData);

    try {
      await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setLocalData(null);
    } catch (err) {
      console.error("Failed to reorder:", err);
      showToast("Failed to sync order.", "error");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setLocalData(null);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setLocalData((prev) => (prev ?? data).filter((p) => p._id !== id));
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showToast("Project deleted.");
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

  const filtered = data.filter((p) => {
    const mSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const mCat =
      filterCategory === "All" ||
      (Array.isArray(p.category)
        ? p.category.includes(filterCategory)
        : p.category === filterCategory);
    return mSearch && mCat;
  });

  const activeProject = activeId ? data.find((p) => p._id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 p-4 md:p-8">
        <AdminToast toast={toast} />

        <div className="mx-auto max-w-4xl space-y-6">
          <ProjectListToolbar
            totalCount={data.length}
            filteredCount={filtered.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            filterCategory={filterCategory}
            onFilterChange={setFilterCategory}
            onNew={openNew}
            onRefreshCategories={refreshCategories}
          />

          {/* List Card */}
          <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Projects Catalog
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/20"
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm dark:border-white/5 dark:bg-slate-950/20 dark:shadow-none">
                  <FaFolderOpen
                    className="mx-auto mb-4 text-slate-200 dark:text-slate-800"
                    size={40}
                  />
                  <p className="font-medium text-slate-400 dark:text-slate-500">
                    {searchQuery || filterCategory !== "All"
                      ? "No projects match your search criteria."
                      : "No projects in catalog yet. Click 'New Project' to add one."}
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={filtered.map((p) => p._id!)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2.5">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((project) => (
                        <SortableProjectCard
                          key={project._id}
                          project={project}
                          onEdit={() => openEdit(project)}
                          onDelete={() => handleDelete(project._id!)}
                          deleting={deletingId === project._id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              )}

              {!loading && filtered.length > 0 && (
                <p className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-700">
                  Drag cards to reorder • Changes save automatically
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeProject ? <DragOverlayCard project={activeProject} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
