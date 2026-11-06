"use client";

import { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FaBriefcase,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ExperienceItem {
  _id?: string;
  title: string;
  org: string;
  duration: string;
  details: string[];
  order: number;
  url?: string;
  previousTitles?: string[];
  links?: { label?: string; url: string }[];
  technologies?: string[];
}

export interface ExpRowProps {
  exp: ExperienceItem;
  isOverlay?: boolean;
  isDragging?: boolean;
  isDeleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  attributes?: Record<string, any>;
  listeners?: Record<string, any>;
  style?: React.CSSProperties;
}

export const ExpRow = forwardRef<HTMLDivElement, ExpRowProps>(
  (
    {
      exp,
      isOverlay,
      isDragging,
      isDeleting,
      onEdit,
      onDelete,
      attributes,
      listeners,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        style={style}
        {...props}
        className={cn(
          "group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900 dark:shadow-none",
          !isOverlay &&
            "transition-colors duration-300 hover:border-slate-300 dark:bg-slate-900/40 dark:hover:border-white/10",
          isDragging && !isOverlay && "opacity-50",
          isOverlay &&
            "z-99999 scale-[1.02] cursor-grabbing border-emerald-500/50 shadow-2xl shadow-emerald-500/20"
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "text-slate-300 transition-colors dark:text-slate-600",
            isOverlay
              ? "cursor-grabbing"
              : "cursor-grab hover:text-emerald-500 dark:hover:text-emerald-400"
          )}
        >
          <FaGripVertical size={14} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <FaBriefcase size={14} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {exp.title}
              </h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {exp.org}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 pr-2">
          <div className="hidden items-center gap-2 text-slate-500 md:flex">
            <FaCalendarAlt size={10} />
            <span className="text-[10px] font-medium">{exp.duration}</span>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 transition-opacity",
              isOverlay ? "opacity-0" : ""
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 rounded-lg text-slate-400 hover:bg-emerald-400/10 hover:text-emerald-400"
            >
              <FaEdit size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={isDeleting}
              className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            >
              {isDeleting ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
              ) : (
                <FaTrash size={12} />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
ExpRow.displayName = "ExpRow";

export function SortableExpRow({
  exp,
  onEdit,
  onDelete,
  isDeleting,
}: {
  exp: ExperienceItem;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exp._id! });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <ExpRow
      ref={setNodeRef}
      style={style}
      exp={exp}
      isDragging={isDragging}
      attributes={attributes}
      listeners={listeners}
      onEdit={onEdit}
      onDelete={onDelete}
      isDeleting={isDeleting}
    />
  );
}
