"use client";

import { motion } from "framer-motion";
import type { NavItem } from "@/types";
import ThemeToggle from "../ThemeToggle";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";

interface DesktopNavProps {
  mainNavItems: NavItem[];
  moreNavItems: NavItem[];
  mappedActive: string;
  scrolled: boolean;
  resumeUrl: string;
  onNavClick: (id: string) => void;
}

export function DesktopNav({
  mainNavItems,
  moreNavItems,
  mappedActive,
  scrolled,
  resumeUrl,
  onNavClick,
}: DesktopNavProps) {
  return (
    <div className="hidden items-center gap-6 md:flex">
      <div className="mr-2 flex items-center gap-1">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.id}
            id={item.id}
            label={item.label}
            isActive={mappedActive === item.id}
            scrolled={scrolled}
            onClick={() => onNavClick(item.id)}
          />
        ))}

        {/* More Dropdown */}
        {moreNavItems.length > 0 && (
          <div className="group relative">
            <button
              className="group relative flex items-center gap-1 px-3 py-2 lg:px-4"
              aria-current={mappedActive === "more" ? "page" : undefined}
            >
              <span
                className={`relative z-10 cursor-pointer text-sm font-bold transition-colors ${
                  mappedActive === "more"
                    ? scrolled
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-900 dark:text-white"
                    : scrolled
                      ? "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"
                      : "text-slate-700/70 group-hover:text-slate-900 dark:text-white/70 dark:group-hover:text-white"
                }`}
              >
                More ▾
              </span>
              {mappedActive === "more" && (
                <motion.div
                  layoutId="navIndicator"
                  className={`absolute right-0 bottom-0 left-0 h-0.5 ${
                    scrolled
                      ? "bg-emerald-600 dark:bg-emerald-400"
                      : "bg-slate-900 dark:bg-white"
                  }`}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
            <div className="invisible absolute top-full left-0 mt-2 w-48 translate-y-2 transform overflow-hidden rounded-xl border border-slate-200 bg-white/80 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="py-2">
                {moreNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavClick(item.id)}
                    className="w-full cursor-pointer px-4 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact */}
        <NavLink
          id="contact"
          label="Contact"
          isActive={mappedActive === "contact"}
          scrolled={scrolled}
          onClick={() => onNavClick("contact")}
        />
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button
          nativeButton={false}
          render={<a href={resumeUrl} target="_blank" rel="noopener noreferrer" />}
          className={`rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all hover:-translate-y-px ${
            scrolled
              ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg dark:bg-emerald-500 dark:hover:bg-emerald-600"
              : "border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg dark:border-white/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          }`}
        >
          Resume
        </Button>
      </div>
    </div>
  );
}
