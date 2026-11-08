import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminField, AdminInput, AdminTextarea } from "./AdminFields";

describe("AdminFields Component Suite", () => {
  describe("AdminField", () => {
    it("renders label and associates with input id via htmlFor", () => {
      render(
        <AdminField label="Username" id="username-input">
          <AdminInput id="username-input" />
        </AdminField>
      );

      const label = screen.getByText("Username");
      expect(label).toBeDefined();
      expect(label.getAttribute("for")).toBe("username-input");
    });

    it("renders required indicator when required prop is true", () => {
      render(
        <AdminField label="Email" id="email-input" required>
          <AdminInput id="email-input" />
        </AdminField>
      );

      const star = screen.getByText("*");
      expect(star).toBeDefined();
      expect(star.getAttribute("aria-hidden")).toBe("true");
    });

    it("renders accessible error message with role='alert' and aria-live", () => {
      render(
        <AdminField label="Password" id="password-input" error="Password is too weak">
          <AdminInput id="password-input" hasError />
        </AdminField>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeDefined();
      expect(alert.textContent).toBe("Password is too weak");
      expect(alert.getAttribute("id")).toBe("password-input-error");
      expect(alert.getAttribute("aria-live")).toBe("polite");
    });
  });

  describe("AdminInput", () => {
    it("sets aria-invalid and aria-describedby when hasError is true", () => {
      render(<AdminInput id="test-input" hasError placeholder="Enter something" />);

      const input = screen.getByPlaceholderText("Enter something");
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(input.getAttribute("aria-describedby")).toBe("test-input-error");
    });

    it("does not set aria-invalid when in healthy state", () => {
      render(<AdminInput id="healthy-input" placeholder="Healthy" />);
      const input = screen.getByPlaceholderText("Healthy");
      expect(input.getAttribute("aria-invalid")).toBeNull();
    });
  });

  describe("AdminTextarea", () => {
    it("sets aria-invalid and aria-describedby on textarea when hasError is true", () => {
      render(<AdminTextarea id="test-area" hasError placeholder="Write bio" />);

      const textarea = screen.getByPlaceholderText("Write bio");
      expect(textarea.getAttribute("aria-invalid")).toBe("true");
      expect(textarea.getAttribute("aria-describedby")).toBe("test-area-error");
    });
  });
});
