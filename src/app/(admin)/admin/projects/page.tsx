"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaStar,
  FaTrash,
  FaEdit,
  FaGithub,
  FaExternalLinkAlt,
  FaImage,
  FaVideo,
  FaGripVertical,
  FaCode,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Project, Category as ICategory } from "@/types";
import CategoryManagerDialog from "../components/CategoryManagerDialog";

// ─── Sortable Row ───────────────────────────────────────────────────────────
function SortableProjectCard({
  project,
  onEdit,
  onDelete,
  deleting,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const thumb =
    project.media?.find((m) => m.type === "image")?.url || project.image || "";
  const mediaCount = project.media?.length ?? 0;
  const imgCount = project.media?.filter((m) => m.type === "image").length ?? 0;
  const vidCount = project.media?.filter((m) => m.type === "video").length ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-2 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none dark:hover:border-white/10"
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
            <Image src={thumb} alt={project.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-700">
            <FaImage size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          {project.featured && <FaStar className="shrink-0 text-amber-400" size={11} />}
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {project.title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Array.isArray(project.category)
            ? project.category.map((cat) => (
                <Badge
                  key={cat}
                  className="rounded-lg border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 shadow-sm dark:text-emerald-400 dark:shadow-none"
                >
                  {cat}
                </Badge>
              ))
            : project.category && (
                <Badge className="rounded-lg border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 shadow-sm dark:text-emerald-400 dark:shadow-none">
                  {project.category}
                </Badge>
              )}
          {(project.techNames ?? []).slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-400"
            >
              {t}
            </span>
          ))}
          {(project.techNames?.length ?? 0) > 3 && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              +{(project.techNames?.length ?? 0) - 3}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-600 dark:text-slate-400">
          {mediaCount > 0 && (
            <span className="flex items-center gap-1">
              {imgCount > 0 && (
                <>
                  <FaImage size={9} /> {imgCount}
                </>
              )}
              {vidCount > 0 && (
                <>
                  <FaVideo size={9} className="ml-1" /> {vidCount}
                </>
              )}
            </span>
          )}
          {(project.github?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <FaGithub size={9} /> {project.github!.length}
            </span>
          )}
          {(project.live?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <FaExternalLinkAlt size={9} /> {project.live!.length}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 transition-opacity">
        <Button
          onClick={onEdit}
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-600 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-400"
        >
          <FaEdit size={12} />
        </Button>
        <Button
          onClick={onDelete}
          disabled={deleting}
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-red-500/10 hover:text-red-600 disabled:opacity-40 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          <FaTrash size={12} />
        </Button>
      </div>
    </div>
  );
}

// ─── Drag Overlay Card (floats under cursor) ────────────────────────────────
function DragOverlayCard({ project }: { project: Project }) {
  const thumb =
    project.media?.find((m) => m.type === "image")?.url || project.image || "";
  const mediaCount = project.media?.length ?? 0;
  const imgCount = project.media?.filter((m) => m.type === "image").length ?? 0;
  const vidCount = project.media?.filter((m) => m.type === "video").length ?? 0;

  return (
    <div className="flex scale-105 items-center gap-4 rounded-2xl border border-emerald-500/30 bg-white p-4 shadow-2xl ring-1 ring-emerald-500/20 dark:bg-slate-800">
      <div className="shrink-0 cursor-grabbing text-emerald-400">
        <FaGripVertical size={14} />
      </div>
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
        {thumb ? (
          <div className="relative h-full w-full">
            <Image src={thumb} alt={project.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-700">
            <FaImage size={20} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          {project.featured && <FaStar className="shrink-0 text-amber-400" size={11} />}
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {project.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {Array.isArray(project.category)
            ? project.category.map((cat) => (
                <Badge
                  key={cat}
                  className="rounded-lg border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 shadow-sm dark:text-emerald-400 dark:shadow-none"
                >
                  {cat}
                </Badge>
              ))
            : project.category && (
                <Badge className="rounded-lg border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 shadow-sm dark:text-emerald-400 dark:shadow-none">
                  {project.category}
                </Badge>
              )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-600 dark:text-slate-400">
          {mediaCount > 0 && (
            <span className="flex items-center gap-1">
              {imgCount > 0 && (
                <>
                  <FaImage size={9} /> {imgCount}
                </>
              )}
              {vidCount > 0 && (
                <>
                  <FaVideo size={9} className="ml-1" /> {vidCount}
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminProjectsListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [data, setData] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [prevProjectsData, setPrevProjectsData] = useState<any>(null);
  const [prevCategoriesData, setPrevCategoriesData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const loading = loadingProjects || loadingCategories;

  if (projectsData !== prevProjectsData) {
    setPrevProjectsData(projectsData);
    if (projectsData) {
      setData(Array.isArray(projectsData) ? projectsData : []);
    }
  }

  if (categoriesData !== prevCategoriesData) {
    setPrevCategoriesData(categoriesData);
    if (categoriesData) {
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    }
  }

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

    setData(newData);

    try {
      await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err) {
      console.error("Failed to reorder:", err);
      showToast("Failed to sync order.", "error");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
      setData((prev) => prev.filter((p) => p._id !== id));
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

  const isFiltered = searchQuery || filterCategory !== "All";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 p-4 md:p-8">
        {/* Toast */}
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
                className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-xs text-slate-900 shadow-sm focus-visible:ring-emerald-500/30 dark:border-white/5 dark:bg-slate-950 dark:text-white dark:shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
              />
            </div>

            <Select
              value={filterCategory}
              onValueChange={(v: string | null) => setFilterCategory(v || "All")}
            >
              <SelectTrigger className="w-37.5 rounded-xl border-slate-200 bg-white py-5 text-xs text-slate-900 shadow-sm dark:border-white/5 dark:bg-slate-950 dark:text-white dark:shadow-none">
                <FaFilter className="mr-2 text-slate-600" size={10} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-white">
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CategoryManagerDialog onUpdate={refreshCategories} />
            <Badge
              variant="outline"
              className="rounded-full border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400"
            >
              {data.length} {data.length === 1 ? "Project" : "Projects"}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={openNew}
              className="h-10 rounded-xl bg-emerald-600 px-6 text-xs font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <FaPlus className="mr-2" size={12} /> Add Project
            </Button>
          </div>
        </div>

        <div className="w-full">
          {/* List Content */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl border border-white/5 bg-slate-900/30"
                />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-[3rem] border-2 border-dashed border-white/5 py-32 text-center">
              <FaCode size={48} className="mx-auto mb-4 text-slate-800" />
              <h3 className="mb-2 text-xl font-bold text-slate-400">No projects yet</h3>
              <p className="mb-8 text-sm text-slate-600">
                Start building your portfolio by adding your first project.
              </p>
              <Button
                onClick={openNew}
                className="h-12 rounded-xl border border-emerald-500/20 bg-emerald-600/10 px-8 font-bold text-emerald-400 hover:bg-emerald-600/20"
              >
                <FaPlus className="mr-2" /> Add First Project
              </Button>
            </div>
          ) : (
            <>
              {isFiltered ? (
                // Non-DnD view when filtering (can't reorder filtered subset)
                <div className="space-y-3">
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
              ) : (
                <>
                  <SortableContext
                    items={data.map((p) => p._id!)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {data.map((project) => (
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
                </>
              )}

              <p className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-700 uppercase">
                {isFiltered
                  ? `Showing ${filtered.length} of ${data.length} projects`
                  : "Drag rows to reorder • Changes save automatically"}
              </p>
            </>
          )}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <DragOverlayCard project={data.find((p) => p._id === activeId)!} />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
