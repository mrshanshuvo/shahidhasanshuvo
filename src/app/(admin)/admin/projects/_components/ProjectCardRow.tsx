"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import {
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaStar,
  FaImage,
  FaVideo,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

export interface ProjectCardRowProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export function SortableProjectCard({
  project,
  onEdit,
  onDelete,
  deleting,
}: ProjectCardRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project._id! });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
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
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none dark:hover:border-white/10",
        isDragging && "opacity-30"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-slate-400 transition-colors hover:text-emerald-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-emerald-400"
        aria-label="Drag to reorder"
      >
        <FaGripVertical size={14} />
      </button>

      {/* Thumbnail */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
        {thumb ? (
          <Image
            src={thumb}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="56px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
            <FaImage size={18} />
          </div>
        )}
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          {project.featured && (
            <FaStar className="shrink-0 text-amber-500 dark:text-amber-400" size={11} />
          )}
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {project.title}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-600">
            #{project.order}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
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

          {mediaCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
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

export function DragOverlayCard({ project }: { project: Project }) {
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
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
        {thumb ? (
          <Image src={thumb} alt={project.title} fill className="object-cover" />
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
