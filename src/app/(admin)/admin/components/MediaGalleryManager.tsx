"use client";
import { useState } from "react";
import { FaPlus, FaTimes, FaImage, FaLink, FaTrash, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ImageUpload from "./ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types";

interface MediaGalleryManagerProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  label?: string;
}

interface SortableMediaItemProps {
  item: MediaItem;
  index: number;
  updateItem: (i: number, field: keyof MediaItem, val: any) => void;
  removeItem: (i: number) => void;
}

function SortableMediaItem({
  item,
  index,
  updateItem,
  removeItem,
}: SortableMediaItemProps) {
  const stableId = item.id || item._id || `legacy-${index}-${item.type}-${item.url}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col gap-8 rounded-[1rem] border border-slate-200 bg-white p-6 shadow-lg backdrop-blur-xl transition-[background-color,border-color,box-shadow,opacity] duration-500 hover:border-slate-300 hover:bg-slate-50 md:flex-row dark:border-white/5 dark:bg-slate-950/60 dark:shadow-2xl dark:hover:border-white/10 dark:hover:bg-slate-900/80",
        isDragging && "z-50 border-emerald-500/50 shadow-2xl shadow-emerald-500/10"
      )}
    >
      {/* Drag Handle - Always visible, inline on mobile/tablet, absolute on xl screens */}
      <div
        {...attributes}
        {...listeners}
        className="hover:text-slate-650 dark:hover:text-slate-350 flex shrink-0 cursor-grab flex-col items-center justify-center self-center p-2 text-slate-400 transition-colors active:cursor-grabbing xl:absolute xl:top-1/2 xl:-left-10 xl:-translate-y-1/2 xl:self-auto dark:text-slate-600"
      >
        <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
          <circle cx="2" cy="2" r="2" />
          <circle cx="2" cy="10" r="2" />
          <circle cx="2" cy="18" r="2" />
          <circle cx="10" cy="2" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="10" cy="18" r="2" />
        </svg>
      </div>

      <div className="w-full shrink-0 md:w-56">
        {item.type === "embed" ? (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FaLink size={18} />
            </div>
            <Badge
              variant="outline"
              className="border-blue-500/20 bg-blue-500/10 text-[9px] font-black tracking-widest text-blue-600 dark:text-blue-400"
            >
              EMBED
            </Badge>
          </div>
        ) : (
          <ImageUpload
            value={item.url}
            onChange={(url) => updateItem(index, "url", url)}
            accept={item.type === "video" ? "video/*" : "image/*"}
            aspect="video"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]",
                item.type === "image"
                  ? "bg-emerald-500 shadow-emerald-500/20"
                  : item.type === "video"
                    ? "bg-purple-500 shadow-purple-500/20"
                    : "bg-blue-500 shadow-blue-500/20"
              )}
            />
            <span className="text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
              #{index + 1}{" "}
              <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>{" "}
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-black",
                  item.type === "image"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : item.type === "video"
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                )}
              >
                {item.type}
              </span>
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeItem(index)}
            className="h-8 w-8 rounded-lg text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-600 dark:text-slate-600 dark:hover:text-red-400"
          >
            <FaTrash size={12} />
          </Button>
        </div>

        <div className="space-y-4">
          {item.type === "embed" && (
            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                URL / Source
              </label>
              <div className="group/input relative">
                <FaLink className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-emerald-600 dark:text-slate-500 dark:group-focus-within/input:text-emerald-400" />
                <Input
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-12 text-slate-900 shadow-inner focus-visible:ring-emerald-500/10 dark:border-white/5 dark:bg-slate-900/50 dark:text-white dark:shadow-none"
                  value={item.url}
                  onChange={(e) => updateItem(index, "url", e.target.value)}
                  placeholder="Source URL..."
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
              Caption (Optional)
            </label>
            <div className="group/input relative">
              <FaInfoCircle className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-emerald-600 dark:text-slate-500 dark:group-focus-within/input:text-emerald-400" />
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-12 text-slate-900 shadow-inner focus-visible:ring-emerald-500/10 dark:border-white/5 dark:bg-slate-900/50 dark:text-white dark:shadow-none"
                value={item.caption || ""}
                onChange={(e) => updateItem(index, "caption", e.target.value)}
                placeholder="Describe this media..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MediaGalleryManager({
  media = [],
  onChange,
  label,
}: MediaGalleryManagerProps) {
  const [embedInput, setEmbedInput] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateItem = (i: number, field: keyof MediaItem, val: any) => {
    const next = [...media];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  const addItem = (type: MediaItem["type"]) => {
    const newId = `temp-${Math.random().toString(36).substring(2, 9)}`;
    onChange([...media, { id: newId, type, url: "", caption: "" }]);
  };

  const removeItem = (i: number) => {
    onChange(media.filter((_, idx) => idx !== i));
  };

  const addEmbed = () => {
    if (!embedInput) return;
    const newId = `temp-${Math.random().toString(36).substring(2, 9)}`;
    onChange([...media, { id: newId, type: "embed", url: embedInput, caption: "" }]);
    setEmbedInput(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = media.findIndex((item, index) => {
      const stableId = item.id || item._id || `legacy-${index}-${item.type}-${item.url}`;
      return stableId === active.id;
    });

    const newIndex = media.findIndex((item, index) => {
      const stableId = item.id || item._id || `legacy-${index}-${item.type}-${item.url}`;
      return stableId === over.id;
    });

    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(media, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {label && (
          <label className="pl-1 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
            {label}
          </label>
        )}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-white/5 dark:bg-slate-900/50 dark:shadow-none">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addItem("image")}
            className="h-7 rounded-lg px-3 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            <FaPlus className="mr-1.5" /> Image
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addItem("video")}
            className="h-7 rounded-lg px-3 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all hover:bg-purple-500/10 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400"
          >
            <FaPlus className="mr-1.5" /> Video
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEmbedInput("")}
            className="h-7 rounded-lg px-3 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all hover:bg-blue-500/10 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <FaPlus className="mr-1.5" /> Embed
          </Button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {embedInput !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-4 flex gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <div className="relative flex-1">
                <FaLink className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                <Input
                  className="h-10 border-white/5 bg-slate-950/50 pl-10"
                  placeholder="YouTube/Vimeo URL..."
                  value={embedInput}
                  onChange={(e) => setEmbedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmbed())}
                />
              </div>
              <Button onClick={addEmbed} className="h-10 bg-blue-600 hover:bg-blue-500">
                Add Embed
              </Button>
              <Button
                variant="ghost"
                onClick={() => setEmbedInput(null)}
                className="h-10 px-3"
              >
                <FaTimes />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={media.map(
            (item, index) =>
              item.id || item._id || `legacy-${index}-${item.type}-${item.url}`
          )}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {media.map((item, index) => (
              <SortableMediaItem
                key={item.id || item._id || `legacy-${index}-${item.type}-${item.url}`}
                item={item}
                index={index}
                updateItem={updateItem}
                removeItem={removeItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {media.length === 0 && (
        <div className="group/empty relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 shadow-sm transition-all hover:border-emerald-500/20 hover:bg-emerald-500/5 dark:border-white/5 dark:bg-slate-950/20 dark:shadow-none">
          <div className="absolute inset-0 bg-linear-to-b from-emerald-500/0 to-emerald-500/5 opacity-0 transition-opacity group-hover/empty:opacity-100" />
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 shadow-sm transition-all duration-500 group-hover/empty:scale-110 group-hover/empty:text-emerald-600 dark:bg-slate-900 dark:text-slate-700 dark:shadow-2xl dark:group-hover/empty:text-emerald-400">
            <FaImage size={32} />
          </div>
          <div className="relative z-10 space-y-1 text-center">
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase transition-colors group-hover/empty:text-slate-900 dark:text-slate-500 dark:group-hover/empty:text-slate-300">
              Showcase is Empty
            </p>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-600">
              Add images, videos or interactive embeds
            </p>
          </div>
          <div className="relative z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem("image")}
              className="h-9 rounded-xl border-slate-200 bg-white px-4 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-emerald-500 hover:text-white dark:border-white/5 dark:bg-slate-900/50"
            >
              + Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem("video")}
              className="h-9 rounded-xl border-slate-200 bg-white px-4 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-purple-500 hover:text-white dark:border-white/5 dark:bg-slate-900/50"
            >
              + Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
