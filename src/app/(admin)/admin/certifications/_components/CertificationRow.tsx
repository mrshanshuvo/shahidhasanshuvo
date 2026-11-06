"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaAward, FaGripVertical, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export interface Certification {
  _id?: string;
  title: string;
  issuer: string;
  date: string;
  certificateFile?: string;
  badgeLogo?: string;
  details: string[];
  order: number;
}

interface SortableCertRowProps {
  item: Certification;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function SortableCertRow({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: SortableCertRowProps) {
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
      className="group relative flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none dark:hover:border-white/10"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none text-slate-700 transition-colors hover:text-slate-400 active:cursor-grabbing"
        >
          <FaGripVertical size={14} />
        </div>

        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-2 dark:border-white/5 dark:bg-slate-800">
          {item.badgeLogo ? (
            <Image
              src={item.badgeLogo}
              alt={item.title}
              fill
              className="object-contain p-2"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-700 dark:text-slate-400">
              <FaAward size={20} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-slate-900 dark:text-white">
            {item.title}
          </h3>
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {item.issuer}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt size={10} className="text-slate-700 dark:text-slate-500" />
              {item.date}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-yellow-500/10 hover:text-yellow-600 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-yellow-500/15 dark:hover:text-yellow-400"
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

export function CertOverlay({ item }: { item: Certification }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-yellow-500/30 bg-white p-4 shadow-2xl dark:bg-slate-800">
      <div className="shrink-0 cursor-grabbing text-yellow-500">
        <FaGripVertical size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {item.badgeLogo ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/5">
              <Image
                src={item.badgeLogo}
                alt={item.title}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="shrink-0 rounded-lg bg-yellow-500/10 p-2 text-yellow-400">
              <FaAward size={14} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {item.title}
            </h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {item.issuer}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 pr-2">
        <div className="hidden items-center gap-2 text-slate-500 md:flex">
          <FaCalendarAlt size={10} />
          <span className="text-[10px] font-medium">{item.date}</span>
        </div>
      </div>
    </div>
  );
}
