"use client";

import React from "react";
import { FaSave } from "react-icons/fa";
import { IconType } from "react-icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSheetShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: IconType;
  iconColor?: string;
  accentColor?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  cancelLabel?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
}

export function AdminSheetShell({
  open,
  onOpenChange,
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-emerald-400",
  accentColor = "from-emerald-500/5 to-cyan-500/5",
  children,
  onSave,
  saving = false,
  saveLabel = "Save Changes",
  savingLabel = "Saving...",
  cancelLabel = "Cancel",
  maxWidth = "3xl",
}: AdminSheetShellProps) {
  // Map maxWidth to sheet specific classes if needed,
  // but Shadcn Sheet usually handles width via side or className.
  const widthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
    full: "sm:max-w-full",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "flex flex-col gap-0 border-l border-white/10 bg-slate-900/98 p-0 text-white shadow-[-20px_0_80px_rgba(0,0,0,0.6)] backdrop-blur-3xl",
          widthClasses[maxWidth] || widthClasses["2xl"]
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-linear-to-br",
            accentColor
          )}
        />

        <SheetHeader className="relative z-10 shrink-0 border-b border-white/5 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              {Icon && (
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 shadow-xl",
                    iconColor
                  )}
                >
                  <Icon size={24} />
                </div>
              )}
              <div>
                <SheetTitle className="text-xl font-black tracking-tight text-white">
                  {title}
                </SheetTitle>
                {subtitle && (
                  <SheetDescription className="mt-1 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                    {subtitle}
                  </SheetDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-10 rounded-xl border border-transparent px-4 text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase transition-all hover:border-white/10 hover:bg-white/5 hover:text-white"
              >
                {cancelLabel}
              </Button>
              {onSave && (
                <Button
                  onClick={onSave}
                  disabled={saving}
                  className="h-10 min-w-30 rounded-xl border border-emerald-400/20 bg-emerald-600 px-6 text-[10px] font-black tracking-[0.15em] text-white uppercase shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>{savingLabel}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaSave size={12} />
                      <span>{saveLabel}</span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="custom-scrollbar relative z-10 flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
