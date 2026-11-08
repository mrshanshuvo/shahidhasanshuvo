"use client";

import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface AdminMobileHeaderProps {
  onMenuClick: () => void;
  isOpen: boolean;
}

export default function AdminMobileHeader({
  onMenuClick,
  isOpen,
}: AdminMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl lg:hidden dark:border-white/5 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
          <span className="text-sm font-black tracking-tighter text-slate-900 dark:text-white">
            A
          </span>
        </div>
        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          Admin <span className="text-emerald-400">Panel</span>
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </Button>
    </header>
  );
}
