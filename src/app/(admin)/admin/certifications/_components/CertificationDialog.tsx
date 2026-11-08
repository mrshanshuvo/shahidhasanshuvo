"use client";

import { useState } from "react";
import {
  FaAward,
  FaCalendarAlt,
  FaCertificate,
  FaUniversity,
  FaInfoCircle,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminDialogShell } from "../../components/AdminDialogShell";
import { AdminField, AdminInput } from "../../components/AdminFields";
import ImageUpload from "../../components/ImageUpload";
import type { Certification } from "./CertificationRow";

const emptyCert: Certification = {
  title: "",
  issuer: "",
  date: "",
  certificateFile: "",
  badgeLogo: "",
  details: [],
  order: 0,
};

interface CertificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certification: Certification | null;
  onSave: (cert: Certification) => void;
  isSaving: boolean;
}

export function CertificationDialog({
  open,
  onOpenChange,
  certification,
  onSave,
  isSaving,
}: CertificationDialogProps) {
  const [formData, setFormData] = useState<Certification>(certification || emptyCert);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.details.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        details: [...prev.details, trimmed],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Certification title is required";
    }
    if (!formData.issuer.trim()) {
      newErrors.issuer = "Issuing authority is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(formData);
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={certification?._id ? "Refine Credential" : "New Professional Honor"}
      subtitle="Validate your expertise with verified certifications"
      icon={FaAward}
      iconColor="text-yellow-400"
      accentColor="from-yellow-500/5 to-amber-500/5"
      onSave={handleSave}
      saving={isSaving}
      saveLabel={certification?._id ? "Update Credential" : "Establish Honor"}
      savingLabel="Processing..."
      maxWidth="5xl"
    >
      <div className="px-1">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
          {/* Left Column: Certificate Files */}
          <AdminField label="Certificate File (PDF/Image)">
            <ImageUpload
              value={formData.certificateFile || ""}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, certificateFile: url }))
              }
            />
          </AdminField>

          {/* Right Column: Information Fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <AdminField label="Badge Logo">
                <div className="h-24 w-24">
                  <ImageUpload
                    value={formData.badgeLogo || ""}
                    onChange={(url) =>
                      setFormData((prev) => ({ ...prev, badgeLogo: url }))
                    }
                  />
                </div>
              </AdminField>

              <div className="col-span-2 space-y-4">
                <AdminField
                  label="Certification Title"
                  id="cert-title"
                  required
                  error={errors.title}
                >
                  <AdminInput
                    id="cert-title"
                    icon={FaCertificate}
                    value={formData.title}
                    hasError={!!errors.title}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }));
                      if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    placeholder="e.g. AWS Solutions Architect"
                  />
                </AdminField>
                <AdminField
                  label="Issuing Authority"
                  id="cert-issuer"
                  required
                  error={errors.issuer}
                >
                  <AdminInput
                    id="cert-issuer"
                    icon={FaUniversity}
                    value={formData.issuer}
                    hasError={!!errors.issuer}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        issuer: e.target.value,
                      }));
                      if (errors.issuer) setErrors((prev) => ({ ...prev, issuer: "" }));
                    }}
                    placeholder="e.g. Amazon Web Services"
                  />
                </AdminField>
                <AdminField label="Date Issued">
                  <AdminInput
                    icon={FaCalendarAlt}
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
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
                        addSkill();
                      }
                    }}
                    placeholder="e.g. Cloud Computing..."
                    className="h-11 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    className="h-12 rounded-xl border border-slate-200 bg-slate-900 px-4 font-bold text-white shadow-inner shadow-black/5 hover:bg-slate-800 dark:border-white/5 dark:bg-slate-800 dark:shadow-black/20 dark:hover:bg-slate-700"
                  >
                    <FaPlus size={12} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.details || []).map((detail, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="group gap-2 rounded-xl border-yellow-200 bg-yellow-50 px-3 py-1.5 text-yellow-600 shadow-sm transition-all dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:shadow-none"
                    >
                      <span className="text-xs">{detail}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(i)}
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
    </AdminDialogShell>
  );
}
