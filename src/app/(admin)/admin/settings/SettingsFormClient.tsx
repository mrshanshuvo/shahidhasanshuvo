"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FaGlobe, FaEnvelope, FaPalette, FaShieldAlt } from "react-icons/fa";
import ImageUpload from "../components/ImageUpload";
import { AdminToast, useAdminToast } from "../components/AdminToast";

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(initialSettings);
  const { toast, showToast } = useAdminToast();
  const router = useRouter();

  const saveMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return newSettings;
    },
    onSuccess: () => {
      showToast("Settings applied successfully!", "success");
      router.refresh();
    },
    onError: () => {
      showToast("Failed to apply settings.", "error");
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  return (
    <div className="space-y-8 pb-20">
      <AdminToast toast={toast} />

      {/* SEO & Brand */}
      <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
        <CardHeader className="border-b border-slate-200 bg-slate-50 p-8 dark:border-white/5 dark:bg-slate-950/20">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
              <FaGlobe size={24} />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              SEO & Branding
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                Site Display Name
              </label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <ImageUpload
                label="OG Image (Social Share)"
                value={settings.ogImage}
                onChange={(url) => setSettings({ ...settings, ogImage: url })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Meta Description
            </label>
            <Textarea
              value={settings.siteDescription}
              onChange={(e) =>
                setSettings({ ...settings, siteDescription: e.target.value })
              }
              className="h-24 rounded-xl border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication */}
      <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
        <CardHeader className="border-b border-slate-200 bg-slate-50 p-8 dark:border-white/5 dark:bg-slate-950/20">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
              <FaEnvelope size={24} />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Communication
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Target Email (For Contact Form)
            </label>
            <Input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                Contact Phone
              </label>
              <Input
                value={settings.contactPhone}
                onChange={(e) =>
                  setSettings({ ...settings, contactPhone: e.target.value })
                }
                className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                placeholder="+880123456789"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                Contact Location
              </label>
              <Input
                value={settings.contactLocation}
                onChange={(e) =>
                  setSettings({ ...settings, contactLocation: e.target.value })
                }
                className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                placeholder="Dhaka, Bangladesh"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-slate-950">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Open for Hiring
              </p>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Toggle &quot;Hire Me&quot; badges across the site.
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, isHireable: !settings.isHireable })
              }
              className={`relative h-6 w-12 rounded-full transition-colors ${settings.isHireable ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${settings.isHireable ? "left-7" : "left-1"}`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Visuals & DNA */}
      <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none">
        <CardHeader className="border-b border-slate-200 bg-slate-50 p-8 dark:border-white/5 dark:bg-slate-950/20">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-400">
              <FaPalette size={24} />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Visual DNA
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-4">
            <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Global Accent Color
            </label>
            <div className="flex flex-wrap gap-4">
              {["emerald", "blue", "purple", "rose", "amber"].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSettings({ ...settings, accentColor: color })}
                  className={`h-12 w-12 rounded-xl border-4 transition-all ${
                    settings.accentColor === color
                      ? "scale-110 border-emerald-500 shadow-lg"
                      : "border-transparent opacity-50 hover:opacity-100"
                  } bg-${color === "rose" ? "pink" : color === "emerald" ? "emerald" : color === "blue" ? "blue" : color === "purple" ? "purple" : "amber"}-500`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System */}
      <Card className="overflow-hidden rounded-2xl border-rose-200 bg-white shadow-sm backdrop-blur-xl dark:border-red-500/10 dark:bg-slate-900/40 dark:shadow-none">
        <CardHeader className="border-b border-slate-200 bg-slate-50 p-8 dark:border-white/5 dark:bg-slate-950/20">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-red-500/10 p-3 text-red-400">
              <FaShieldAlt size={24} />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Advanced System Controls
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-red-500/10 dark:bg-red-500/5">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Maintenance Mode
              </p>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Temporarily disable public access.
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  maintenanceMode: !settings.maintenanceMode,
                })
              }
              className={`relative h-6 w-12 rounded-full transition-colors ${settings.maintenanceMode ? "bg-red-500" : "bg-slate-200 dark:bg-slate-800"}`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? "left-7" : "left-1"}`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="h-16 rounded-2xl bg-emerald-600 px-12 text-lg font-black text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
        >
          {saveMutation.isPending ? "Saving DNA..." : "Apply Global Changes"}
        </Button>
      </div>
    </div>
  );
}
