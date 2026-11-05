"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Hero, TypeSequenceItem } from "@/types";
import {
  FaPlus,
  FaTimes,
  FaCheck,
  FaSave,
  FaUser,
  FaInfoCircle,
  FaImage,
  FaGripLines,
  FaBold,
  FaItalic,
  FaLink,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "../components/ImageUpload";

// dnd-kit
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

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

const DEFAULT: Hero = {
  name: "Shahid Hasan",
  lastName: "Shuvo",
  typeSequences: [
    { text: "Full-Stack Web Developer", delay: 2000 },
    { text: "Computer Engineer", delay: 2000 },
  ],
  tagline: "Jr. Frontend Developer at Softvence Agency",
  bio: "I am a passionate Full-Stack Web Developer and Computer Engineer...",
  profileImage: "/PP1.jpeg",
  resumeUrl: "/Resume_of_Shahid_Hasan_Shuvo.pdf",
  socialLinks: [],
};

// ─── Sortable Sequence Row ────────────────────────────────────────────────────
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
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none self-center rounded-lg p-1 text-slate-600 transition-colors hover:bg-slate-800/60 hover:text-slate-400 active:cursor-grabbing"
        aria-label="Drag to reorder"
        type="button"
      >
        <FaGripLines size={13} />
      </button>

      {/* Order badge */}
      <span className="w-4 shrink-0 self-center text-center text-[10px] font-bold text-slate-600">
        {index + 1}
      </span>

      {/* Text input */}
      <div className="w-full flex-1">
        <Input
          className="h-10 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:ring-purple-500/50 dark:border-white/10 dark:bg-transparent dark:text-white dark:shadow-none"
          value={seq.text}
          onChange={(e) => onUpdate(index, "text", e.target.value)}
          placeholder="e.g. Full-Stack Developer"
        />
      </div>

      {/* Delay + remove */}
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

// ─── Drag Overlay ghost card ──────────────────────────────────────────────────
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

// ─── Main Page ────────────────────────────────────────────────────────────────
function HeroFormClient({ initialData }: { initialData: Hero }) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Hero>(initialData);
  const [activeSeqId, setActiveSeqId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const parseMarkdown = (text: string): string => {
    if (!text) return "";
    let html = text;
    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic: *text* -> <em>text</em>
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Links: [text](url) -> <a href="url" target="_blank" rel="noopener noreferrer">text</a>
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    return html;
  };

  const insertMarkup = (tag: "bold" | "italic" | "link") => {
    const textarea = document.getElementById("bio-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (tag === "bold") {
      replacement = `**${selectedText || "bold text"}**`;
    } else if (tag === "italic") {
      replacement = `*${selectedText || "italic text"}*`;
    } else if (tag === "link") {
      const url = prompt("Enter the URL:", "https://");
      if (url === null) return;
      replacement = `[${selectedText || "link text"}](${url})`;
    }

    textarea.focus();

    // Preserve Undo/Redo stack history natively in modern browsers
    try {
      textarea.setSelectionRange(start, end);
      const inserted = document.execCommand("insertText", false, replacement);

      // Fallback in case document.execCommand is not supported in the future or custom environments
      if (!inserted) {
        const newValue = text.substring(0, start) + replacement + text.substring(end);
        setData((d) => ({ ...d, bio: newValue }));
      }
    } catch (e) {
      const newValue = text.substring(0, start) + replacement + text.substring(end);
      setData((d) => ({ ...d, bio: newValue }));
    }

    setTimeout(() => {
      textarea.focus();
      const offset = tag === "link" ? 1 : 2; // length of opening delimiters
      textarea.setSelectionRange(
        start + offset,
        start + offset + (selectedText || "text").length
      );
    }, 50);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const saveMutation = useMutation({
    mutationFn: async (heroData: Hero) => {
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(heroData),
      });
      if (!res.ok) throw new Error("Failed to save hero");
      return heroData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero"] });
      showToast("Hero section saved successfully!");
    },
    onError: () => {
      showToast("Failed to save changes.", "error");
    },
  });

  async function handleSave() {
    saveMutation.mutate(data);
  }

  const updateSeq = useCallback(
    (i: number, field: keyof TypeSequenceItem, val: string | number) => {
      setData((d) => {
        const seqs = [...d.typeSequences];
        seqs[i] = { ...seqs[i], [field]: val };
        return { ...d, typeSequences: seqs };
      });
    },
    []
  );

  const removeSeq = useCallback((i: number) => {
    setData((d) => ({
      ...d,
      typeSequences: d.typeSequences.filter((_, idx) => idx !== i),
    }));
  }, []);

  function handleSeqDragStart(e: DragStartEvent) {
    setActiveSeqId(e.active.id as string);
  }

  function handleSeqDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setData((d) => {
        const oldIndex = d.typeSequences.findIndex((_, i) => i.toString() === active.id);
        const newIndex = d.typeSequences.findIndex((_, i) => i.toString() === over.id);
        return {
          ...d,
          typeSequences: arrayMove(d.typeSequences, oldIndex, newIndex),
        };
      });
    }
    setActiveSeqId(null);
  }

  const activeSeq = activeSeqId !== null ? data.typeSequences[Number(activeSeqId)] : null;

  return (
    // DndContext at outermost level so DragOverlay is outside all
    // backdrop-blur/overflow containers — prevents coordinate offset bug
    <DndContext
      sensors={sensors}
      onDragStart={handleSeqDragStart}
      onDragEnd={handleSeqDragEnd}
    >
      <div className="space-y-6 p-4 md:p-8">
        {/* Toast Notification */}
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

        <div className="mx-auto max-w-350 space-y-6">
          {/* Floating save button will be at the bottom */}

          <div className="space-y-8">
            <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-700 md:grid-cols-2">
              <div className="flex flex-col gap-6">
                {/* Identity Card */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
                  <CardHeader className="p-4 pb-1">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-500/20 p-2.5 text-blue-400">
                        <FaUser size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                          Identity
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                          Your personal branding and display name.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        First Name
                      </label>
                      <Input
                        className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus-visible:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:shadow-none"
                        value={data.name}
                        onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                        placeholder="e.g. Shahid Hasan"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        Last Name{" "}
                        <span className="font-normal text-blue-400">(Highlighted)</span>
                      </label>
                      <Input
                        className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus-visible:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:shadow-none"
                        value={data.lastName}
                        onChange={(e) =>
                          setData((d) => ({ ...d, lastName: e.target.value }))
                        }
                        placeholder="e.g. Shuvo"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="ml-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        Branding Tagline
                      </label>
                      <Input
                        className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus-visible:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:shadow-none"
                        value={data.tagline || ""}
                        onChange={(e) =>
                          setData((d) => ({ ...d, tagline: e.target.value }))
                        }
                        placeholder="e.g. Jr. Frontend Developer at Softvence Agency..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Typing Sequences Card */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
                  <CardHeader className="p-4 pb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-purple-500/20 p-2.5 text-purple-400">
                          <FaInfoCircle size={20} />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                            Typing Sequences
                          </CardTitle>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            typeSequences: [
                              ...d.typeSequences,
                              { text: "", delay: 2000 },
                            ],
                          }))
                        }
                        className="rounded-xl border-slate-200 bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200 active:scale-95 dark:border-white/5 dark:bg-slate-800 dark:text-slate-200 dark:shadow-none dark:hover:bg-slate-700"
                      >
                        <FaPlus size={12} className="mr-1" /> Add New
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {/* Column labels */}
                    {data.typeSequences.length > 0 && (
                      <div className="mb-2 flex items-center gap-4 px-1 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                        <span className="w-5" />
                        <span className="w-4" />
                        <span className="flex-1">Text</span>
                        <span className="w-28 text-center">Delay</span>
                        <span className="w-9" />
                      </div>
                    )}

                    {/* Sortable list */}
                    <SortableContext
                      items={data.typeSequences.map((_, i) => i.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence mode="popLayout">
                        {data.typeSequences.map((seq, i) => (
                          <motion.div
                            key={`seq-${i}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.16 }}
                          >
                            <SortableSeqItem
                              id={i.toString()}
                              seq={seq}
                              index={i}
                              onUpdate={updateSeq}
                              onRemove={removeSeq}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SortableContext>

                    {data.typeSequences.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center shadow-sm dark:border-white/5 dark:bg-slate-950/20 dark:shadow-none">
                        <p className="text-sm text-slate-500 italic">
                          No typing sequences added.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              {/* Assets Card */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
                <CardHeader className="p-4 pb-1">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-400">
                      <FaImage size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        Assets
                      </CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">
                        Profile picture and resume document.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Profile Image UI */}
                    <div className="space-y-4">
                      <ImageUpload
                        label="Profile Image"
                        value={data.profileImage}
                        onChange={(url) =>
                          setData((prev) => ({ ...prev, profileImage: url }))
                        }
                      />
                    </div>

                    {/* Resume PDF UI */}
                    <div className="space-y-4">
                      <ImageUpload
                        label="Resume PDF"
                        value={data.resumeUrl}
                        onChange={(url) =>
                          setData((prev) => ({ ...prev, resumeUrl: url }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dedicated Standalone Professional Biography Card */}
            <Card className="animate-in fade-in overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl delay-100 duration-700 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 pb-2 dark:border-white/5 dark:bg-slate-950/20">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400">
                      <FaInfoCircle size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        Professional Biography
                      </CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">
                        Write a compelling narrative of your coding journey and
                        professional focus using our formatting toolbar.
                      </CardDescription>
                    </div>
                  </div>

                  {/* Formatting Toolbar moved to card header for optimal space usage */}
                  <div className="flex items-center gap-1 self-start rounded-xl border border-slate-200 bg-slate-100 p-1.5 sm:self-center dark:border-white/5 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => insertMarkup("bold")}
                      title="Format Bold (<strong>)"
                      className="cursor-pointer rounded-lg p-1.5 text-slate-700 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <FaBold size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkup("italic")}
                      title="Format Italic (<em>)"
                      className="cursor-pointer rounded-lg p-1.5 text-slate-700 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <FaItalic size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkup("link")}
                      title="Format Link (<a>)"
                      className="cursor-pointer rounded-lg p-1.5 text-slate-700 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <FaLink size={11} />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Left Column: Biography Editor */}
                  <div className="flex h-full flex-col space-y-2">
                    <label className="ml-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Edit Biography Text
                    </label>
                    <textarea
                      id="bio-textarea"
                      className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-80 w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base leading-relaxed text-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 lg:min-h-120 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:shadow-none"
                      value={data.bio || ""}
                      onChange={(e) => setData((d) => ({ ...d, bio: e.target.value }))}
                      placeholder="Tell your story. Supports multiple paragraphs..."
                    />
                  </div>

                  {/* Right Column: Styled Live Biography Preview */}
                  <div className="flex h-full flex-col space-y-2 border-t border-slate-200 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 dark:border-white/5">
                    <label className="ml-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Live Biography Preview
                    </label>
                    <div className="min-h-80 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-base leading-relaxed font-normal text-slate-600 lg:min-h-120 dark:border-white/5 dark:bg-slate-950/20 dark:text-slate-400 [&_a]:font-semibold [&_a]:text-slate-900 [&_a]:transition-colors [&_a]:duration-200 [&_a]:hover:text-emerald-500 [&_a]:dark:text-slate-100 [&_a]:dark:hover:text-emerald-400 [&_b]:font-semibold [&_b]:text-slate-900 [&_b]:dark:text-slate-100 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_strong]:dark:text-slate-100">
                      {data.bio ? (
                        data.bio.split("\n\n").map((para, i) => (
                          <p
                            key={i}
                            dangerouslySetInnerHTML={{
                              __html: parseMarkdown(para),
                            }}
                          />
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No biography typed yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* DragOverlay outside all backdrop-blur containers to avoid
          fixed-position coordinate offset bug */}
      <DragOverlay dropAnimation={null}>
        {activeSeq ? <SeqOverlay seq={activeSeq} /> : null}
      </DragOverlay>

      {/* Floating Save Button */}
      <div className="fixed right-10 bottom-10 z-50">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="group rounded-xl bg-emerald-600 p-6 text-base font-black text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 active:scale-95"
        >
          <FaSave
            className={cn(
              "mr-1 transition-transform duration-500",
              saveMutation.isPending ? "animate-spin" : "group-hover:rotate-12"
            )}
            size={20}
          />
          {saveMutation.isPending ? "Saving DNA..." : "Apply Changes"}
        </Button>
      </div>
    </DndContext>
  );
}

// ─── Main Page Container ──────────────────────────────────────────────────────
export default function AdminHeroPage() {
  const { data: fetchedData, isLoading: loading } = useQuery({
    queryKey: ["hero"],
    queryFn: async () => {
      const r = await fetch("/api/admin/hero");
      if (!r.ok) throw new Error("Failed to fetch hero");
      return r.json();
    },
  });

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="mx-auto max-w-350 space-y-6">
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/20 dark:shadow-none">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800/40" />
                      <div className="space-y-2">
                        <div className="h-5 w-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
                        <div className="h-3 w-48 animate-pulse rounded-lg bg-slate-800/30" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="h-12 animate-pulse rounded-2xl bg-slate-800/20" />
                      <div className="h-12 animate-pulse rounded-2xl bg-slate-800/20" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const initialData =
    fetchedData && Object.keys(fetchedData).length
      ? { ...DEFAULT, ...fetchedData }
      : DEFAULT;

  return <HeroFormClient initialData={initialData} />;
}
