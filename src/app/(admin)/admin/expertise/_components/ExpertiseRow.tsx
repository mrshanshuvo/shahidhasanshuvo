"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaCode, FaGripVertical, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types";

interface SortableSkillRowProps {
  skill: Skill;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function SortableSkillRow({
  skill,
  onEdit,
  onDelete,
  isDeleting,
}: SortableSkillRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: skill._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none dark:hover:border-white/10",
        isDragging && "z-50 border-purple-500/50 shadow-2xl shadow-purple-500/10"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-300 transition-colors hover:text-purple-500 active:cursor-grabbing dark:text-slate-600"
      >
        <FaGripVertical size={14} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
            {skill.iconUrl ? (
              <Image
                src={skill.iconUrl}
                alt={skill.name}
                width={14}
                height={14}
                className="object-contain"
              />
            ) : (
              <FaCode size={14} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {skill.name}
            </h3>
            <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase dark:text-slate-500">
              {skill.tech}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-purple-400/10 hover:text-purple-400"
          >
            <FaEdit size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-400/10 hover:text-red-400"
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

export function ExpertiseOverlay({ skill }: { skill: Skill }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-purple-500/30 bg-white p-4 shadow-2xl dark:bg-slate-800">
      <FaGripVertical className="text-purple-500" size={14} />
      <div className="flex items-center justify-center rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
        {skill.iconUrl ? (
          <Image
            src={skill.iconUrl}
            alt={skill.name}
            width={14}
            height={14}
            className="object-contain"
          />
        ) : (
          <FaCode size={14} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {skill.name}
        </h3>
        <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase dark:text-slate-500">
          {skill.tech}
        </p>
      </div>
    </div>
  );
}
