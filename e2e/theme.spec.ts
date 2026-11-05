import { test, expect } from "@playwright/test";

test.describe("Theme Toggle Flow", () => {
  test("toggles theme between dark and light modes", async ({ page }) => {
    await page.goto("/");

    // Locate the theme button by its dynamic aria-label
    const themeBtn = page.getByRole("button", { name: /switch to (light|dark) mode/i });
    await expect(themeBtn).toBeVisible();

    const htmlElement = page.locator("html");

    // Capture initial theme class or attribute
    const initialClass = await htmlElement.getAttribute("class");

    // Click toggle button
    await themeBtn.click();

    // Verify theme changed
    await expect(htmlElement).not.toHaveClass(initialClass || "");

    // Click again to toggle back
    await themeBtn.click();
    if (initialClass) {
      await expect(htmlElement).toHaveClass(new RegExp(initialClass));
    }
  });
});
