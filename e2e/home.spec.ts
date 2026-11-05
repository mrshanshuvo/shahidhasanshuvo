import { test, expect } from "@playwright/test";

test.describe("Home Page & Navigation Flow", () => {
  test("loads the homepage and displays official identity and branding", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // Verify page title and official name
    await expect(page).toHaveTitle(/Shahid Hasan Shovu/i);

    // Check header navbar brand / title
    const brand = page.locator("nav");
    await expect(brand).toBeVisible();

    // Verify main section headings
    await expect(page.locator("h1")).toBeVisible();
  });

  test("contains active navigation links to sub-archives", async ({ page }) => {
    await page.goto("/");

    // Verify links to core sub-archives exist on the page
    const projectsLink = page.locator('a[href="/projects"]').first();
    await expect(projectsLink).toBeAttached();

    const playgroundLink = page.locator('a[href="/playground"]').first();
    await expect(playgroundLink).toBeAttached();

    // Verify blog archive route is directly accessible
    const blogRes = await page.goto("/blog");
    expect(blogRes?.status()).toBe(200);
  });

  test("renders security and meta tags in the document head", async ({ page }) => {
    await page.goto("/");

    // Check OpenGraph and Canonical alternates
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /Shahid Hasan Shovu/i);

    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute("href", /feed\.xml/);
  });
});
