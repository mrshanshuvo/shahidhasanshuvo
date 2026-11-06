"use client";

import { useState } from "react";
import { FaLink } from "react-icons/fa";
import { AdminDialogShell } from "../../components/AdminDialogShell";
import { AdminField, AdminInput } from "../../components/AdminFields";
import ImageUpload from "../../components/ImageUpload";
import type { SocialLink } from "./SocialRow";

const emptySocial: SocialLink = {
  label: "",
  href: "",
  iconUrl: "",
  brandColor: "",
  invertDark: false,
  order: 0,
};

interface SocialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  social: SocialLink | null;
  onSave: (social: SocialLink) => void;
  isSaving: boolean;
}

export function SocialDialog({
  open,
  onOpenChange,
  social,
  onSave,
  isSaving,
}: SocialDialogProps) {
  const [formData, setFormData] = useState<SocialLink>(social || emptySocial);

  const handleSave = () => {
    if (!formData.label || !formData.href) return;
    onSave(formData);
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={social?._id ? "Update Link" : "Add Digital Node"}
      subtitle=""
      icon={FaLink}
      iconColor="text-cyan-400"
      accentColor="from-cyan-500/5 to-blue-500/5"
      onSave={handleSave}
      saving={isSaving}
      saveLabel={social?._id ? "Update Link" : "Add Link"}
      savingLabel="Propagating..."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <AdminField label="Display Label">
            <AdminInput
              value={formData.label}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, label: e.target.value }))
              }
              placeholder="e.g. GitHub Profile"
            />
          </AdminField>
        </div>

        <AdminField label="Destination URL">
          <AdminInput
            icon={FaLink}
            className="text-sm font-medium"
            value={formData.href}
            onChange={(e) => setFormData((prev) => ({ ...prev, href: e.target.value }))}
            placeholder="https://social.network/profile"
          />
        </AdminField>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <ImageUpload
              label="Custom Icon"
              value={formData.iconUrl || ""}
              onChange={(url) => setFormData((prev) => ({ ...prev, iconUrl: url }))}
            />
          </div>
          <div className="space-y-4">
            <AdminField label="Brand Color">
              <AdminInput
                value={formData.brandColor || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brandColor: e.target.value }))
                }
                placeholder="e.g. hover:text-emerald-500"
              />
            </AdminField>

            <div className="pt-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  checked={formData.invertDark || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      invertDark: e.target.checked,
                    }))
                  }
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Invert in Dark Mode
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Turns black logos white in dark mode.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AdminDialogShell>
  );
}
