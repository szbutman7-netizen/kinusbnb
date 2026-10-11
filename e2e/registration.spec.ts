import { test, expect } from '@playwright/test';

test.describe('Kinus Registration & Navigation E2E Tests', () => {
  test('should load the homepage and display brand title and action buttons', async ({ page }) => {
    await page.goto('/');
    
    // Check page title / main heading
    await expect(page).toHaveTitle(/כינוס השלוחים|Kinus/i);
    
    // Check navigation buttons or main registration button
    const registerBtn = page.locator('a[href*="/register"]').first();
    await expect(registerBtn).toBeVisible();
  });

  test('should navigate to registration page and display registration form steps', async ({ page }) => {
    await page.goto('/register');
    
    // Check that registration page is loaded
    await expect(page.locator('form, input').first()).toBeVisible();
    
    // Check presence of name / email input fields
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible();
  });

  test('should load admin login page and display login options', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Check presence of admin login title and buttons
    await expect(page.locator('text=כניסת צוות וניהול הכינוס')).toBeVisible();
    await expect(page.locator('button').first()).toBeVisible();
  });
});
