"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
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
import {
  FaPlus,
  FaTimes,
  FaCheck,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaLink,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

import { AdminDialogShell } from "../components/AdminDialogShell";
import { AdminField, AdminInput } from "../components/AdminFields";
import ImageUpload from "../components/ImageUpload";
import Image from "next/image";

interface SocialLink {
  _id?: string;
  href: string;
  label: string;
  iconUrl?: string;
  brandColor?: string;
  invertDark?: boolean;
  order: number;
}

// ─── Drag Overlay ghost card ──────────────────────────────────────────────────
function SocialOverlay({ item }: { item: SocialLink }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-cyan-500/30 bg-white p-4 shadow-2xl ring-1 ring-cyan-400/20 dark:bg-slate-800">
      <FaGripVertical className="text-cyan-500" size={14} />
      <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-400">
        {item.iconUrl ? (
          <Image
            src={item.iconUrl}
            alt={item.label}
            width={14}
            height={14}
            className="object-contain"
          />
        ) : (
          <FaLink size={14} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {item.label}
        </h3>
        <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
          {item.href}
        </p>
      </div>
    </div>
  );
}

function SortableSocialRow({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: SocialLink;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none dark:hover:border-white/10",
        isDragging && "z-50 border-cyan-500/50 shadow-2xl shadow-cyan-500/10"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-300 transition-colors hover:text-cyan-500 active:cursor-grabbing dark:text-slate-600"
      >
        <FaGripVertical size={14} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-400">
            {item.iconUrl ? (
              <Image
                src={item.iconUrl}
                alt={item.label}
                width={14}
                height={14}
                className="object-contain"
              />
            ) : (
              <FaLink size={14} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {item.label}
            </h3>
            <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {item.href}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 rounded-lg text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-500"
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
  );
}

export default function AdminSocialsPage() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<SocialLink[]>([]);
  const [prevFetchedData, setPrevFetchedData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSocial, setCurrentSocial] = useState<SocialLink | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const { data: fetchedData, isLoading: loading } = useQuery({
    queryKey: ["socials"],
    queryFn: async () => {
      const r = await fetch("/api/admin/socials");
      if (!r.ok) throw new Error("Failed to fetch socials");
      return r.json();
    },
  });

  if (fetchedData !== prevFetchedData) {
    setPrevFetchedData(fetchedData);
    if (fetchedData) {
      setData(Array.isArray(fetchedData) ? fetchedData : []);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/socials?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setData((prev) => prev.filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["socials"] });
      showToast("Link deleted.");
      setDeletingId(null);
    },
    onError: () => {
      showToast("Failed to delete.", "error");
      setDeletingId(null);
    },
  });

  async function handleDelete(id: string) {
    setDeletingId(id);
    deleteMutation.mutate(id);
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = data.findIndex((s) => s._id === active.id);
    const newIndex = data.findIndex((s) => s._id === over.id);

    const newData = arrayMove(data, oldIndex, newIndex);
    setData(newData);

    await fetch("/api/admin/socials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    }).then(() => queryClient.invalidateQueries({ queryKey: ["socials"] }));
  };

  const saveMutation = useMutation({
    mutationFn: async (social: SocialLink) => {
      const isEdit = !!social._id;
      const url = isEdit ? `/api/admin/socials?id=${social._id}` : "/api/admin/socials";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(social),
      });
      if (!res.ok) throw new Error("Failed to save");
      return { isEdit };
    },
    onSuccess: ({ isEdit }) => {
      setIsDialogOpen(false);
      showToast(isEdit ? "Link updated!" : "Link added!");
      queryClient.invalidateQueries({ queryKey: ["socials"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  async function handleAddOrUpdate() {
    if (!currentSocial?.label || !currentSocial?.href) return;
    saveMutation.mutate(currentSocial);
  }

  function openEdit(item?: SocialLink) {
    if (item) {
      setCurrentSocial({ ...item });
    } else {
      setCurrentSocial({
        href: "",
        label: "",
        invertDark: false,
        order: data.length,
      });
    }
    setIsDialogOpen(true);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 p-4 font-sans md:p-8">
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

        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-cyan-600 uppercase dark:text-cyan-400"
              >
                {data.length} Social Links
              </Badge>
            </div>
            <Button
              onClick={() => openEdit()}
              className="group h-10 rounded-xl bg-cyan-600 px-6 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-500 active:scale-95"
            >
              <FaPlus className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
              Add Link
            </Button>
          </div>

          <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Social Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-2xl bg-slate-800/20"
                    />
                  ))}
                </div>
              ) : data.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm dark:border-white/5 dark:bg-slate-950/20 dark:shadow-none">
                  <FaLink
                    className="mx-auto mb-4 text-slate-200 dark:text-slate-800"
                    size={40}
                  />
                  <p className="font-medium text-slate-400 dark:text-slate-500">
                    No social links found. Add your profiles above.
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={data.map((s) => s._id!)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {data.map((item) => (
                        <SortableSocialRow
                          key={item._id}
                          item={item}
                          onEdit={() => openEdit(item)}
                          onDelete={() => handleDelete(item._id!)}
                          isDeleting={deletingId === item._id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              )}

              {!loading && data.length > 0 && (
                <p className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-700">
                  Drag rows to reorder • Changes save automatically
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <SocialOverlay item={data.find((s) => s._id === activeId)!} />
          ) : null}
        </DragOverlay>

        <AdminDialogShell
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={currentSocial?._id ? "Update Link" : "Add Digital Node"}
          subtitle=""
          icon={FaLink}
          iconColor="text-cyan-400"
          accentColor="from-cyan-500/5 to-blue-500/5"
          onSave={handleAddOrUpdate}
          saving={saveMutation.isPending}
          saveLabel={currentSocial?._id ? "Update Link" : "Add Link"}
          savingLabel="Propagating..."
        >
          {currentSocial && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <AdminField label="Display Label">
                  <AdminInput
                    value={currentSocial.label}
                    onChange={(e) =>
                      setCurrentSocial((prev) =>
                        prev ? { ...prev, label: e.target.value } : null
                      )
                    }
                    placeholder="e.g. GitHub Profile"
                  />
                </AdminField>
              </div>

              <AdminField label="Destination URL">
                <AdminInput
                  icon={FaLink}
                  className="text-sm font-medium"
                  value={currentSocial.href}
                  onChange={(e) =>
                    setCurrentSocial((prev) =>
                      prev ? { ...prev, href: e.target.value } : null
                    )
                  }
                  placeholder="https://social.network/profile"
                />
              </AdminField>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <ImageUpload
                    label="Custom Icon"
                    value={currentSocial.iconUrl || ""}
                    onChange={(url) =>
                      setCurrentSocial((prev) =>
                        prev ? { ...prev, iconUrl: url } : null
                      )
                    }
                  />
                </div>
                <div className="space-y-4">
                  <AdminField label="Brand Color">
                    <AdminInput
                      value={currentSocial.brandColor || ""}
                      onChange={(e) =>
                        setCurrentSocial((prev) =>
                          prev ? { ...prev, brandColor: e.target.value } : null
                        )
                      }
                      placeholder="e.g. hover:text-emerald-500"
                    />
                  </AdminField>

                  <div className="pt-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        checked={currentSocial.invertDark || false}
                        onChange={(e) =>
                          setCurrentSocial((prev) =>
                            prev ? { ...prev, invertDark: e.target.checked } : null
                          )
                        }
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Invert in Dark Mode
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Turns black logos white in dark mode.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AdminDialogShell>
      </div>
    </DndContext>
  );
}
