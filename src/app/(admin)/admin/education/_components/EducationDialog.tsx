"use client";

import { useState } from "react";
import {
  FaGraduationCap,
  FaCalendarAlt,
  FaAward,
  FaUniversity,
  FaMapMarkerAlt,
  FaLink,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AdminDialogShell } from "../../components/AdminDialogShell";
import { AdminField, AdminInput } from "../../components/AdminFields";
import ImageUpload from "../../components/ImageUpload";
import type { Education } from "./EducationRow";

const emptyEdu: Education = {
  degree: "",
  institution: "",
  location: "",
  logo: "",
  period: "",
  gpa: "",
  details: [],
  link: "",
  order: 0,
};

interface EducationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  education: Education | null;
  onSave: (edu: Education) => void;
  isSaving: boolean;
}

export function EducationDialog({
  open,
  onOpenChange,
  education,
  onSave,
  isSaving,
}: EducationDialogProps) {
  const [formData, setFormData] = useState<Education>(education || emptyEdu);
  const [detailInput, setDetailInput] = useState("");

  const addDetail = () => {
    const trimmed = detailInput.trim();
    if (trimmed && !formData.details.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        details: [...prev.details, trimmed],
      }));
      setDetailInput("");
    }
  };

  const removeDetail = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSave = () => {
    if (!formData.degree || !formData.institution) return;
    onSave(formData);
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={education?._id ? "Edit Academic Record" : "Add New Education"}
      subtitle="Chronicle your academic journey and achievements"
      icon={FaGraduationCap}
      iconColor="text-blue-400"
      accentColor="from-blue-500/5 to-indigo-500/5"
      onSave={handleSave}
      saving={isSaving}
      saveLabel={education?._id ? "Update Academic File" : "Finalize Admission"}
      savingLabel="Recording..."
      maxWidth="5xl"
    >
      <div className="px-1">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_3fr]">
          {/* Left Column: Branding */}
          <div className="space-y-4">
            <AdminField label="Institution Logo">
              <ImageUpload
                value={formData.logo}
                onChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
              />
            </AdminField>

            <AdminField label="Period">
              <AdminInput
                icon={FaCalendarAlt}
                value={formData.period}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    period: e.target.value,
                  }))
                }
                placeholder="e.g. 2020 - 2024"
              />
            </AdminField>
            <AdminField label="Grade / GPA">
              <AdminInput
                icon={FaAward}
                value={formData.gpa}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gpa: e.target.value }))
                }
                placeholder="e.g. 3.9 / 4.0"
              />
            </AdminField>
          </div>

          {/* Right Column: Academic Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <AdminField label="Degree / Course">
                <AdminInput
                  icon={FaGraduationCap}
                  value={formData.degree}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      degree: e.target.value,
                    }))
                  }
                  placeholder="e.g. B.Sc in Computer Science"
                />
              </AdminField>
              <AdminField label="Institution">
                <AdminInput
                  icon={FaUniversity}
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      institution: e.target.value,
                    }))
                  }
                  placeholder="e.g. Stanford University"
                />
              </AdminField>
            </div>

            <AdminField label="Location">
              <AdminInput
                icon={FaMapMarkerAlt}
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="e.g. California, USA"
              />
            </AdminField>

            <AdminField label="Official Website">
              <AdminInput
                icon={FaLink}
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                placeholder="https://university.edu"
              />
            </AdminField>

            <AdminField label="Academic Highlights">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <AdminInput
                    icon={FaInfoCircle}
                    value={detailInput}
                    onChange={(e) => setDetailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDetail();
                      }
                    }}
                    placeholder="e.g. Dean's List, Research in AI, etc."
                    className="h-12"
                  />
                  <Button
                    type="button"
                    onClick={addDetail}
                    className="h-12 rounded-xl border border-slate-200 bg-slate-900 px-6 font-bold text-white shadow-inner shadow-black/5 hover:bg-slate-800 dark:border-white/5 dark:bg-slate-800 dark:shadow-black/20 dark:hover:bg-slate-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <AnimatePresence mode="popLayout">
                    {formData.details.map((detail, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group/item flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 shadow-inner shadow-black/5 dark:border-white/5 dark:bg-slate-950/40 dark:shadow-black/10"
                      >
                        <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {detail}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDetail(i)}
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
        </div>
      </div>
    </AdminDialogShell>
  );
}
