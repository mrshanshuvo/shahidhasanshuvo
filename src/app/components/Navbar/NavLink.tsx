"use client";

import { motion } from "framer-motion";

interface NavLinkProps {
  id: string;
  label: string;
  isActive: boolean;
  scrolled: boolean;
  onClick: () => void;
  className?: string;
}

export function NavLink({
  id,
  label,
  isActive,
  scrolled,
  onClick,
  className = "",
}: NavLinkProps) {
  return (
    <button
      id={`nav-link-${id}`}
      onClick={onClick}
      className={`group relative px-3 py-2 lg:px-4 ${className}`}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={`relative z-10 cursor-pointer text-sm font-bold transition-colors ${
          isActive
            ? scrolled
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-900 dark:text-white"
            : scrolled
              ? "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"
              : "text-slate-700/70 group-hover:text-slate-900 dark:text-white/70 dark:group-hover:text-white"
        }`}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="navIndicator"
          className={`absolute right-0 bottom-0 left-0 h-0.5 ${
            scrolled ? "bg-emerald-600 dark:bg-emerald-400" : "bg-slate-900 dark:bg-white"
          }`}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}
    </button>
  );
}
