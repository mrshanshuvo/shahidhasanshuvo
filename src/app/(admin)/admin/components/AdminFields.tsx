"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface AdminFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminField({ label, error, children, className }: AdminFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="ml-1.5 text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase transition-all duration-300 group-focus-within:text-emerald-600 dark:text-slate-400/80 dark:group-focus-within:text-emerald-400">
        {label}
      </label>
      <div className="group relative mt-2">{children}</div>
      {error && (
        <p className="animate-in slide-in-from-top-1 ml-1 text-[10px] font-bold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconType;
}

export function AdminInput({ icon: Icon, className, ...props }: AdminInputProps) {
  return (
    <div className="group/input relative w-full">
      {Icon && (
        <div className="pointer-events-none absolute top-1/2 left-4 z-10 flex -translate-y-1/2 items-center justify-center text-slate-600 transition-colors group-focus-within/input:text-slate-900 dark:text-slate-500 dark:group-focus-within/input:text-white">
          <Icon size={16} />
        </div>
      )}
      <Input
        className={cn(
          "h-12 rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-900 shadow-inner transition-all duration-300 placeholder:text-slate-500 focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200 dark:shadow-black/20 dark:placeholder:text-slate-600",
          Icon && "pl-11",
          className
        )}
        {...props}
      />
    </div>
  );
}

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: IconType;
}

export function AdminTextarea({ icon: Icon, className, ...props }: AdminTextareaProps) {
  return (
    <div className="group/input relative w-full">
      {Icon && (
        <div className="pointer-events-none absolute top-5 left-4 z-10 text-slate-600 transition-colors group-focus-within/input:text-slate-900 dark:text-slate-500 dark:group-focus-within/input:text-white">
          <Icon size={16} />
        </div>
      )}
      <Textarea
        className={cn(
          "min-h-25 rounded-xl border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 shadow-inner transition-all duration-300 placeholder:text-slate-500 focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200 dark:shadow-black/20 dark:placeholder:text-slate-600",
          Icon && "pl-11",
          className
        )}
        {...props}
      />
    </div>
  );
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminSelectProps {
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  options: { label: string; value: string; icon?: React.ReactNode }[];
  className?: string;
  triggerClassName?: string;
}

export function AdminSelect({
  value,
  onValueChange,
  placeholder = "Select option",
  options,
  className,
  triggerClassName,
}: AdminSelectProps) {
  return (
    <div className={cn("group/input relative w-full", className)}>
      <Select value={value} onValueChange={(val) => onValueChange(val as string)}>
        <SelectTrigger
          className={cn(
            "h-12 w-full rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 shadow-inner transition-all focus:ring-4 focus:ring-emerald-500/5 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200 dark:shadow-black/20",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-200 bg-white text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900 dark:text-white">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="rounded-lg py-2.5 focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400"
            >
              <div className="flex items-center gap-3">
                {opt.icon && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-white/5">
                    {opt.icon}
                  </div>
                )}
                <span className="text-xs">{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
