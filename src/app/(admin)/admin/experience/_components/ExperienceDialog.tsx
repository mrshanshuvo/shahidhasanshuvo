"use client";

import { useState } from "react";
import {
  FaBriefcase,
  FaUniversity,
  FaCalendarAlt,
  FaLink,
  FaRocket,
  FaPenNib,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AdminDialogShell } from "../../components/AdminDialogShell";
import { AdminField, AdminInput } from "../../components/AdminFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExperienceItem } from "./ExperienceRow";

interface ExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience: ExperienceItem | null;
  onSave: (exp: ExperienceItem) => void;
  isSaving: boolean;
}

export function ExperienceDialog({
  open,
  onOpenChange,
  experience,
  onSave,
  isSaving,
}: ExperienceDialogProps) {
  const [form, setForm] = useState<ExperienceItem | null>(experience);
  const [detailInput, setDetailInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [prevTitleInput, setPrevTitleInput] = useState("");
  const [linkLabelInput, setLinkLabelInput] = useState("");
  const [linkUrlInput, setLinkUrlInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open || !form) return null;

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) {
      newErrors.title = "Job title is required";
    }
    if (!form.org.trim()) {
      newErrors.org = "Organization is required";
    }
    if (!form.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(form);
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={form._id ? "Refine Work History" : "New Career Milestone"}
      subtitle="Document your professional evolution and impact"
      icon={FaBriefcase}
      iconColor="text-emerald-400"
      accentColor="from-emerald-500/5 to-teal-500/5"
      onSave={handleSave}
      saving={isSaving}
      saveLabel={form._id ? "Update Chronicle" : "Save Experience"}
      savingLabel="Archiving..."
      maxWidth="5xl"
    >
      <div className="space-y-8 px-1">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <AdminField label="Job Title" id="exp-title" required error={errors.title}>
            <AdminInput
              id="exp-title"
              icon={FaBriefcase}
              value={form.title}
              hasError={!!errors.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="e.g. Senior Software Engineer"
            />
          </AdminField>
          <AdminField label="Organization" id="exp-org" required error={errors.org}>
            <AdminInput
              id="exp-org"
              icon={FaUniversity}
              value={form.org}
              hasError={!!errors.org}
              onChange={(e) => {
                setForm({ ...form, org: e.target.value });
                if (errors.org) setErrors((prev) => ({ ...prev, org: "" }));
              }}
              placeholder="e.g. Google"
            />
          </AdminField>
          <AdminField label="Duration" id="exp-duration" required error={errors.duration}>
            <AdminInput
              id="exp-duration"
              icon={FaCalendarAlt}
              value={form.duration}
              hasError={!!errors.duration}
              onChange={(e) => {
                setForm({ ...form, duration: e.target.value });
                if (errors.duration) setErrors((prev) => ({ ...prev, duration: "" }));
              }}
              placeholder="e.g. Jan 2022 - Present"
            />
          </AdminField>
          <AdminField label="Website URL" id="exp-url">
            <AdminInput
              id="exp-url"
              icon={FaLink}
              value={form.url || ""}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="e.g. https://google.com"
            />
          </AdminField>
        </div>

        {/* Arrays Section in Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Previous Titles */}
          <AdminField label="Previous Titles (Optional)">
            <div className="space-y-4">
              <div className="flex gap-2">
                <AdminInput
                  icon={FaBriefcase}
                  value={prevTitleInput}
                  onChange={(e) => setPrevTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (prevTitleInput.trim()) {
                        setForm({
                          ...form,
                          previousTitles: [
                            ...(form.previousTitles || []),
                            prevTitleInput.trim(),
                          ],
                        });
                        setPrevTitleInput("");
                      }
                    }
                  }}
                  placeholder="e.g. Software Engineer II"
                />
                <Button
                  onClick={() => {
                    if (prevTitleInput.trim()) {
                      setForm({
                        ...form,
                        previousTitles: [
                          ...(form.previousTitles || []),
                          prevTitleInput.trim(),
                        ],
                      });
                      setPrevTitleInput("");
                    }
                  }}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.previousTitles || []).map((t, i) => (
                  <Badge key={i} variant="secondary" className="gap-2 py-1.5 pr-2 pl-3">
                    {t}
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          previousTitles: (form.previousTitles || []).filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                      className="hover:text-red-500"
                    >
                      <FaTimes size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </AdminField>

          {/* Technologies */}
          <AdminField label="Technologies Used">
            <div className="space-y-4">
              <div className="flex gap-2">
                <AdminInput
                  icon={FaRocket}
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (techInput.trim()) {
                        setForm({
                          ...form,
                          technologies: [...(form.technologies || []), techInput.trim()],
                        });
                        setTechInput("");
                      }
                    }
                  }}
                  placeholder="e.g. React"
                />
                <Button
                  onClick={() => {
                    if (techInput.trim()) {
                      setForm({
                        ...form,
                        technologies: [...(form.technologies || []), techInput.trim()],
                      });
                      setTechInput("");
                    }
                  }}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.technologies || []).map((t, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="gap-2 border-emerald-500/30 py-1.5 pr-2 pl-3 text-emerald-600 dark:text-emerald-400"
                  >
                    {t}
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          technologies: (form.technologies || []).filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                      className="hover:text-red-500"
                    >
                      <FaTimes size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </AdminField>
        </div>

        {/* Custom Links */}
        <AdminField label="Custom Links (e.g., Company Post, Project)">
          <div className="space-y-4">
            <div className="flex gap-2">
              <AdminInput
                icon={FaPenNib}
                value={linkLabelInput}
                onChange={(e) => setLinkLabelInput(e.target.value)}
                placeholder="Label (e.g. Blog Post)"
              />
              <AdminInput
                icon={FaLink}
                value={linkUrlInput}
                onChange={(e) => setLinkUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (linkUrlInput.trim()) {
                      setForm({
                        ...form,
                        links: [
                          ...(form.links || []),
                          {
                            label: linkLabelInput.trim() || undefined,
                            url: linkUrlInput.trim(),
                          },
                        ],
                      });
                      setLinkLabelInput("");
                      setLinkUrlInput("");
                    }
                  }
                }}
                placeholder="URL (https://...)"
              />
              <Button
                onClick={() => {
                  if (linkUrlInput.trim()) {
                    setForm({
                      ...form,
                      links: [
                        ...(form.links || []),
                        {
                          label: linkLabelInput.trim() || undefined,
                          url: linkUrlInput.trim(),
                        },
                      ],
                    });
                    setLinkLabelInput("");
                    setLinkUrlInput("");
                  }
                }}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {(form.links || []).map((link, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <FaLink className="text-slate-400" />
                      <div>
                        <span className="block text-sm font-bold">
                          {link.label || "Link"}
                        </span>
                        <span className="text-xs text-slate-500">{link.url}</span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          links: (form.links || []).filter((_, idx) => idx !== i),
                        })
                      }
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <FaTimes />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </AdminField>

        {/* Impact & Details */}
        <AdminField label="Impact & Responsibilities">
          <div className="space-y-4">
            <div className="flex gap-3">
              <AdminInput
                icon={FaInfoCircle}
                value={detailInput}
                onChange={(e) => setDetailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (detailInput.trim()) {
                      setForm({
                        ...form,
                        details: [...form.details, detailInput.trim()],
                      });
                      setDetailInput("");
                    }
                  }
                }}
                placeholder="e.g. Spearheaded the migration to microservices architecture..."
                className="h-12"
              />
              <Button
                onClick={() => {
                  if (detailInput.trim()) {
                    setForm({
                      ...form,
                      details: [...form.details, detailInput.trim()],
                    });
                    setDetailInput("");
                  }
                }}
                className="h-12 rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Add
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {(form.details || []).map((detail, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group/item flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner shadow-black/5 dark:border-white/5 dark:bg-slate-950/40 dark:shadow-black/10"
                  >
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {detail}
                    </span>
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          details: form.details.filter((_, idx) => idx !== i),
                        })
                      }
                      className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-400/10 hover:text-red-400"
                    >
                      <FaTimes size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </AdminField>
      </div>
    </AdminDialogShell>
  );
}
