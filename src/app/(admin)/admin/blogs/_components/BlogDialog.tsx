"use client";

import { useState } from "react";
import { FaBookOpen, FaLink, FaTag, FaInfoCircle, FaPlus, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminDialogShell } from "../../components/AdminDialogShell";
import { AdminField, AdminInput, AdminTextarea } from "../../components/AdminFields";
import ImageUpload from "../../components/ImageUpload";
import DateTimePicker from "../../components/DateTimePicker";
import type { Blog } from "./BlogRow";

const emptyBlog: Blog = {
  title: "",
  description: "",
  link: "",
  date: new Date().toISOString(),
  tags: [],
  image: "",
  order: 0,
};

interface BlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: Blog | null;
  onSave: (blog: Blog) => void;
  isSaving: boolean;
}

export function BlogDialog({
  open,
  onOpenChange,
  blog,
  onSave,
  isSaving,
}: BlogDialogProps) {
  const [formData, setFormData] = useState<Blog>(blog || emptyBlog);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setTagInput("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={blog?._id ? "Refine Article" : "Draft New Insight"}
      subtitle="Share your knowledge and technical insights"
      icon={FaBookOpen}
      iconColor="text-orange-400"
      accentColor="from-orange-500/5 to-red-500/5"
      onSave={handleSave}
      saving={isSaving}
      saveLabel={blog?._id ? "Update Article" : "Publish Insight"}
      savingLabel="Publishing..."
      maxWidth="5xl"
    >
      <div className="px-1">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
          {/* Left Column: Visuals & Branding */}
          <div className="space-y-6">
            <AdminField label="Cover Narrative Image">
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              />
            </AdminField>

            <div className="flex items-start gap-4 rounded-3xl border border-orange-500/10 bg-orange-500/5 p-6">
              <FaInfoCircle className="mt-1 shrink-0 text-orange-400" size={16} />
              <div className="space-y-1">
                <p className="text-[10px] font-black tracking-wider text-orange-400/90 uppercase">
                  Visual Engagement
                </p>
                <p className="text-[11px] leading-relaxed font-medium text-slate-400">
                  A high-quality cover image significantly increases click-through rates.
                  Choose an image that visually summarizes your article&apos;s core topic.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Article Details */}
          <div className="space-y-4">
            <AdminField label="Article Title">
              <AdminInput
                icon={FaBookOpen}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g. Master Next.js 14 Server Actions"
              />
            </AdminField>

            <AdminField label="Publish Date">
              <DateTimePicker
                value={formData.date}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: val,
                  }))
                }
              />
            </AdminField>

            <AdminField label="Article Source URL">
              <AdminInput
                icon={FaLink}
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                placeholder="https://medium.com/your-article"
              />
            </AdminField>

            <AdminField label="Synopsis">
              <AdminTextarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="A compelling summary of the article..."
                className="min-h-30"
              />
            </AdminField>

            <AdminField label="Taxonomy / Tags">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <AdminInput
                    icon={FaTag}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="e.g. Next.js"
                    className="h-12 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="h-12 rounded-xl border border-slate-200 bg-slate-900 px-6 font-bold text-white shadow-inner shadow-black/5 hover:bg-slate-800 dark:border-white/5 dark:bg-slate-800 dark:shadow-black/20 dark:hover:bg-slate-700"
                  >
                    <FaPlus size={14} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <AnimatePresence>
                    {formData.tags.map((tag, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Badge
                          variant="secondary"
                          className="group gap-2 rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-orange-600 shadow-inner shadow-black/5 transition-all dark:border-white/5 dark:bg-slate-950/40 dark:text-orange-400 dark:shadow-black/10"
                        >
                          <span className="text-xs font-bold">{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(i)}
                            className="p-1 text-slate-500 transition-colors hover:text-red-400"
                          >
                            <FaTimes size={10} />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </AdminField>
          </div>
        </div>
      </div>
    </AdminDialogShell>
  );
}
