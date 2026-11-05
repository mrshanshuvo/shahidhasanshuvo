"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FaHome,
  FaProjectDiagram,
  FaBriefcase,
  FaEnvelope,
  FaSignOutAlt,
  FaChevronRight,
  FaRocket,
  FaGraduationCap,
  FaLink,
  FaAward,
  FaPenNib,
  FaFlask,
  FaCog,
  FaCode,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: MdDashboard,
    color: "text-blue-400",
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: FaEnvelope,
    color: "text-blue-500",
  },
  {
    type: "label",
    label: "Identity & Social",
  },
  {
    href: "/admin/hero",
    label: "Identity & Bio",
    icon: FaHome,
    color: "text-purple-400",
  },
  {
    href: "/admin/socials",
    label: "Social Links",
    icon: FaLink,
    color: "text-blue-400",
  },

  {
    type: "label",
    label: "Professional",
  },
  {
    href: "/admin/expertise",
    label: "Expertise Areas",
    icon: FaRocket,
    color: "text-purple-500",
  },
  {
    href: "/admin/technologies",
    label: "Technologies",
    icon: FaCode,
    color: "text-blue-500",
  },

  {
    type: "label",
    label: "Portfolio",
  },
  {
    href: "/admin/projects",
    label: "Projects",
    icon: FaProjectDiagram,
    color: "text-emerald-400",
  },
  {
    href: "/admin/demos",
    label: "Playground",
    icon: FaFlask,
    color: "text-purple-400",
  },
  {
    href: "/admin/blogs",
    label: "Blog & Writing",
    icon: FaPenNib,
    color: "text-blue-400",
  },

  {
    type: "label",
    label: "Timeline",
  },
  {
    href: "/admin/experience",
    label: "Experience",
    icon: FaBriefcase,
    color: "text-amber-500",
  },
  {
    href: "/admin/education",
    label: "Education",
    icon: FaGraduationCap,
    color: "text-emerald-500",
  },
  {
    href: "/admin/certifications",
    label: "Certifications",
    icon: FaAward,
    color: "text-amber-400",
  },
  {
    type: "label",
    label: "Management",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: FaCog,
    color: "text-slate-400",
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-70 flex-col border-r border-slate-200 bg-white pl-2 transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:z-auto lg:translate-x-0 dark:border-white/5 dark:bg-slate-950",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="p-8">
          <div className="flex items-center gap-4">
            <div className="group relative">
              <div className="absolute -inset-1.5 rounded-xl bg-linear-to-tr from-emerald-600 to-blue-600 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
                <Image
                  src="/favicons/light-mode-1.svg"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="dark:hidden"
                  priority
                />
                <Image
                  src="/favicons/dark-mode-1.svg"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="hidden dark:block"
                  priority
                />
              </div>
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Admin <span className="text-emerald-400">Panel</span>
              </p>
              <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Portfolio v0.2.0
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          className="custom-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-2"
          data-lenis-prevent
        >
          <div className="mb-4 px-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-600">
              Management
            </p>
          </div>
          {navItems.map((item, idx) => {
            if (item.type === "label") {
              return (
                <div key={`label-${idx}`} className="px-4 pt-6 pb-2">
                  <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                    {item.label}
                  </p>
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon!;
            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "border border-slate-200 bg-slate-100 text-emerald-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 h-5 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                )}
                <Icon
                  className={cn(
                    "text-lg transition-colors",
                    isActive ? item.color : "group-hover:text-slate-300"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <FaChevronRight size={10} className="text-slate-600" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="space-y-3 border-t border-white/5 p-2">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-normal group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-2 font-semibold text-slate-700 transition-all hover:border-red-500/10 hover:bg-red-500/10 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400"
          >
            <div className="rounded-lg bg-slate-200 p-2 text-slate-500 transition-colors group-hover:bg-red-500/20 group-hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:text-red-400">
              <FaSignOutAlt size={16} />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
