import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ThemeToggle from "./ThemeToggle";

// Mock next-themes
const mockSetTheme = vi.fn();
let mockCurrentTheme = "dark";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockCurrentTheme,
    setTheme: mockSetTheme,
  }),
}));

// Mock framer-motion to simplify DOM output
const cleanProps = ({
  whileHover,
  whileTap,
  initial,
  animate,
  transition,
  ...rest
}: any) => rest;

vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, ...props }: any) => (
      <button {...cleanProps(props)}>{children}</button>
    ),
    div: ({ children, ...props }: any) => <div {...cleanProps(props)}>{children}</div>,
  },
}));

describe("ThemeToggle Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentTheme = "dark";
    // Mock requestAnimationFrame for immediate mounting
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      }
    );
  });

  it("renders the theme toggle button after mounting", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
  });

  it("switches theme from dark to light on click", () => {
    mockCurrentTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to light mode/i });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("switches theme from light to dark on click", () => {
    mockCurrentTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to dark mode/i });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
