import { expect, test } from "@playwright/test";

test("public page reports missing event cleanly", async ({ page }) => {
  await page.goto("/e/missing-event");
  await expect(page.getByText(/404|not found/i)).toBeVisible();
});
