import { describe, it, expect } from "vitest";
import { cn, formatRelativeTime, formatToDatetimeLocal } from "./utils";

describe("cn (class names merger)", () => {
  it("merges standard class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes correctly", () => {
    const isPrimary = true;
    const isLarge = false;
    expect(cn("base-btn", isPrimary && "bg-blue-500", isLarge && "text-xl")).toBe(
      "base-btn bg-blue-500"
    );
  });

  it("resolves Tailwind CSS conflicts favoring later overrides", () => {
    expect(cn("px-4 py-2", "px-6")).toBe("py-2 px-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("gracefully handles undefined, null, boolean, and empty inputs", () => {
    expect(cn(undefined, null, false, "", "text-sm")).toBe("text-sm");
  });
});

describe("formatRelativeTime", () => {
  it("formats recent timestamps as 'just now'", () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe("just now");
  });

  it("formats past minutes accurately", () => {
    const past = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(past)).toBe("5 minutes ago");
  });

  it("formats 1 minute ago accurately", () => {
    const past = new Date(Date.now() - 65 * 1000);
    expect(formatRelativeTime(past)).toBe("1 minute ago");
  });

  it("formats past hours accurately", () => {
    const past = new Date(Date.now() - 3 * 3600 * 1000);
    expect(formatRelativeTime(past)).toBe("3 hours ago");
  });

  it("formats 1 day ago as 'yesterday'", () => {
    const past = new Date(Date.now() - 25 * 3600 * 1000);
    expect(formatRelativeTime(past)).toBe("yesterday");
  });

  it("formats invalid date inputs gracefully without throwing", () => {
    expect(formatRelativeTime("not-a-valid-date")).toBe("not-a-valid-date");
  });
});

describe("formatToDatetimeLocal", () => {
  it("formats valid dates to HTML datetime-local format (YYYY-MM-DDTHH:mm)", () => {
    const date = new Date(2026, 4, 15, 14, 30); // May 15, 2026 14:30
    expect(formatToDatetimeLocal(date)).toBe("2026-05-15T14:30");
  });

  it("pads single digit months, days, hours, and minutes with leading zero", () => {
    const date = new Date(2026, 0, 5, 9, 7); // Jan 5, 2026 09:07
    expect(formatToDatetimeLocal(date)).toBe("2026-01-05T09:07");
  });

  it("returns empty string for null, undefined, or invalid dates", () => {
    expect(formatToDatetimeLocal(null)).toBe("");
    expect(formatToDatetimeLocal(undefined)).toBe("");
    expect(formatToDatetimeLocal("invalid-date")).toBe("");
  });
});
