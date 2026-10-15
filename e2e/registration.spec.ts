import { test, expect } from '@playwright/test';

test.describe('Kinus Pre-Flight QA E2E Test Suite', () => {
  test('1. Homepage - bilingual load, language switcher, and action buttons', async ({ page }) => {
    await page.goto('/');

    // Check Hebrew homepage
    await expect(page).toHaveTitle(/כינוס השלוחים|Kinus/i);
    const registerBtn = page.locator('a[href*="/register"]').first();
    await expect(registerBtn).toBeVisible();

    // Switch to English
    const enButton = page.locator('button[role="radio"]').filter({ hasText: /EN|English/i }).first();
    if (await enButton.isVisible()) {
      await enButton.click();
      await page.waitForTimeout(300);
      await expect(page.getByRole('link', { name: /Register|Registration/i }).first()).toBeVisible();
    }

    // Switch back to Hebrew
    const heButton = page.locator('button[role="radio"]').filter({ hasText: /עב|עברית/i }).first();
    if (await heButton.isVisible()) {
      await heButton.click();
      await page.waitForTimeout(300);
      await expect(page.locator('text=כינוס השלוחים').first()).toBeVisible();
    }

    // Click register button and verify navigation to /register
    await registerBtn.click();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('2. Registration Form - validation of mandatory fields, phone, email, and step progression', async ({ page }) => {
    await page.goto('/register');

    // Ensure step 1 is loaded
    await expect(page.locator('input[name="hebrewName"]')).toBeVisible();

    // Attempt to proceed without filling fields
    const nextBtn = page.locator('button').filter({ hasText: /המשך|Next/i }).first();
    await nextBtn.click();

    // Verify validation error is displayed
    const errorAlert = page.locator('[role="alert"]').or(page.locator('.text-red-400')).first();
    await expect(errorAlert).toBeVisible();

    // Fill valid identity fields for Step 1
    await page.fill('input[name="hebrewName"]', 'הרב מנחם מענדל');
    await page.fill('input[name="age"]', '32');
    await page.fill('input[name="passportOrId"]', 'P987654321');
    await page.selectOption('select[name="country"]', { index: 1 });
    await page.fill('input[name="city"]', 'כפר חב״ד');
    await page.fill('input[name="phone"]', '+972501234567');
    await page.fill('input[name="email"]', 'shliach.test.qa@chabad.org');

    // Advance to Step 2
    await nextBtn.click();

    // Verify advancement to Step 2 (dates / accommodation options)
    await expect(page.getByRole('heading', { name: /זמני שהות|Arrival/i })).toBeVisible();
  });

  test('3. Admin Portal - login screen and authentication options', async ({ page }) => {
    await page.goto('/admin/login');

    // Verify header, Google auth button, and return link
    await expect(page.locator('text=כניסת צוות וניהול הכינוס')).toBeVisible();
    const googleLoginBtn = page.locator('button').filter({ hasText: /Google/i });
    await expect(googleLoginBtn).toBeVisible();

    const backHomeLink = page.locator('a[href="/"]');
    await expect(backHomeLink).toBeVisible();
  });

  test('4. Success Confirmation Card - verified registration and QR code rendering', async ({ page }) => {
    // Navigate with mock paid shliach ID
    await page.goto('/success?id=shliach-1');

    // Confirm that the confirmation card renders
    await expect(page.locator('h1, h2').filter({ hasText: /אישור|רובין/ }).first()).toBeVisible();

    // Verify QR code image is rendered
    const qrCode = page.locator('[data-testid="registration-qr-code"]');
    await expect(qrCode).toBeVisible();
    await expect(qrCode).toHaveAttribute('src', /api\.qrserver\.com/);
  });

  test('5. Success Gate - denies access when no valid paid registration exists', async ({ page }) => {
    await page.goto('/success?id=invalid-id-999');

    // Should render the security gate message
    await expect(page.locator('text=לא נמצא אישור הרשמה תקף').or(page.locator('text=Valid Registration Not Found')).first()).toBeVisible();
    await expect(page.locator('a[href="/register"]').last()).toBeVisible();
  });
});
