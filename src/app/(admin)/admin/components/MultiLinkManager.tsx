"use client";
import { useState } from "react";
import { FaPlus, FaTrash, FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { LinkItem } from "@/types";

interface MultiLinkManagerProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
  label: string;
  iconType: "github" | "live";
}

export default function MultiLinkManager({
  links = [],
  onChange,
  label,
  iconType,
}: MultiLinkManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const addLink = () => {
    if (!newUrl) return;
    onChange([
      ...links,
      {
        label: newLabel || (iconType === "github" ? "Repository" : "Live Demo"),
        url: newUrl,
      },
    ]);
    setNewLabel("");
    setNewUrl("");
  };

  const removeLink = (i: number) => {
    onChange(links.filter((_, idx) => idx !== i));
  };

  const updateLink = (i: number, field: keyof LinkItem, val: string) => {
    const next = [...links];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  const safeLinks = Array.isArray(links) ? links : [];
  const Icon = iconType === "github" ? FaGithub : FaExternalLinkAlt;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={
              iconType === "github"
                ? "text-slate-450 dark:text-slate-500"
                : "text-emerald-500 dark:text-emerald-400"
            }
            size={14}
          />
          <label className="pl-1 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
            {label}
          </label>
        </div>
        {!isAdding && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsAdding(true)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <FaPlus size={10} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {safeLinks.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative space-y-3 rounded-sm border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-white/5 dark:bg-slate-900/50 dark:shadow-none dark:hover:border-white/10"
            >
              <div className="flex items-center gap-2">
                <Input
                  className="dark:placeholder:text-slate-655 h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-inner placeholder:text-slate-400 focus-visible:ring-emerald-500/20 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-300 dark:shadow-none"
                  value={link.label}
                  onChange={(e) => updateLink(i, "label", e.target.value)}
                  placeholder="Label"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(i)}
                  className="dark:text-slate-650 h-6 w-6 text-slate-400 transition-opacity hover:text-red-500 dark:hover:text-red-400"
                >
                  <FaTrash size={10} />
                </Button>
              </div>
              <Input
                className="dark:text-slate-350 h-9 rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 shadow-inner focus-visible:ring-emerald-500/20 dark:border-white/5 dark:bg-slate-950/40 dark:shadow-none"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="URL"
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-900/30"
            >
              <div className="space-y-2">
                <label className="pl-1 text-[9px] font-black tracking-wider text-slate-500 uppercase">
                  Link Details
                </label>
                <div className="relative">
                  <Input
                    className="dark:placeholder:text-slate-655 h-10 rounded-sm border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 shadow-inner placeholder:text-slate-400 focus-visible:ring-emerald-500/20 dark:border-white/5 dark:bg-slate-950/40 dark:text-white dark:shadow-none"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Title (e.g. Frontend Repo)"
                  />
                </div>
                <div className="relative">
                  <Input
                    className="dark:placeholder:text-slate-655 h-10 rounded-sm border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-inner placeholder:text-slate-400 focus-visible:ring-emerald-500/20 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-300 dark:shadow-none"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="URL (https://...)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewLabel("");
                    setNewUrl("");
                  }}
                  className="h-8 rounded-lg text-[10px] font-black tracking-widest text-slate-500 uppercase hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (newUrl) {
                      addLink();
                      setIsAdding(false);
                    }
                  }}
                  className="h-8 rounded-lg bg-emerald-600 px-4 text-[10px] font-black tracking-widest text-white uppercase shadow-sm hover:bg-emerald-500"
                >
                  Add Link
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
