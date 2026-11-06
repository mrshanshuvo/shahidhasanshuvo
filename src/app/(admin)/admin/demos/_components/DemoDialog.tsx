"use client";

import { useState } from "react";
import { FaFlask, FaLink, FaGithub, FaStar, FaInfoCircle } from "react-icons/fa";
import { AdminDialogShell } from "../../components/AdminDialogShell";
import { AdminField, AdminInput, AdminTextarea } from "../../components/AdminFields";
import MediaGalleryManager from "../../components/MediaGalleryManager";
import ImageUpload from "../../components/ImageUpload";
import TechCombobox from "../../components/TechCombobox";
import type { Technology } from "@/types";
import type { Demo } from "./DemoRow";

const emptyDemo: Demo = {
  title: "",
  slug: "",
  description: "",
  url: "",
  github: "",
  featured: false,
  image: "",
  tech: [],
  media: [],
  order: 0,
};

interface DemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demo: Demo | null;
  technologies: Technology[];
  onSave: (demo: Demo) => void;
  isSaving: boolean;
}

export function DemoDialog({
  open,
  onOpenChange,
  demo,
  technologies,
  onSave,
  isSaving,
}: DemoDialogProps) {
  const [formData, setFormData] = useState<Demo>(demo || emptyDemo);

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev._id ? prev.slug : slug,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={demo?._id ? "Refine Experiment" : "New Playground Demo"}
      subtitle="Curate and showcase your interactive experiments"
      icon={FaFlask}
      iconColor="text-indigo-400"
      accentColor="from-indigo-500/5 to-purple-500/5"
      onSave={handleSave}
      saving={isSaving}
      saveLabel={demo?._id ? "Update Demo" : "Publish Demo"}
      savingLabel="Processing..."
      maxWidth="5xl"
    >
      <div className="px-1">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
          {/* Left Column: Visuals */}
          <div className="space-y-6">
            <AdminField label="Media Gallery">
              <div className="mb-4 flex items-start gap-4 rounded-3xl border border-indigo-500/10 bg-indigo-500/5 p-6 shadow-sm dark:border-indigo-500/20 dark:shadow-none">
                <FaInfoCircle
                  className="mt-1 shrink-0 text-indigo-600 dark:text-indigo-400"
                  size={16}
                />
                <div className="space-y-1">
                  <p className="text-[10px] font-black tracking-wider text-indigo-600 uppercase dark:text-indigo-400/90">
                    Visual Engagement
                  </p>
                  <p className="text-[11px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                    Showcase your work visually. You can add multiple images or videos to
                    document your experiment.
                  </p>
                </div>
              </div>
              <MediaGalleryManager
                media={formData.media}
                onChange={(newMedia) =>
                  setFormData((prev) => ({ ...prev, media: newMedia }))
                }
              />
            </AdminField>

            <AdminField label="Thumbnail / Cover">
              <ImageUpload
                value={formData.image || ""}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              />
            </AdminField>
          </div>

          {/* Right Column: Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <AdminField label="Demo Title">
                <AdminInput
                  icon={FaFlask}
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. AI-Powered Chatbot"
                />
              </AdminField>
              <AdminField label="Slug">
                <AdminInput
                  icon={FaLink}
                  value={formData.slug || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    }))
                  }
                  placeholder="ai-powered-chatbot"
                />
              </AdminField>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <AdminField label="Live URL">
                <AdminInput
                  icon={FaLink}
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://playground..."
                />
              </AdminField>
              <AdminField label="GitHub Repository URL">
                <AdminInput
                  icon={FaGithub}
                  value={formData.github || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, github: e.target.value }))
                  }
                  placeholder="https://github.com/..."
                />
              </AdminField>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <AdminField label="Featured Flag">
                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-900/20 px-4 dark:border-white/5 dark:bg-slate-950/40">
                  <label className="flex w-full cursor-pointer items-center gap-3 select-none">
                    <input
                      type="checkbox"
                      checked={!!formData.featured}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          featured: e.target.checked,
                        }))
                      }
                      className="size-4 cursor-pointer rounded border-slate-300 accent-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-slate-950"
                    />
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <FaStar className="text-amber-400" size={11} /> Featured Lab
                      Experiment
                    </span>
                  </label>
                </div>
              </AdminField>
            </div>

            <AdminField label="Description">
              <AdminTextarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="What is this experiment about?..."
                className="min-h-30"
              />
            </AdminField>

            <AdminField label="Technologies Used">
              <TechCombobox
                value={formData.tech}
                onChange={(val) => setFormData((prev) => ({ ...prev, tech: val }))}
                technologies={technologies}
              />
            </AdminField>
          </div>
        </div>
      </div>
    </AdminDialogShell>
  );
}
