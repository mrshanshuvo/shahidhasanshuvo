"use client";

import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TechItem {
  name: string;
  iconUrl?: string;
  isTechnology?: boolean;
}

interface TechComboboxProps {
  value: string[];
  onChange: (val: string[]) => void;
  technologies: TechItem[];
}

export default function TechCombobox({
  value = [],
  onChange,
  technologies = [],
}: TechComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  const filtered = technologies.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTech = (name: string) => {
    const newValue = value.includes(name)
      ? value.filter((v) => v !== name)
      : [...value, name];
    onChange(newValue);
  };

  const getTechIcon = (name: string) => {
    const item = technologies.find((t) => t.name === name);
    return item?.iconUrl || null;
  };

  return (
    <div className="relative w-full flex-1" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          "flex min-h-14 w-full cursor-pointer flex-wrap gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 transition-all outline-none dark:border-white/5 dark:bg-slate-950/50",
          open
            ? "border-emerald-500/50 ring-2 ring-emerald-500/20"
            : "border-slate-200 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10"
        )}
      >
        {value.length === 0 && (
          <div className="flex h-10 items-center px-3 text-sm font-bold text-slate-500">
            Select Technologies
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {value.map((val) => {
            const iconUrl = getTechIcon(val);
            return (
              <motion.div
                key={val}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-2 pl-3.5 text-xs font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    alt={val}
                    width={14}
                    height={14}
                    className="object-contain"
                  />
                )}
                <span>{val}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTech(val);
                  }}
                  className="cursor-pointer rounded-md p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <FaTimes size={10} />
                </button>
              </motion.div>
            );
          })}
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
              placeholder="Search technologies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="custom-scrollbar flex max-h-60 flex-col gap-1 overflow-y-auto pr-1">
            {filtered.length > 0 ? (
              filtered.map((t) => {
                const isActive = value.includes(t.name);
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => toggleTech(t.name)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-slate-50 font-bold text-emerald-400 dark:bg-white/5"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {t.iconUrl ? (
                        <Image
                          src={t.iconUrl}
                          alt={t.name}
                          width={14}
                          height={14}
                          className="shrink-0 object-contain"
                        />
                      ) : (
                        <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800" />
                      )}
                      <span className="truncate">{t.name}</span>
                    </div>
                    {isActive && (
                      <FaCheck size={10} className="ml-2 shrink-0 text-emerald-500" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-xs font-bold tracking-widest text-slate-600 uppercase">
                No tools found. Add them in Skill section first.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
