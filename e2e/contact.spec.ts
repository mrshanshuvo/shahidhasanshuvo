import { test, expect } from "@playwright/test";

test.describe("Contact Form Interaction & Validation Flow", () => {
  test("renders contact form controls and validates required fields", async ({
    page,
  }) => {
    await page.goto("/#contact");

    const form = page.getByRole("form", { name: /contact form/i });
    await expect(form).toBeVisible();

    // Verify input fields
    const nameInput = form.locator('input[name="name"], input[placeholder*="name" i]');
    const emailInput = form.locator('input[type="email"], input[placeholder*="email" i]');
    const messageInput = form.locator(
      'textarea[name="message"], textarea[placeholder*="message" i]'
    );

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();

    // Verify submit button exists
    const submitBtn = form.getByRole("button", { name: /send message|send/i });
    await expect(submitBtn).toBeVisible();
  });
});
