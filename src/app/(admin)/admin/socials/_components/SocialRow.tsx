"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical, FaEdit, FaTrash, FaLink } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SocialLink {
  _id?: string;
  href: string;
  label: string;
  iconUrl?: string;
  brandColor?: string;
  invertDark?: boolean;
  order: number;
}

interface SortableSocialRowProps {
  item: SocialLink;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function SortableSocialRow({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: SortableSocialRowProps) {
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
      className={cn(
        "group relative flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none dark:hover:border-white/10",
        isDragging && "z-50 border-cyan-500/50 shadow-2xl shadow-cyan-500/10"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none text-slate-700 transition-colors hover:text-slate-400 active:cursor-grabbing"
        >
          <FaGripVertical size={14} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-700 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400">
          {item.iconUrl ? (
            <Image
              src={item.iconUrl}
              alt={item.label}
              width={16}
              height={16}
              className={cn("h-4 w-4 object-contain", item.invertDark && "dark:invert")}
            />
          ) : (
            <FaLink size={16} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-slate-900 dark:text-white">
              {item.label}
            </h3>
            {item.brandColor && (
              <span className="shrink-0 rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400">
                {item.brandColor}
              </span>
            )}
          </div>
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {item.href}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-cyan-500/10 hover:text-cyan-600 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-cyan-500/15 dark:hover:text-cyan-400"
        >
          <FaEdit size={13} />
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
            <FaTrash size={13} />
          )}
        </Button>
      </div>
    </div>
  );
}

export function SocialOverlay({ item }: { item: SocialLink }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-cyan-500/30 bg-white p-4 shadow-2xl ring-1 ring-cyan-400/20 dark:bg-slate-800">
      <FaGripVertical className="text-cyan-500" size={14} />
      <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-400">
        {item.iconUrl ? (
          <Image
            src={item.iconUrl}
            alt={item.label}
            width={16}
            height={16}
            className={cn("h-4 w-4 object-contain", item.invertDark && "dark:invert")}
          />
        ) : (
          <FaLink size={16} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {item.label}
        </h3>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.href}</p>
      </div>
    </div>
  );
}
