"use client";

import { FaPlus, FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CategoryManagerDialog from "../../components/CategoryManagerDialog";
import type { ICategory } from "@/models/Category";

interface ProjectListToolbarProps {
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: ICategory[];
  filterCategory: string;
  onFilterChange: (cat: string) => void;
  onNew: () => void;
  onRefreshCategories: () => void;
}

export function ProjectListToolbar({
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  categories,
  filterCategory,
  onFilterChange,
  onNew,
  onRefreshCategories,
}: ProjectListToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="rounded-full border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400"
          >
            {totalCount} Total Projects
          </Badge>
          {filteredCount !== totalCount && (
            <span className="text-xs text-slate-500">
              ({filteredCount} matching filter)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <CategoryManagerDialog onUpdate={onRefreshCategories} />

          <Button
            onClick={onNew}
            className="group h-10 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95"
          >
            <FaPlus className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FaSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by title..."
            className="h-10 rounded-xl border-slate-200 bg-white pl-10 text-xs shadow-sm focus-visible:ring-emerald-500/30 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onFilterChange("All")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              filterCategory === "All"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-white/10"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id?.toString() || c.name}
              onClick={() => onFilterChange(c.name)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                filterCategory === c.name
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-white/10"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
