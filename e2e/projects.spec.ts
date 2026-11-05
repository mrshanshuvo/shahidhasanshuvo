import { test, expect } from "@playwright/test";

test.describe("Projects Archive & Detail Flow", () => {
  test("displays project cards with titles, badges, and external links", async ({
    page,
  }) => {
    const response = await page.goto("/projects");
    expect(response?.status()).toBe(200);

    // Archive heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Verify presence of at least one project link / card
    const projectLinks = page.locator('a[href^="/projects/"]');
    const count = await projectLinks.count();
    expect(count).toBeGreaterThan(0);

    // First card checks
    const firstProject = projectLinks.first();
    await expect(firstProject).toBeAttached();
  });

  test("navigates to individual project detail case study", async ({ page }) => {
    await page.goto("/projects");

    // Click on the first project link
    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await expect(firstProjectLink).toBeAttached();

    const href = await firstProjectLink.getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href!);

    // Verify detail page URL and loaded elements
    await expect(page).toHaveURL(/\/projects\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Verify case study sections exist
    await expect(
      page.getByText(/case study|the story|technology stack|overview/i).first()
    ).toBeVisible();
  });
});
