"use client";

import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaSearch, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Category {
  name: string;
  slug: string;
  order: number;
}

interface CategoryComboboxProps {
  value: string[];
  onChange: (val: string[]) => void;
  categories: Category[];
  refreshCategories: () => Promise<void>;
}

export default function CategoryCombobox({
  value = [],
  onChange,
  categories,
  refreshCategories,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCategory = (name: string) => {
    const newValue = value.includes(name)
      ? value.filter((v) => v !== name)
      : [...value, name];
    onChange(newValue);
  };

  const handleCreate = async () => {
    if (!search.trim()) return;
    setCreating(true);

    const newCat = {
      name: search.trim(),
      slug: search
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      order: categories.length,
    };

    const nextCategories = [...categories, newCat];

    try {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextCategories),
      });
      await refreshCategories();
      toggleCategory(newCat.name);
      setSearch("");
    } catch (err) {
      console.error("Failed to create category", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative w-full flex-1" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          "flex min-h-14 w-full cursor-pointer flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 transition-all outline-none dark:border-white/5 dark:bg-slate-950/50",
          open
            ? "border-emerald-500/50 ring-2 ring-emerald-500/20"
            : "border-slate-200 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10"
        )}
      >
        {value.length === 0 && (
          <div className="flex h-10 items-center px-3 text-sm font-bold text-slate-500">
            Select Categories
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {value.map((val) => (
            <motion.div
              key={val}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-1.5 pr-1.5 pl-3 text-xs font-bold text-emerald-600 dark:text-emerald-400"
            >
              <span>{val}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(val);
                }}
                className="rounded-md p-1 transition-colors hover:bg-emerald-500/20"
              >
                <FaTimes size={10} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex-1" />
        <div className="flex items-center px-3">
          <FaChevronDown
            className={cn(
              "text-xs text-slate-500 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </div>

      {open && (
        <div className="animate-in fade-in zoom-in-95 absolute top-full left-0 z-50 mt-2 flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl duration-200 dark:border-white/10 dark:bg-slate-900">
          <div className="mb-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-colors focus-within:border-emerald-500/50 dark:border-white/5 dark:bg-slate-950/50">
            <FaSearch className="mr-2 shrink-0 text-slate-500" size={12} />
            <input
              autoFocus
              className="h-9 w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:ring-0 dark:text-white dark:placeholder:text-slate-600"
              placeholder="Search or create..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim() && filtered.length === 0) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
          </div>

          <div className="custom-scrollbar flex max-h-60 flex-col gap-1 overflow-y-auto pr-1">
            {filtered.length > 0 ? (
              filtered.map((c) => {
                const isActive = value.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleCategory(c.name)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-emerald-500/10 font-bold text-emerald-400"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    {isActive && <FaCheck size={10} className="ml-2 shrink-0" />}
                  </button>
                );
              })
            ) : search.trim() ? (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="flex w-full items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-3 text-left text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20"
              >
                {creating ? (
                  <div className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                ) : (
                  <FaPlus size={10} className="shrink-0" />
                )}
                <span className="truncate">Create &quot;{search}&quot;</span>
              </button>
            ) : (
              <div className="px-3 py-6 text-center text-xs font-bold tracking-widest text-slate-600 uppercase">
                No categories found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
