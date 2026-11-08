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
  });
});
