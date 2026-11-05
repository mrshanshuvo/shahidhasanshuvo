import { test, expect } from "@playwright/test";

test.describe("Web Standards, RSS & Security Endpoints", () => {
  test("serves valid RSS 2.0 XML feed at /feed.xml", async ({ request }) => {
    const res = await request.get("/feed.xml");
    expect(res.status()).toBe(200);

    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("application/rss+xml");

    const text = await res.text();
    expect(text).toContain('<rss version="2.0"');
    expect(text).toContain("<channel>");
    expect(text).toContain("Shahid Hasan Shovu");
  });

  test("serves dynamic sitemap at /sitemap.xml", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toContain("<urlset");
    expect(text).toContain("shahidhasanshuvo");
  });

  test("serves robots.txt with disallow directives", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toContain("User-Agent:");
    expect(text).toContain("Disallow: /admin");
  });

  test("serves RFC 9116 security.txt at /.well-known/security.txt", async ({
    request,
  }) => {
    const res = await request.get("/.well-known/security.txt");
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toContain("Contact:");
    expect(text).toContain("Preferred-Languages:");
  });
});
