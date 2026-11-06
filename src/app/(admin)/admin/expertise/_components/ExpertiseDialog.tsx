"use client";

import { useState } from "react";
import Image from "next/image";
import { FaLaptopCode, FaCode, FaPlus, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AdminDialogShell } from "../../components/AdminDialogShell";
import { AdminField, AdminInput } from "../../components/AdminFields";
import ImageUpload from "../../components/ImageUpload";
import type { Skill, Technology } from "@/types";

const emptySkill: Skill = {
  name: "",
  tech: "",
  iconUrl: "",
};

interface ExpertiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: Skill | null;
  technologies: Technology[];
  onSave: (skill: Skill) => void;
  isSaving: boolean;
  onAddTechnology: (tech: { name: string; iconUrl: string }) => Promise<Technology>;
  isAddingTech: boolean;
}

export function ExpertiseDialog({
  open,
  onOpenChange,
  skill,
  technologies,
  onSave,
  isSaving,
  onAddTechnology,
  isAddingTech,
}: ExpertiseDialogProps) {
  const [formData, setFormData] = useState<Skill>(skill || emptySkill);
  const [newTechName, setNewTechName] = useState("");
  const [newTechIcon, setNewTechIcon] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const selectedTechs = formData.tech
    ? formData.tech
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const toggleTech = (name: string) => {
    let updated: string[];
    if (selectedTechs.includes(name)) {
      updated = selectedTechs.filter((t) => t !== name);
    } else {
      updated = [...selectedTechs, name];
    }
    setFormData((prev) => ({
      ...prev,
      tech: updated.join(", "),
    }));
  };

  const handleAddTech = async () => {
    if (!newTechName.trim() || !newTechIcon.trim()) return;
    try {
      const added = await onAddTechnology({
        name: newTechName.trim(),
        iconUrl: newTechIcon.trim(),
      });
      if (added && !selectedTechs.includes(added.name)) {
        setFormData((prev) => ({
          ...prev,
          tech: [...selectedTechs, added.name].join(", "),
        }));
      }
      setNewTechName("");
      setNewTechIcon("");
      setShowQuickAdd(false);
    } catch {
      // error handled by parent mutation
    }
  };

  const handleSave = () => {
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={skill?._id ? "Edit Expertise Domain" : "New Domain of Expertise"}
      subtitle="Define high-level technical disciplines and stacks"
      icon={FaLaptopCode}
      iconColor="text-purple-400"
      accentColor="from-purple-500/5 to-indigo-500/5"
      onSave={handleSave}
      saving={isSaving}
      saveLabel={skill?._id ? "Update Expertise" : "Add Expertise"}
      savingLabel="Processing..."
      maxWidth="5xl"
    >
      <div className="px-1">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
          {/* Left Column: Visuals */}
          <div className="space-y-8">
            <AdminField label="Custom Icon (SVG/PNG) (Optional)">
              <ImageUpload
                value={formData.iconUrl || ""}
                onChange={(val) => setFormData((prev) => ({ ...prev, iconUrl: val }))}
              />
            </AdminField>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-6">
            <AdminField label="Expertise Title">
              <AdminInput
                icon={FaLaptopCode}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Full Stack Development"
              />
            </AdminField>

            <AdminField label="Stack / Technologies">
              <div className="flex flex-col gap-3">
                <AdminInput
                  icon={FaCode}
                  className="text-sm font-medium"
                  value={formData.tech}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tech: e.target.value }))
                  }
                  placeholder="e.g. React, Next.js, TypeScript"
                />

                <div className="custom-scrollbar flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-950/40">
                  {technologies.map((t) => {
                    const isSelected = selectedTechs.includes(t.name);
                    return (
                      <Badge
                        key={t._id}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 transition-all active:scale-95",
                          isSelected
                            ? "border-transparent bg-purple-500 text-white hover:bg-purple-600"
                            : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        )}
                        onClick={() => toggleTech(t.name)}
                      >
                        {t.iconUrl && (
                          <Image
                            src={t.iconUrl}
                            alt={t.name}
                            width={14}
                            height={14}
                            className="object-contain"
                          />
                        )}
                        {t.name}
                      </Badge>
                    );
                  })}

                  {technologies.length === 0 && (
                    <p className="text-xs text-slate-500">
                      No technologies found. Add some below.
                    </p>
                  )}

                  <button
                    type="button"
                    className={cn(
                      "flex cursor-pointer items-center justify-center rounded-full px-2 transition-all duration-300 active:scale-95",
                      showQuickAdd
                        ? "rotate-45"
                        : "text-slate-400 hover:bg-purple-500/10 hover:text-purple-500"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowQuickAdd((prev) => !prev);
                    }}
                  >
                    <FaPlus size={14} strokeWidth={2} />
                  </button>
                </div>

                {/* Quick Add Tech Form */}
                {showQuickAdd && (
                  <div className="relative mt-3 flex flex-col gap-4 rounded-2xl border border-purple-500/30 bg-white p-5 shadow-[0_10px_40px_rgba(168,85,247,0.15)] dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setShowQuickAdd(false)}
                      className="absolute top-4 right-4 text-slate-400 transition-colors hover:text-slate-200"
                    >
                      <FaTimes size={16} />
                    </button>
                    <p className="text-[10px] font-black tracking-widest text-purple-400 uppercase">
                      Add New Technology
                    </p>

                    <div className="grid grid-cols-[100px_1fr] items-center gap-8">
                      <div className="h-32 w-32">
                        <ImageUpload
                          value={newTechIcon}
                          onChange={(val) => setNewTechIcon(val)}
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <AdminInput
                          icon={FaPlus}
                          className="h-11 bg-slate-50 text-sm dark:bg-slate-950"
                          placeholder="Tech Name..."
                          value={newTechName}
                          onChange={(e) => setNewTechName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTech();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          className="h-11 w-full rounded-xl bg-purple-500 font-bold text-white transition-all hover:bg-purple-600 active:scale-95"
                          disabled={
                            !newTechName.trim() || !newTechIcon.trim() || isAddingTech
                          }
                          onClick={handleAddTech}
                        >
                          {isAddingTech ? "Adding..." : "Add Tech"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AdminField>
          </div>
        </div>
      </div>
    </AdminDialogShell>
  );
}
