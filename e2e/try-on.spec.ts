import { test, expect } from "@playwright/test";

// A 1x1 transparent PNG used as the mocked try-on result.
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

test("shopper can browse, register, and complete a try-on (webhook mocked)", async ({ page }) => {
  // Mock the server proxy so no real n8n call is made.
  await page.route("**/api/try-on", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "image/png",
      body: PNG_1PX,
    });
  });

  // Browse
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /see it on you/i })).toBeVisible();

  // Open a product and start try-on
  await page.getByText("Linen Summer Dress").first().click();
  await page.getByRole("button", { name: /try it on/i }).click();

  // Not logged in -> redirected to login; register instead
  await page.goto("/register");
  await page.getByLabel("Email").fill("shopper@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: /sign up/i }).click();

  // Go to try-on with a preselected product
  await page.goto("/try-on?productId=prod-linen-dress");

  // Upload a person photo
  await page.setInputFiles('input[type="file"]', {
    name: "me.png",
    mimeType: "image/png",
    buffer: PNG_1PX,
  });

  // Generate
  await page.getByRole("button", { name: /generate my try-on/i }).click();

  // Result appears with a download action
  await expect(page.getByRole("button", { name: /download image/i })).toBeVisible({
    timeout: 15_000,
  });
});
