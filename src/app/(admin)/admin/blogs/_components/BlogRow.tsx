"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FaNewspaper,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaLink,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

export interface Blog {
  _id?: string;
  title: string;
  description: string;
  link: string;
  date: string;
  tags: string[];
  image: string;
  order: number;
}

interface SortableBlogRowProps {
  item: Blog;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function SortableBlogRow({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: SortableBlogRowProps) {
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

export function BlogOverlay({ item }: { item: Blog }) {
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
