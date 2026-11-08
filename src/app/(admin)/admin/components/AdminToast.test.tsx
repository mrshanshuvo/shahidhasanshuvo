import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { AdminToast, useAdminToast } from "./AdminToast";

describe("AdminToast Component", () => {
  it("renders nothing when toast is null", () => {
    const { container } = render(<AdminToast toast={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders success toast with accessible role='status' and aria-live='polite'", () => {
    render(<AdminToast toast={{ msg: "Article published!", type: "success" }} />);

    const toastElement = screen.getByRole("status");
    expect(toastElement).toBeDefined();
    expect(toastElement.getAttribute("aria-live")).toBe("polite");
    expect(toastElement.getAttribute("aria-atomic")).toBe("true");
    expect(screen.getByText("Article published!")).toBeDefined();
  });

  it("renders error toast with accessible role='alert' and aria-live='assertive'", () => {
    render(<AdminToast toast={{ msg: "Failed to delete item.", type: "error" }} />);

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toBeDefined();
    expect(alertElement.getAttribute("aria-live")).toBe("assertive");
    expect(alertElement.getAttribute("aria-atomic")).toBe("true");
    expect(screen.getByText("Failed to delete item.")).toBeDefined();
  });

  it("applies custom className when provided", () => {
    render(
      <AdminToast
        toast={{ msg: "Custom class test", type: "success" }}
        className="custom-toast-class"
      />
    );

    const toastElement = screen.getByRole("status");
    expect(toastElement.className).toContain("custom-toast-class");
  });

  describe("useAdminToast hook", () => {
    it("updates toast state on showToast and auto-dismisses after duration", () => {
      vi.useFakeTimers();
      try {
        const { result } = renderHook(() => useAdminToast(2000));
        expect(result.current.toast).toBeNull();

        act(() => {
          result.current.showToast("Record updated!", "success");
        });

        expect(result.current.toast).toEqual({
          msg: "Record updated!",
          type: "success",
        });

        act(() => {
          vi.advanceTimersByTime(2100);
        });

        expect(result.current.toast).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it("resets dismiss timer on consecutive showToast calls", () => {
      vi.useFakeTimers();
      try {
        const { result } = renderHook(() => useAdminToast(2000));

        act(() => {
          result.current.showToast("First action", "success");
        });

        // Fast-forward 1500ms
        act(() => {
          vi.advanceTimersByTime(1500);
        });

        // Trigger second toast before the first 2000ms timer completes
        act(() => {
          result.current.showToast("Second action", "error");
        });

        expect(result.current.toast).toEqual({
          msg: "Second action",
          type: "error",
        });

        // Advance 1000ms: first timer would have fired at 2000ms, but reset timer should still keep second toast active
        act(() => {
          vi.advanceTimersByTime(1000);
        });
        expect(result.current.toast).toEqual({
          msg: "Second action",
          type: "error",
        });

        // Advance remaining 1100ms: second timer now elapses
        act(() => {
          vi.advanceTimersByTime(1100);
        });
        expect(result.current.toast).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it("cleans up timer on unmount without throwing", () => {
      vi.useFakeTimers();
      try {
        const { result, unmount } = renderHook(() => useAdminToast(2000));
        act(() => {
          result.current.showToast("Will unmount", "success");
        });
        unmount();
        act(() => {
          vi.advanceTimersByTime(2500);
        });
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
