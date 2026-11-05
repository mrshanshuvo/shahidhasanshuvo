"use client";
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaLayerGroup } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryManagerDialogProps {
  onUpdate?: () => void;
}

export default function CategoryManagerDialog({ onUpdate }: CategoryManagerDialogProps) {
  const [data, setData] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const fetchCats = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
      });
  };

  useEffect(() => {
    fetchCats();
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Taxonomy synchronized!");
      if (onUpdate) onUpdate();
    } else {
      showToast("Failed to save records.", "error");
    }
  }

  function addCategory() {
    setData((prev) => [...prev, { name: "New Category", slug: "", order: prev.length }]);
  }

  function updateCategory(i: number, field: keyof Category, val: any) {
    setData((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  }

  function move(i: number, dir: "up" | "down") {
    const next = [...data];
    const target = dir === "up" ? i - 1 : i + 1;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    setData(next);
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-10 rounded-xl border border-emerald-500/20 px-4 text-emerald-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-500 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <FaPlus className="mr-2" /> Manage Categories
          </Button>
        }
      />
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-2xl border-slate-200 bg-white p-8 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-white">
        <DialogHeader className="mb-6">
          <div className="mb-2 flex items-center gap-3 text-emerald-400">
            <FaLayerGroup size={16} />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">
              System Taxonomy
            </span>
          </div>
          <DialogTitle className="flex items-center justify-between text-3xl font-black tracking-tight">
            Categories
            <Button
              onClick={addCategory}
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 dark:border-white/5 dark:bg-slate-900 dark:text-slate-200"
            >
              <FaPlus className="mr-2" /> Add
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
          <AnimatePresence mode="popLayout">
            {data.map((cat, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/50 dark:hover:border-white/10"
              >
                <div className="flex-1">
                  <Input
                    className="h-7 border-none bg-transparent p-0 text-sm font-bold text-slate-900 focus-visible:ring-0 dark:text-white"
                    value={cat.name}
                    onChange={(e) => updateCategory(i, "name", e.target.value)}
                    placeholder="Category Name..."
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => move(i, "up")}
                    disabled={i === 0}
                    className="h-8 w-8 text-slate-600 hover:text-white"
                  >
                    <FaArrowUp size={10} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => move(i, "down")}
                    disabled={i === data.length - 1}
                    className="h-8 w-8 text-slate-600 hover:text-white"
                  >
                    <FaArrowDown size={10} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setData((prev) => prev.filter((_, idx) => idx !== i))}
                    className="h-8 w-8 text-slate-600 hover:bg-red-400/10 hover:text-red-400"
                  >
                    <FaTrash size={10} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {data.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-white/5 dark:bg-transparent">
              <p className="text-sm text-slate-500">No categories defined.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
          <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            {data.length} Total Categories
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-11 rounded-xl bg-emerald-600 px-6 font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
          >
            {saving ? "Syncing..." : "Apply Changes"}
          </Button>
        </div>

        {/* Toast Overlay */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border px-4 py-2 text-xs font-bold shadow-xl backdrop-blur-xl",
                toast.type === "success"
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                  : "border-red-500/50 bg-red-500/20 text-red-400"
              )}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
