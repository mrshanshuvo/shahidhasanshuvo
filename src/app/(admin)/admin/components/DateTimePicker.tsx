"use client";

import { useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DropdownProps } from "react-day-picker";

// ─── Custom calendar month/year dropdown ────────────────────────────────────
// Pure React state — deliberately avoids @base-ui/react/select to prevent
// event-interception conflicts with the outer @base-ui Popover.
function CalendarDropdown({
  value,
  onChange,
  options = [],
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside mousedown
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Scroll the selected item into view whenever the list opens
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>("[data-selected]");
    el?.scrollIntoView({ block: "center" });
  }, [open]);

  const handleSelect = (optValue: number) => {
    onChange?.({
      target: { value: String(optValue) },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        className="flex h-7 items-center gap-0.5 rounded-lg px-2 text-sm font-semibold text-slate-800 transition-colors select-none hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/8"
      >
        {selected?.label ?? "—"}
        <ChevronDownIcon
          size={13}
          className={cn(
            "text-slate-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown list — z-[200] to float above the Popover */}
      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 z-200 mt-1 max-h-52 w-fit overflow-y-auto rounded-sm border border-slate-200 bg-white py-1 shadow-2xl [scrollbar-width:none] dark:border-white/10 dark:bg-slate-900 [&::-webkit-scrollbar]:hidden"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-selected={isSelected ? "" : undefined}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "w-full px-3 py-1.5 text-left text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-orange-500 font-bold text-white"
                    : "text-slate-700 hover:bg-orange-500/10 hover:text-orange-600 dark:text-slate-200 dark:hover:text-orange-400",
                  opt.disabled && "pointer-events-none opacity-40"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
interface DateTimePickerProps {
  value?: string;
  onChange: (isoString: string) => void;
  className?: string;
}

export default function DateTimePicker({
  value,
  onChange,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedDate = value ? new Date(value) : new Date();
  const rawHour = selectedDate.getHours();
  const rawMinute = selectedDate.getMinutes();

  // native <input type="time"> expects "HH:MM" in 24-hour format
  const timeValue = `${String(rawHour).padStart(2, "0")}:${String(rawMinute).padStart(2, "0")}`;

  const formatDisplay = () => {
    if (!value) return "Pick a date & time";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "Pick a date & time";
    return format(d, "EEE, MMM d, yyyy  ·  h:mm a");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const d = new Date(selectedDate);
    d.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    d.setSeconds(0);
    d.setMilliseconds(0);
    onChange(d.toISOString());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const d = new Date(selectedDate);
    d.setHours(h);
    d.setMinutes(m);
    d.setSeconds(0);
    d.setMilliseconds(0);
    onChange(d.toISOString());
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        {/* ── Trigger ─────────────────────────────────────────────────────── */}
        <PopoverTrigger
          className={cn(
            "relative flex h-12 w-full items-center gap-3 px-4",
            "rounded-xl bg-white dark:bg-slate-950/40",
            "border border-slate-200 dark:border-white/6",
            "cursor-pointer shadow-inner select-none dark:shadow-black/20",
            "hover:border-orange-400/50 dark:hover:border-orange-500/30",
            "focus-within:border-orange-500/50 focus-within:ring-4 focus-within:ring-orange-500/5",
            "transition-all duration-300"
          )}
        >
          <FaCalendarAlt
            size={14}
            className="shrink-0 text-orange-500 dark:text-orange-400"
          />
          <span
            className={cn(
              "flex-1 truncate text-left text-sm font-semibold",
              value
                ? "text-slate-900 dark:text-slate-100"
                : "text-slate-400 dark:text-slate-500"
            )}
          >
            {formatDisplay()}
          </span>
        </PopoverTrigger>

        {/* ── Popover panel ────────────────────────────────────────────────── */}
        <PopoverContent
          align="start"
          className="w-auto overflow-visible rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl dark:border-white/10 dark:bg-slate-900"
        >
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="border-none"
              captionLayout="dropdown"
              startMonth={new Date(new Date().getFullYear() - 30, 0)}
              endMonth={new Date(new Date().getFullYear() + 10, 11)}
              components={{ Dropdown: CalendarDropdown }}
              classNames={{
                today:
                  "border border-orange-500/50 text-orange-600 dark:text-orange-400 font-bold",
                selected:
                  "bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20 font-bold rounded-lg",
                day_button: "hover:bg-slate-100 dark:hover:bg-white/5",
              }}
            />
          </div>

          {/* ── Time row ─────────────────────────────────────────────────── */}
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-white/5 dark:bg-white/2">
            <p className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Time
            </p>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-10 flex-1 items-center gap-2 rounded-xl px-3",
                  "bg-white dark:bg-slate-950/60",
                  "border border-slate-200 dark:border-white/8",
                  "shadow-inner dark:shadow-black/20",
                  "focus-within:border-orange-500/40 focus-within:ring-3 focus-within:ring-orange-500/10",
                  "transition-all duration-200"
                )}
              >
                <FaClock size={12} className="shrink-0 text-orange-400" />
                <input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  className="flex-1 border-none bg-transparent text-sm font-bold text-slate-800 tabular-nums scheme-light outline-none dark:text-slate-100 dark:scheme-dark"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "h-10 shrink-0 rounded-xl px-4",
                  "bg-orange-500 hover:bg-orange-600 active:scale-95",
                  "text-xs font-black text-white",
                  "shadow-md shadow-orange-500/20",
                  "transition-all duration-200"
                )}
              >
                Done
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
