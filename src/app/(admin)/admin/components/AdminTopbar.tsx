"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronRight } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import AdminThemeToggle from "./AdminThemeToggle";

// Mirror the nav items — label only, no icons needed here
const PAGE_MAP: Record<string, { label: string; parent?: string }> = {
  "/admin": { label: "Dashboard" },
  "/admin/hero": { label: "Identity & Bio", parent: "Identity & Social" },
  "/admin/socials": { label: "Social Links", parent: "Identity & Social" },
  "/admin/skills": { label: "Skills & Tech", parent: "Professional" },
  "/admin/projects": { label: "Projects", parent: "Portfolio" },
  "/admin/demos": { label: "Playground", parent: "Portfolio" },
  "/admin/blogs": { label: "Blog & Writing", parent: "Portfolio" },
  "/admin/experience": { label: "Experience", parent: "Timeline" },
  "/admin/education": { label: "Education", parent: "Timeline" },
  "/admin/certifications": { label: "Certifications", parent: "Timeline" },
  "/admin/messages": { label: "Messages" },
  "/admin/settings": { label: "Settings", parent: "Management" },
};

export default function AdminTopbar() {
  const pathname = usePathname();

  // Match longest prefix (handles dynamic sub-routes like /admin/projects/[id])
  const matched =
    Object.keys(PAGE_MAP)
      .filter((k) => pathname === k || pathname.startsWith(k + "/"))
      .sort((a, b) => b.length - a.length)[0] ?? "/admin";

  const page = PAGE_MAP[matched];
  const isDashboard = matched === "/admin";
  const subRoute = pathname.replace(matched, "").split("/").filter(Boolean);

  return (
    <div className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/80">
      {/* Left: Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        {/* Admin root */}
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-1.5 font-medium text-slate-400 transition-colors hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <MdDashboard size={14} />
          <span className="hidden sm:inline">Admin</span>
        </Link>

        {!isDashboard && (
          <>
            <FaChevronRight
              size={9}
              className="shrink-0 text-slate-400 dark:text-slate-700"
            />
            <Link
              href={matched}
              className={`truncate tracking-tight ${
                subRoute.length > 0
                  ? "font-medium text-slate-400 transition-colors hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
                  : "text-base font-bold text-slate-900 dark:text-white"
              }`}
            >
              {page?.label ?? "Page"}
            </Link>
          </>
        )}

        {subRoute.length > 0 && (
          <>
            <FaChevronRight
              size={9}
              className="shrink-0 text-slate-400 dark:text-slate-700"
            />
            <span className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {subRoute[0] === "new" ? "New" : "Edit"}
            </span>
          </>
        )}
      </nav>

      {/* Right: Theme Toggle */}
      <div className="flex items-center gap-3">
        <AdminThemeToggle />
      </div>
    </div>
  );
}
