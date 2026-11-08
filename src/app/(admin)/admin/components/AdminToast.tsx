"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes } from "react-icons/fa";
import { cn } from "@/lib/utils";

export interface ToastState {
  msg: string;
  type: "success" | "error";
}

export interface AdminToastProps {
  toast: ToastState | null;
  className?: string;
}

export function useAdminToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" = "success") => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  return { toast, showToast };
}

export function AdminToast({ toast, className }: AdminToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          aria-atomic="true"
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className={cn(
            "fixed top-8 left-1/2 z-[100] flex items-center gap-3 rounded-2xl border px-6 py-3 shadow-2xl backdrop-blur-xl",
            toast.type === "success"
              ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
              : "border-red-500/50 bg-red-500/20 text-red-400",
            className
          )}
        >
          <div
            className={cn(
              "rounded-full p-1.5",
              toast.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20"
            )}
          >
            {toast.type === "success" ? <FaCheck size={10} /> : <FaTimes size={10} />}
          </div>
          <span className="text-sm font-bold tracking-tight">{toast.msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
