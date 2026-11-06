"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FaGraduationCap,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaLink,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";

export interface Education {
  _id?: string;
  degree: string;
  institution: string;
  location: string;
  logo: string;
  period: string;
  gpa: string;
  details: string[];
  link: string;
  order: number;
}

interface SortableEduRowProps {
  edu: Education;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function SortableEduRow({
  edu,
  onEdit,
  onDelete,
  isDeleting,
}: SortableEduRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: edu._id! });

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
          {edu.logo ? (
            <Image
              src={edu.logo}
              alt={edu.institution}
              fill
              className="object-contain p-2"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-700 dark:text-slate-400">
              <FaGraduationCap size={20} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-slate-900 dark:text-white">
              {edu.degree}
            </h3>
            {edu.gpa && (
              <span className="shrink-0 rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:border-white/5 dark:bg-slate-800 dark:text-slate-300">
                GPA: {edu.gpa}
              </span>
            )}
          </div>
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {edu.institution}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt size={10} className="text-slate-700 dark:text-slate-500" />
              {edu.period}
            </span>
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt size={10} className="text-slate-700 dark:text-slate-500" />
              {edu.location}
            </span>
            {edu.link && (
              <a
                href={edu.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline dark:text-blue-400"
              >
                <FaLink size={9} />
                Portal
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-blue-500/10 hover:text-blue-600 dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-500/15 dark:hover:text-blue-400"
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

export function EduOverlay({ edu }: { edu: Education }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-emerald-500/30 bg-white p-4 shadow-2xl dark:bg-slate-800">
      <div className="shrink-0 cursor-grabbing text-emerald-500">
        <FaGripVertical size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {edu.logo ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/5">
              <Image
                src={edu.logo}
                alt={edu.institution}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="shrink-0 rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <FaGraduationCap size={14} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {edu.degree}
            </h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {edu.institution}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 pr-2">
        <div className="hidden items-center gap-2 text-slate-500 md:flex">
          <FaCalendarAlt size={10} />
          <span className="text-[10px] font-medium">{edu.period}</span>
        </div>
      </div>
    </div>
  );
}
