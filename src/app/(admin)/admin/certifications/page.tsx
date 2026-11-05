"use client";
import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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
  FaCheck,
  FaTimes,
  FaAward,
  FaGripVertical,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaInfoCircle,
  FaCertificate,
  FaUniversity,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ImageUpload from "../components/ImageUpload";
import { AdminDialogShell } from "../components/AdminDialogShell";
import { AdminField, AdminInput } from "../components/AdminFields";

interface Certification {
  _id?: string;
  title: string;
  issuer: string;
  date: string;
  certificateFile?: string;
  badgeLogo?: string;
  details: string[];
  order: number;
}

function SortableCertRow({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: Certification;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id! });

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
        isDragging && "z-50 border-amber-500/50 shadow-2xl shadow-amber-500/10"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-300 transition-colors hover:text-amber-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-amber-400"
      >
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
            <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-400">
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

        <div className="flex items-center gap-2 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-yellow-400/10 hover:text-yellow-400"
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

function CertOverlay({ item }: { item: Certification }) {
  return (
    <div className="flex min-w-[320px] scale-105 items-center gap-4 rounded-2xl border border-amber-500/30 bg-white p-4 shadow-2xl dark:bg-slate-800">
      <div className="shrink-0 cursor-grabbing text-amber-500">
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

export default function AdminCertificationsPage() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Certification[]>([]);
  const [prevFetchedData, setPrevFetchedData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCert, setCurrentCert] = useState<Certification | null>(null);
  const [skillInput, setSkillInput] = useState("");
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
    queryKey: ["certifications"],
    queryFn: async () => {
      const r = await fetch("/api/admin/certifications");
      if (!r.ok) throw new Error("Failed to fetch certifications");
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
      const res = await fetch(`/api/admin/certifications?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      setData((prev) => prev.filter((s) => s._id !== id));
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      showToast("Certification deleted.");
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

  const saveMutation = useMutation({
    mutationFn: async (cert: Certification) => {
      const isEdit = !!cert._id;
      const url = isEdit
        ? `/api/admin/certifications?id=${cert._id}`
        : "/api/admin/certifications";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cert),
      });
      if (!res.ok) throw new Error("Failed to save");
      return { isEdit };
    },
    onSuccess: ({ isEdit }) => {
      setIsDialogOpen(false);
      showToast(isEdit ? "Certification updated!" : "Certification added!");
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
    },
    onError: () => {
      showToast("Failed to save.", "error");
    },
  });

  async function handleAddOrUpdate() {
    if (!currentCert?.title || !currentCert?.issuer) return;
    saveMutation.mutate(currentCert);
  }

  function openEdit(item: Certification) {
    setCurrentCert({
      ...item,
      details: item.details || [],
    });
    setIsDialogOpen(true);
  }

  function openNew() {
    setCurrentCert({
      title: "",
      issuer: "",
      date: "",
      certificateFile: "",
      details: [],
      badgeLogo: "",
      order: data.length,
    });
    setIsDialogOpen(true);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = data.findIndex((i) => i._id === active.id);
      const newIndex = data.findIndex((i) => i._id === over.id);
      const newData = arrayMove(data, oldIndex, newIndex);
      setData(newData);
      // Auto save order using PATCH
      fetch("/api/admin/certifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["certifications"] }));
    }
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id as string)}
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
                className="rounded-full border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-amber-600 uppercase dark:text-amber-400"
              >
                {data.length} Certifications
              </Badge>
            </div>
            <Button
              onClick={openNew}
              className="group h-10 rounded-xl bg-yellow-600 px-6 text-xs font-bold text-white shadow-lg shadow-yellow-600/20 transition-all hover:bg-yellow-500 active:scale-95"
            >
              <FaPlus className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
              Add Certification
            </Button>
          </div>

          <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Professional Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/20"
                    />
                  ))}
                </div>
              ) : data.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm dark:border-white/5 dark:bg-slate-950/20 dark:shadow-none">
                  <FaAward
                    className="mx-auto mb-4 text-slate-200 dark:text-slate-800"
                    size={40}
                  />
                  <p className="font-medium text-slate-400 dark:text-slate-500">
                    No certifications found. Add your achievements above.
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
                        <SortableCertRow
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

        <AdminDialogShell
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={currentCert?._id ? "Refine Credential" : "New Professional Honor"}
          subtitle="Validate your expertise with verified certifications"
          icon={FaAward}
          iconColor="text-yellow-400"
          accentColor="from-yellow-500/5 to-amber-500/5"
          onSave={handleAddOrUpdate}
          saving={saveMutation.isPending}
          saveLabel={currentCert?._id ? "Update Credential" : "Establish Honor"}
          savingLabel="Processing..."
          maxWidth="5xl"
        >
          {currentCert && (
            <div className="px-1">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
                {/* Left Column: Certificate Files */}
                <AdminField label="Certificate File (PDF/Image)">
                  <ImageUpload
                    value={currentCert.certificateFile || ""}
                    onChange={(url) =>
                      setCurrentCert({ ...currentCert, certificateFile: url })
                    }
                  />
                </AdminField>

                {/* Right Column: Information Fields */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <AdminField label="Badge Logo">
                      <div className="h-24 w-24">
                        <ImageUpload
                          value={currentCert.badgeLogo || ""}
                          onChange={(url) =>
                            setCurrentCert({ ...currentCert, badgeLogo: url })
                          }
                        />
                      </div>
                    </AdminField>

                    <div className="col-span-2">
                      <AdminField label="Certification Title">
                        <AdminInput
                          icon={FaCertificate}
                          value={currentCert.title}
                          onChange={(e) =>
                            setCurrentCert({
                              ...currentCert,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g. AWS Solutions Architect"
                        />
                      </AdminField>
                      <AdminField label="Issuing Authority">
                        <AdminInput
                          icon={FaUniversity}
                          value={currentCert.issuer}
                          onChange={(e) =>
                            setCurrentCert({
                              ...currentCert,
                              issuer: e.target.value,
                            })
                          }
                          placeholder="e.g. Amazon Web Services"
                        />
                      </AdminField>
                      <AdminField label="Date Issued">
                        <AdminInput
                          icon={FaCalendarAlt}
                          value={currentCert.date}
                          onChange={(e) =>
                            setCurrentCert({
                              ...currentCert,
                              date: e.target.value,
                            })
                          }
                          placeholder="e.g. June 2023"
                        />
                      </AdminField>
                    </div>
                  </div>

                  <AdminField label="Key Skills & Competencies">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <AdminInput
                          icon={FaInfoCircle}
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (skillInput.trim()) {
                                setCurrentCert({
                                  ...currentCert,
                                  details: [...currentCert.details, skillInput.trim()],
                                });
                                setSkillInput("");
                              }
                            }
                          }}
                          placeholder="e.g. Cloud Computing..."
                          className="h-11 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (skillInput.trim()) {
                              setCurrentCert({
                                ...currentCert,
                                details: [...currentCert.details, skillInput.trim()],
                              });
                              setSkillInput("");
                            }
                          }}
                          className="h-12 rounded-xl border border-slate-200 bg-slate-900 px-4 font-bold text-white shadow-inner shadow-black/5 hover:bg-slate-800 dark:border-white/5 dark:bg-slate-800 dark:shadow-black/20 dark:hover:bg-slate-700"
                        >
                          <FaPlus size={12} />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(currentCert.details || []).map((detail, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="group gap-2 rounded-xl border-yellow-200 bg-yellow-50 px-3 py-1.5 text-yellow-600 shadow-sm transition-all dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:shadow-none"
                          >
                            <span className="text-xs">{detail}</span>
                            <button
                              onClick={() =>
                                setCurrentCert({
                                  ...currentCert,
                                  details: currentCert.details.filter(
                                    (_, idx) => idx !== i
                                  ),
                                })
                              }
                              className="transition-colors hover:text-red-400"
                            >
                              <FaTimes size={10} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AdminField>
                </div>
              </div>
            </div>
          )}
        </AdminDialogShell>

        <DragOverlay dropAnimation={null}>
          {activeId ? <CertOverlay item={data.find((s) => s._id === activeId)!} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
