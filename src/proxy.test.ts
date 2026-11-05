import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy, config } from "./proxy";

describe("Edge Proxy Guard (src/proxy.ts)", () => {
  it("config.matcher includes both /admin/:path* and /api/admin/:path*", () => {
    expect(config.matcher).toContain("/admin/:path*");
    expect(config.matcher).toContain("/api/admin/:path*");
  });

  describe("Public and Auth routes", () => {
    it("allows unauthenticated access to /login without redirect", () => {
      const req = new NextRequest("https://shahidhasanshuvo.vercel.app/login");
      const res = proxy(req);
      expect(res.headers.get("location")).toBeNull();
      expect(res.status).toBe(200);
    });

    it("allows unauthenticated access to /forgot-password", () => {
      const req = new NextRequest("https://shahidhasanshuvo.vercel.app/forgot-password");
      const res = proxy(req);
      expect(res.headers.get("location")).toBeNull();
      expect(res.status).toBe(200);
    });

    it("allows unauthenticated access to public routes like /projects", () => {
      const req = new NextRequest("https://shahidhasanshuvo.vercel.app/projects");
      const res = proxy(req);
      expect(res.headers.get("location")).toBeNull();
      expect(res.status).toBe(200);
    });
  });

  describe("Admin Page Protection (/admin/*)", () => {
    it("redirects unauthenticated requests to /login with callbackUrl query param", () => {
      const req = new NextRequest("https://shahidhasanshuvo.vercel.app/admin/settings");
      const res = proxy(req);
      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/login");
      expect(location).toContain("callbackUrl=%2Fadmin%2Fsettings");
    });

    it("allows authenticated requests with authjs.session-token cookie", () => {
      const req = new NextRequest("https://shahidhasanshuvo.vercel.app/admin", {
        headers: {
          cookie: "authjs.session-token=valid-jwt-token",
        },
      });
      const res = proxy(req);
      expect(res.headers.get("location")).toBeNull();
      expect(res.status).toBe(200);
    });

    it("allows authenticated requests with __Secure-authjs.session-token cookie", () => {
      const req = new NextRequest("https://shahidhasanshuvo.vercel.app/admin", {
        headers: {
          cookie: "__Secure-authjs.session-token=valid-jwt-token",
        },
      });
      const res = proxy(req);
      expect(res.headers.get("location")).toBeNull();
      expect(res.status).toBe(200);
    });
  });

  describe("Admin API Protection (/api/admin/*)", () => {
    it("immediately returns 401 Unauthorized for unauthenticated API requests", async () => {
      const req = new NextRequest(
        "https://shahidhasanshuvo.vercel.app/api/admin/settings"
      );
      const res = proxy(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json).toEqual({ error: "Unauthorized" });
    });

    it("allows authenticated requests through with next-auth.session-token cookie", () => {
      const req = new NextRequest(
        "https://shahidhasanshuvo.vercel.app/api/admin/projects",
        {
          headers: {
            cookie: "next-auth.session-token=valid-jwt-token",
          },
        }
      );
      const res = proxy(req);
      expect(res.status).toBe(200);
    });
  });
});
