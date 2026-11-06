"use client";

import { useState } from "react";
import { FaPlus, FaTimes, FaGripLines } from "react-icons/fa";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { TypeSequenceItem } from "@/types";

interface SeqRowProps {
  id: string;
  seq: TypeSequenceItem;
  index: number;
  onUpdate: (i: number, field: keyof TypeSequenceItem, val: string | number) => void;
  onRemove: (i: number) => void;
}

function SortableSeqItem({ id, seq, index, onUpdate, onRemove }: SeqRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group mb-2 flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm transition-all hover:bg-slate-100 md:flex-row md:items-center dark:border-white/5 dark:bg-slate-950/30 dark:shadow-none dark:hover:bg-slate-950/50"
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none self-center rounded-lg p-1 text-slate-600 transition-colors hover:bg-slate-800/60 hover:text-slate-400 active:cursor-grabbing"
        aria-label="Drag to reorder"
        type="button"
      >
        <FaGripLines size={13} />
      </button>

      <span className="w-4 shrink-0 self-center text-center text-[10px] font-bold text-slate-600">
        {index + 1}
      </span>

      <div className="w-full flex-1">
        <Input
          className="h-10 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:ring-purple-500/50 dark:border-white/10 dark:bg-transparent dark:text-white dark:shadow-none"
          value={seq.text}
          onChange={(e) => onUpdate(index, "text", e.target.value)}
          placeholder="e.g. Full-Stack Developer"
        />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="relative">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="h-10 w-28 rounded-xl border-slate-200 bg-white pr-10 text-slate-900 shadow-sm focus-visible:ring-purple-500/50 dark:border-white/10 dark:bg-transparent dark:text-white dark:shadow-none"
            value={seq.delay}
            onChange={(e) => onUpdate(index, "delay", +e.target.value || 0)}
          />
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-slate-600 uppercase">
            ms
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="rounded-xl text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-400/10 hover:text-red-400"
          type="button"
        >
          <FaTimes size={14} />
        </Button>
      </div>
    </div>
  );
}

function SeqOverlay({ seq }: { seq: TypeSequenceItem }) {
  return (
    <div className="flex w-full items-center gap-4 rounded-2xl border border-purple-500/30 bg-white/90 p-2 shadow-2xl ring-1 shadow-purple-500/10 ring-purple-400/20 backdrop-blur-xl dark:bg-slate-800/90">
      <FaGripLines size={13} className="shrink-0 text-purple-400/70" />
      <span className="w-4" />
      <div className="flex-1 truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white">
        {seq.text || <span className="text-slate-500 italic">empty</span>}
      </div>
      <div className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white">
        {seq.delay} <span className="text-[10px] text-slate-500">ms</span>
      </div>
    </div>
  );
}

interface TypeSequenceSectionProps {
  typeSequences: TypeSequenceItem[];
  onChange: (updater: (prev: TypeSequenceItem[]) => TypeSequenceItem[]) => void;
}

export function TypeSequenceSection({
  typeSequences,
  onChange,
}: TypeSequenceSectionProps) {
  const [activeSeqId, setActiveSeqId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateSeq = (i: number, field: keyof TypeSequenceItem, val: string | number) => {
    onChange((seqs) => {
      const copy = [...seqs];
      copy[i] = { ...copy[i], [field]: val };
      return copy;
    });
  };

  const removeSeq = (i: number) => {
    onChange((seqs) => seqs.filter((_, idx) => idx !== i));
  };

  const addSeq = () => {
    onChange((seqs) => [...seqs, { text: "", delay: 2000 }]);
  };

  const handleSeqDragStart = (e: DragStartEvent) => {
    setActiveSeqId(e.active.id as string);
  };

  const handleSeqDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      onChange((seqs) => {
        const oldIndex = seqs.findIndex((_, i) => i.toString() === active.id);
        const newIndex = seqs.findIndex((_, i) => i.toString() === over.id);
        return arrayMove(seqs, oldIndex, newIndex);
      });
    }
    setActiveSeqId(null);
  };

  const activeSeq = activeSeqId !== null ? typeSequences[Number(activeSeqId)] : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleSeqDragStart}
      onDragEnd={handleSeqDragEnd}
    >
      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Typewriter Roles
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Drag to reorder typing cycles.
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={addSeq}
            size="sm"
            className="rounded-xl bg-purple-600 px-4 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500"
          >
            <FaPlus className="mr-1.5" size={10} /> Add Role
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <SortableContext
            items={typeSequences.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {typeSequences.map((seq, i) => (
                <SortableSeqItem
                  key={i}
                  id={i.toString()}
                  seq={seq}
                  index={i}
                  onUpdate={updateSeq}
                  onRemove={removeSeq}
                />
              ))}
            </div>
          </SortableContext>
          <p className="mt-4 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-600">
            Drag rows to reorder • Durations are in milliseconds
          </p>
        </CardContent>
      </Card>

      <DragOverlay dropAnimation={null}>
        {activeSeq ? <SeqOverlay seq={activeSeq} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
