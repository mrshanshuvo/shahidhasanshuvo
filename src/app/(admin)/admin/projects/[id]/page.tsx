"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaSave, FaStar, FaRegStar, FaInfoCircle, FaPlus, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "../../components/ImageUpload";
import MediaGalleryManager from "../../components/MediaGalleryManager";
import MultiLinkManager from "../../components/MultiLinkManager";
import CategoryCombobox from "../../components/CategoryCombobox";
import TechCombobox from "../../components/TechCombobox";
import { Button } from "@/components/ui/button";
import { AdminField, AdminInput, AdminTextarea } from "../../components/AdminFields";
import { AdminToast, useAdminToast } from "../../components/AdminToast";
import { cn } from "@/lib/utils";
import type {
  Project,
  MediaItem,
  Category as ICategory,
  LinkItem,
  Technology,
} from "@/types";

const EMPTY_PROJECT: Omit<Project, "_id"> = {
  title: "",
  slug: "",
  description: "",
  image: "",
  techNames: [],
  github: [],
  live: [],
  featured: false,
  category: [],
  improvements: [],
  media: [],
  order: 0,
};

export default function ProjectEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [form, setForm] = useState<Omit<Project, "_id">>(EMPTY_PROJECT);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [impInput, setImpInput] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast, showToast } = useAdminToast();

  function update<K extends keyof Project>(field: K, val: Project[K]) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  const refreshCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    const fetches: Promise<any>[] = [
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/technologies").then((r) => r.json()),
    ];
    if (!isNew) {
      fetches.push(fetch(`/api/admin/projects/${id}`).then((r) => r.json()));
    }
    Promise.all(fetches).then(([cats, technologiesData, project]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setTechnologies(Array.isArray(technologiesData) ? technologiesData : []);
      if (project) {
        // Coerce nullable fields to safe defaults
        setForm({
          ...project,
          title: project.title || "",
          slug: project.slug || "",
          description: project.description || "",
          image: project.image || "",
          category: Array.isArray(project.category)
            ? project.category
            : project.category
              ? [project.category]
              : [],
          techNames: Array.isArray(project.techNames) ? project.techNames : [],
          github: Array.isArray(project.github) ? project.github : [],
          live: Array.isArray(project.live) ? project.live : [],
          improvements: Array.isArray(project.improvements) ? project.improvements : [],
          media: Array.isArray(project.media) ? project.media : [],
          featured: !!project.featured,
        });
      }
      setLoading(false);
    });
  }, [id, isNew]);

  async function handleSave() {
    if (!form.title.trim()) {
      setErrors({ title: "Project title is required" });
      showToast("Title is required.", "error");
      return;
    }
    setErrors({});
    setSaving(true);
    let res: Response;
    if (isNew) {
      // For new: use bulk PUT with a single item (existing API)
      const allRes = await fetch("/api/admin/projects").then((r) => r.json());
      const all = Array.isArray(allRes) ? allRes : [];
      res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([...all, { ...form, order: all.length }]),
      });
    } else {
      res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    if (res.ok) {
      showToast(isNew ? "Project created!" : "Project saved!");
      setTimeout(() => router.push("/admin/projects"), 800);
    } else {
      showToast("Failed to save.", "error");
    }
  }

  function addImprovement() {
    const val = impInput.trim();
    if (!val) return;
    update("improvements", [...(form.improvements ?? []), val]);
    setImpInput("");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Toast */}
      <AdminToast toast={toast} />

      {/* Form */}
      <main className="mx-auto max-w-400 px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-12 xl:grid-cols-[1fr_1.5fr]">
          {/* Left Column: Assets & Links */}
          <div className="space-y-6 xl:sticky xl:top-32">
            <MediaGalleryManager
              media={(form.media as MediaItem[]) || []}
              onChange={(m) => update("media", m as any)}
              label="Project Showcase"
            />

            <AdminField label="Thumbnail / Cover">
              <ImageUpload value={form.image} onChange={(v) => update("image", v)} />
            </AdminField>
          </div>

          {/* Right Column: Content & Metadata */}
          <div className="space-y-6">
            <div className="flex items-end gap-4">
              <AdminField
                label="Project Title"
                required
                htmlFor="project-title"
                error={errors.title}
                className="flex-1"
              >
                <AdminInput
                  id="project-title"
                  hasError={!!errors.title}
                  className="h-14"
                  value={form.title}
                  onChange={(e) => {
                    update("title", e.target.value);
                    if (errors.title) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.title;
                        return next;
                      });
                    }
                  }}
                  placeholder="e.g. AI-Powered Dashboard"
                />
              </AdminField>

              <AdminField label="Category" className="min-w-70">
                <CategoryCombobox
                  value={
                    Array.isArray(form.category)
                      ? form.category
                      : form.category
                        ? [form.category]
                        : []
                  }
                  onChange={(v) => update("category", v)}
                  categories={categories}
                  refreshCategories={refreshCategories}
                />
              </AdminField>

              <AdminField label="Featured Project">
                <Button
                  variant="ghost"
                  onClick={() => update("featured", !form.featured)}
                  className={cn(
                    "rounded-2xl border px-5 py-7 transition-all",
                    form.featured
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400"
                      : "border-slate-200 bg-white text-slate-400 hover:text-amber-500 dark:border-white/5 dark:bg-slate-950/50 dark:text-slate-600 dark:hover:text-amber-400"
                  )}
                >
                  {form.featured ? (
                    <FaStar className="size-6" />
                  ) : (
                    <FaRegStar className="size-6" />
                  )}
                </Button>
              </AdminField>
            </div>

            <AdminField label="Value Proposition (Description)">
              <AdminTextarea
                className="min-h-40"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What problem does this project solve?"
              />
            </AdminField>

            <AdminField label="Tech Stack">
              <TechCombobox
                value={form.techNames}
                onChange={(val) => update("techNames", val)}
                technologies={technologies}
              />
            </AdminField>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-slate-950/40">
                <MultiLinkManager
                  label="Github Repositories"
                  iconType="github"
                  links={(form.github as LinkItem[]) || []}
                  onChange={(l) => update("github", l as any)}
                />
              </div>
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-slate-950/40">
                <MultiLinkManager
                  label="Live Deployments"
                  iconType="live"
                  links={(form.live as LinkItem[]) || []}
                  onChange={(l) => update("live", l as any)}
                />
              </div>
            </div>

            <AdminField label="Key Improvements & Impacts">
              <div className="space-y-6">
                <div className="flex gap-3">
                  <AdminInput
                    icon={FaInfoCircle}
                    value={impInput}
                    onChange={(e) => setImpInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addImprovement())
                    }
                    placeholder="What was the key outcome or technical hurdle you solved?"
                  />
                  <Button
                    onClick={addImprovement}
                    className="animate-in fade-in flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-slate-800 text-white duration-300 hover:bg-slate-700"
                  >
                    <FaPlus size={14} />
                  </Button>
                </div>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {(form.improvements ?? []).map((imp, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="group/imp flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-2 shadow-sm dark:border-white/5 dark:bg-slate-950/50 dark:shadow-none"
                      >
                        <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500/40" />
                        <span className="flex-1 text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-300">
                          {imp}
                        </span>
                        <button
                          onClick={() =>
                            update(
                              "improvements",
                              (form.improvements ?? []).filter((_, idx) => idx !== i)
                            )
                          }
                          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-400/10 hover:text-red-400"
                        >
                          <FaTrash size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </AdminField>
          </div>
        </div>
      </main>

      {/* Floating Save Button */}
      <div className="fixed right-10 bottom-10 z-50">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="group rounded-xl bg-emerald-600 p-6 text-base font-black text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 active:scale-95"
        >
          <FaSave
            className={cn(
              "mr-1 transition-transform duration-500",
              saving ? "animate-spin" : "group-hover:rotate-12"
            )}
            size={20}
          />
          {saving ? "Saving..." : isNew ? "Create Project" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
