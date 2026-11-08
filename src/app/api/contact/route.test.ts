import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { contactRateLimiter } from "@/lib/rateLimit";

// Mock MongoDB
vi.mock("@/lib/mongodb", () => ({
  connectDB: vi.fn().mockResolvedValue(true),
}));

// Mock Message model
vi.mock("@/models/Message", () => ({
  default: {
    create: vi.fn().mockResolvedValue({ _id: "mock-message-id" }),
  },
}));

// Mock Nodemailer
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: "mock-msg-id" }),
    }),
  },
}));

describe("Contact API (POST /api/contact)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contactRateLimiter.reset();
  });

  it("traps spam bots via honeypot and silently returns 200 OK without saving", async () => {
    const req = new NextRequest("https://example.com/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Bot",
        email: "bot@spam.com",
        message: "Spam content",
        honeypot: "I am a bot",
        recaptchaToken: "fake-token",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ success: true });
  });

  it("returns 400 if recaptchaToken is missing", async () => {
    const req = new NextRequest("https://example.com/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        message: "Hello there",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("reCAPTCHA token is missing.");
  });

  it("returns 400 if reCAPTCHA verification fails or score is low", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: vi
        .fn()
        .mockResolvedValue({ success: false, "error-codes": ["invalid-input-secret"] }),
    } as any);

    const req = new NextRequest("https://example.com/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        message: "Hello there",
        recaptchaToken: "invalid-token",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("reCAPTCHA verification failed.");
  });

  describe("Input validation with valid reCAPTCHA", () => {
    beforeEach(() => {
      // Mock successful reCAPTCHA
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true, score: 0.9 }),
      } as any);
    });

    it("returns 400 if name is empty or only whitespace", async () => {
      const req = new NextRequest("https://example.com/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "   ",
          email: "john@example.com",
          message: "A valid message",
          recaptchaToken: "valid-token",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Name must be between 1 and 100");
    });

    it("returns 400 if name exceeds 100 characters", async () => {
      const req = new NextRequest("https://example.com/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "a".repeat(101),
          email: "john@example.com",
          message: "A valid message",
          recaptchaToken: "valid-token",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Name must be between 1 and 100");
    });

    it("returns 400 if email is invalid", async () => {
      const req = new NextRequest("https://example.com/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "John Doe",
          email: "not-an-email",
          message: "A valid message",
          recaptchaToken: "valid-token",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid email address.");
    });

    it("returns 400 if message exceeds 5000 characters", async () => {
      const req = new NextRequest("https://example.com/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          message: "m".repeat(5001),
          recaptchaToken: "valid-token",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Message must be between 1 and 5000");
    });

    it("returns 200 and processes valid contact inquiry cleanly", async () => {
      const req = new NextRequest("https://example.com/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "Jane Smith",
          email: "jane@example.com",
          message: "I would love to collaborate on a full stack project!",
          recaptchaToken: "valid-token",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
    });

    it("enforces sliding-window rate limit and returns 429 when threshold exceeded", async () => {
      const makeRequest = () =>
        new NextRequest("https://example.com/api/contact", {
          method: "POST",
          headers: { "x-forwarded-for": "198.51.100.42" },
          body: JSON.stringify({
            name: "Jane Smith",
            email: "jane@example.com",
            message: "Testing rate limiting",
            recaptchaToken: "valid-token",
          }),
        });

      // 5 requests allowed
      for (let i = 0; i < 5; i++) {
        const res = await POST(makeRequest());
        expect(res.status).toBe(200);
      }

      // 6th request must be rejected with 429
      const blocked = await POST(makeRequest());
      expect(blocked.status).toBe(429);
      expect(blocked.headers.get("Retry-After")).toBeTruthy();
      const body = await blocked.json();
      expect(body.error).toContain("Too many contact requests");
    });
  });
});
