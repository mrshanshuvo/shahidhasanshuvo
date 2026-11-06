"use client";

import { FaUser, FaImage } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ImageUpload from "../../components/ImageUpload";
import type { Hero } from "@/types";

interface HeroIdentitySectionProps {
  data: Hero;
  onChange: (updater: (prev: Hero) => Hero) => void;
}

export function HeroIdentitySection({ data, onChange }: HeroIdentitySectionProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Identity Card */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/20 p-2.5 text-blue-400">
              <FaUser size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Identity
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Your personal branding and display name.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
              First Name
            </label>
            <Input
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus-visible:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:shadow-none"
              value={data.name}
              onChange={(e) => onChange((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Shahid Hasan"
            />
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
              Last Name <span className="font-normal text-blue-400">(Highlighted)</span>
            </label>
            <Input
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus-visible:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:shadow-none"
              value={data.lastName}
              onChange={(e) => onChange((d) => ({ ...d, lastName: e.target.value }))}
              placeholder="e.g. Shovu"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="ml-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
              Professional Tagline
            </label>
            <Input
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus-visible:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:shadow-none"
              value={data.tagline}
              onChange={(e) => onChange((d) => ({ ...d, tagline: e.target.value }))}
              placeholder="e.g. Full-Stack Developer & Problem Solver"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="ml-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
              Resume URL / Direct Download Link
            </label>
            <Input
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus-visible:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:shadow-none"
              value={data.resumeUrl}
              onChange={(e) => onChange((d) => ({ ...d, resumeUrl: e.target.value }))}
              placeholder="e.g. /Resume_of_Shahid_Hasan_Shuvo.pdf or https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile Image Card */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/20 p-2.5 text-purple-400">
              <FaImage size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Profile Avatar
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Shown prominently in the hero section and previews.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ImageUpload
            value={data.profileImage}
            onChange={(url) => onChange((d) => ({ ...d, profileImage: url }))}
            aspect="square"
            label="Hero Portrait (Optimized WebP/JPG)"
          />
        </CardContent>
      </Card>
    </div>
  );
}
