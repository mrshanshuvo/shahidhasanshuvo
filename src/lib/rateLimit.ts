export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds?: number;
}

export class SlidingWindowRateLimiter {
  private hits: Map<string, number[]> = new Map();
  private windowMs: number;
  private limit: number;

  constructor(options: { windowMs: number; limit: number }) {
    this.windowMs = options.windowMs;
    this.limit = options.limit;
  }

  public check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = (this.hits.get(identifier) || []).filter(
      (time) => time > windowStart
    );

    if (timestamps.length >= this.limit) {
      const oldestInWindow = timestamps[0] ?? now;
      const resetTime = oldestInWindow + this.windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));

      this.hits.set(identifier, timestamps);
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        reset: resetTime,
        retryAfterSeconds,
      };
    }

    timestamps.push(now);
    this.hits.set(identifier, timestamps);

    if (this.hits.size > 5000) {
      this.cleanup(now);
    }

    return {
      success: true,
      limit: this.limit,
      remaining: this.limit - timestamps.length,
      reset: now + this.windowMs,
    };
  }

  public reset(identifier?: string): void {
    if (identifier) {
      this.hits.delete(identifier);
    } else {
      this.hits.clear();
    }
  }

  private cleanup(now: number): void {
    const windowStart = now - this.windowMs;
    for (const [key, times] of this.hits.entries()) {
      const valid = times.filter((t) => t > windowStart);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }
}

/**
 * Extracts client IP from incoming request headers with support for proxies
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return req.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

// 5 submissions per 10-minute sliding window per client IP
export const contactRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 5,
});
