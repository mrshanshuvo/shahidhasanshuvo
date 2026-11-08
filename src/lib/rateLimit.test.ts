import { describe, it, expect, beforeEach, vi } from "vitest";
import { SlidingWindowRateLimiter, getClientIp, contactRateLimiter } from "./rateLimit";

describe("SlidingWindowRateLimiter", () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    limiter = new SlidingWindowRateLimiter({ windowMs: 1000, limit: 3 });
  });

  it("permits requests within the defined threshold", () => {
    const res1 = limiter.check("ip-1");
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = limiter.check("ip-1");
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = limiter.check("ip-1");
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("blocks requests that exceed the limit within window", () => {
    limiter.check("ip-1");
    limiter.check("ip-1");
    limiter.check("ip-1");

    const blocked = limiter.check("ip-1");
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks rate limits independently across different identifiers", () => {
    limiter.check("ip-1");
    limiter.check("ip-1");
    limiter.check("ip-1");

    const blocked = limiter.check("ip-1");
    expect(blocked.success).toBe(false);

    const allowedOther = limiter.check("ip-2");
    expect(allowedOther.success).toBe(true);
    expect(allowedOther.remaining).toBe(2);
  });

  it("allows requests after the sliding window expires", () => {
    vi.useFakeTimers();
    try {
      limiter.check("ip-time");
      limiter.check("ip-time");
      limiter.check("ip-time");

      const blocked = limiter.check("ip-time");
      expect(blocked.success).toBe(false);

      // Advance time past the 1000ms window
      vi.advanceTimersByTime(1100);

      const permitted = limiter.check("ip-time");
      expect(permitted.success).toBe(true);
      expect(permitted.remaining).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("resets an identifier correctly", () => {
    limiter.check("ip-reset");
    limiter.check("ip-reset");
    limiter.check("ip-reset");
    expect(limiter.check("ip-reset").success).toBe(false);

    limiter.reset("ip-reset");
    expect(limiter.check("ip-reset").success).toBe(true);
  });
});

describe("getClientIp", () => {
  it("extracts the first IP from x-forwarded-for header", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("falls back to x-real-ip when x-forwarded-for is missing", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "198.51.100.1" },
    });
    expect(getClientIp(req)).toBe("198.51.100.1");
  });

  it("falls back to 127.0.0.1 when no proxy headers exist", () => {
    const req = new Request("https://example.com");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});

describe("contactRateLimiter singleton", () => {
  beforeEach(() => {
    contactRateLimiter.reset();
  });

  it("is initialized with a limit of 5", () => {
    const check = contactRateLimiter.check("test-singleton");
    expect(check.limit).toBe(5);
    expect(check.remaining).toBe(4);
  });
});
