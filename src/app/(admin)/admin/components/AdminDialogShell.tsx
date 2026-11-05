"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconType } from "react-icons";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdminDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon: IconType;
  iconColor?: string;
  accentColor?: string;
  children: React.ReactNode;
  onSave: () => void;
  saving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  cancelLabel?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

export function AdminDialogShell({
  open,
  onOpenChange,
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-400",
  accentColor = "from-blue-500/5 to-indigo-500/5",
  children,
  onSave,
  saving = false,
  saveLabel = "Save Changes",
  savingLabel = "Saving...",
  cancelLabel = "Cancel",
  maxWidth = "xl",
}: AdminDialogShellProps) {
  const widthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[95vh] flex-col gap-0 overflow-hidden rounded-3xl border-slate-200 bg-white p-0 text-slate-900 shadow-[0_0_80px_rgba(0,0,0,0.1)] outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white dark:shadow-[0_0_80px_rgba(0,0,0,0.6)]",
          widthClasses[maxWidth]
        )}
      >
        <DialogHeader className="relative z-20 shrink-0 border-b border-slate-100 bg-white/60 p-8 pb-4 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/60">
          {/* Subtle accent glow in header */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-linear-to-br via-transparent opacity-30",
              accentColor
            )}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:shadow-black/20",
                  iconColor
                )}
              >
                <Icon size={28} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {title}
                </DialogTitle>
                {subtitle && (
                  <p className="mt-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-10 rounded-xl border border-transparent px-5 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase transition-all hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {cancelLabel}
              </Button>
              <Button
                onClick={onSave}
                disabled={saving}
                className="h-10 rounded-xl border border-emerald-400/20 bg-emerald-600 px-6 text-[10px] font-black tracking-[0.15em] text-white uppercase shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? savingLabel : saveLabel}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div
          className="custom-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto p-8 pt-6 outline-none"
          tabIndex={0}
          onWheel={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
