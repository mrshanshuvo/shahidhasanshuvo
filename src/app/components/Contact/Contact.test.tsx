import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Contact from "./Contact";

// Dynamic Proxy mock for framer-motion supporting all motion.* primitives
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({ children, ...props }: any) => {
          const {
            whileHover: _wh,
            whileTap: _wt,
            whileInView: _wiv,
            initial: _init,
            animate: _anim,
            transition: _trans,
            viewport: _vp,
            variants: _var,
            ...rest
          } = props;
          const Tag = prop as any;
          return <Tag {...rest}>{children}</Tag>;
        };
      },
    }
  ),
  useInView: () => true,
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock react-google-recaptcha-v3
let mockExecuteRecaptcha: any = vi.fn().mockResolvedValue("mock_token_123");

vi.mock("react-google-recaptcha-v3", () => ({
  useGoogleReCaptcha: () => ({
    executeRecaptcha: mockExecuteRecaptcha,
  }),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Contact Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecuteRecaptcha = vi.fn().mockResolvedValue("mock_token_123");
  });

  const defaultProps = {
    socialLinks: [],
    contactEmail: "mrshanshuvo@gmail.com",
    contactPhone: "+88017 94280136",
    contactLocation: "Dhaka, Bangladesh",
  };

  it("renders contact info and form input fields", () => {
    render(<Contact {...defaultProps} />);

    expect(screen.getByText("mrshanshuvo@gmail.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Shahid Hasan Shovu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("shahid@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/hello! i'd like to discuss/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("displays validation error when required fields are missing", async () => {
    render(<Contact {...defaultProps} />);

    const form = screen.getByRole("form", { name: /contact form/i });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  it("displays error when reCAPTCHA execution is unavailable", async () => {
    mockExecuteRecaptcha = null;
    render(<Contact {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("Shahid Hasan Shovu"), {
      target: { value: "Alex Developer" },
    });
    fireEvent.change(screen.getByPlaceholderText("shahid@example.com"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/hello! i'd like to discuss/i), {
      target: { value: "Let's build a Next.js application together." },
    });

    const submitBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/recaptcha not ready\. please try again\./i)
      ).toBeInTheDocument();
    });
  });

  it("successfully sends message when form is valid and handles success state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<Contact {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("Shahid Hasan Shovu"), {
      target: { value: "Alex Developer" },
    });
    fireEvent.change(screen.getByPlaceholderText("shahid@example.com"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/hello! i'd like to discuss/i), {
      target: { value: "Let's build a Next.js application together." },
    });

    const submitBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/message sent successfully!/i)).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });
});
