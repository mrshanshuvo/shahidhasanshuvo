"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { NavItem } from "@/types";

interface MobileNavProps {
  isOpen: boolean;
  scrolled: boolean;
  navItems: NavItem[];
  moreNavItems: NavItem[];
  mappedActive: string;
  resumeUrl: string;
  onNavClick: (id: string) => void;
}

export function MobileNav({
  isOpen,
  scrolled,
  navItems,
  moreNavItems,
  mappedActive,
  resumeUrl,
  onNavClick,
}: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`mt-3 overflow-hidden rounded-2xl md:hidden ${
            scrolled
              ? "border border-slate-200/50 bg-white/95 shadow-lg backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/95"
              : "border border-white/10 bg-slate-950/95 backdrop-blur-2xl"
          }`}
        >
          <div className="p-3">
            {[...navItems, ...moreNavItems, { id: "contact", label: "Contact" }].map(
              (item) => {
                const isActive =
                  mappedActive === item.id ||
                  (mappedActive === "more" && moreNavItems.some((m) => m.id === item.id));

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavClick(item.id)}
                    className={`w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-colors ${
                      isActive
                        ? scrolled
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "bg-white/10 text-white"
                        : scrolled
                          ? "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                          : "text-white/80 hover:bg-white/5"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </button>
                );
              }
            )}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-3 block rounded-lg px-4 py-3 text-center text-base font-medium transition-colors ${
                scrolled
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  : "bg-white/90 text-slate-900"
              }`}
            >
              Download Resume
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
