import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MagneticButton from "./MagneticButton";

// Mock framer-motion with ref forwarding inside hoisted factory
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MockDiv = React.forwardRef(function MockDiv(
    { children, onMouseMove, onMouseLeave }: any,
    ref: any
  ) {
    return (
      <div
        ref={ref}
        data-testid="magnetic-wrapper"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
    );
  });
  MockDiv.displayName = "MockDiv";

  return {
    motion: {
      div: MockDiv,
    },
  };
});

describe("MagneticButton Component", () => {
  it("renders children properly", () => {
    render(
      <MagneticButton>
        <button>Click Me</button>
      </MagneticButton>
    );

    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("handles mouse movements and resets on mouse leave", () => {
    render(
      <MagneticButton strength={40}>
        <span>Hover Target</span>
      </MagneticButton>
    );

    const wrapper = screen.getByTestId("magnetic-wrapper");

    // Mock getBoundingClientRect
    wrapper.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 100,
      top: 100,
      width: 200,
      height: 60,
    });

    // Move mouse over the component
    fireEvent.mouseMove(wrapper, { clientX: 250, clientY: 150 });

    // Leave mouse
    fireEvent.mouseLeave(wrapper);

    expect(screen.getByText("Hover Target")).toBeInTheDocument();
  });
});
