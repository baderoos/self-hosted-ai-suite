import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test('homepage loads', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/Nexus|Echo AI|self-hosted/i);
});

test('user can sign up, log in, and switch workspaces', async ({ page }) => {
  await page.goto(`${BASE_URL}/signup`);
  const email = `testuser+${Date.now()}@example.com`;
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  // Wait for confirmation or dashboard
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/dashboard|workspace/i, { timeout: 10000 });
  await expect(page.locator('text=Dashboard')).toBeVisible();
  // Simulate workspace switching if UI exists
  if (await page.locator('button:has-text("Switch Workspace")').count()) {
    await page.click('button:has-text("Switch Workspace")');
    await expect(page.locator('text=Select a Workspace')).toBeVisible();
  }
});

test('user can log in and see dashboard', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  const loginEmail = process.env.E2E_LOGIN_EMAIL || '';
  const loginPassword = process.env.E2E_LOGIN_PASSWORD || '';
  await page.fill('input[type="email"]', loginEmail);
  await page.fill('input[type="password"]', loginPassword);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  // Wait for dashboard or workspace selector
  await expect(page).toHaveURL(/dashboard|workspace/i, { timeout: 10000 });
  await expect(page.locator('text=Dashboard')).toBeVisible();
});

test('non-member cannot access workspace', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  const nonMemberEmail = process.env.E2E_NONMEMBER_EMAIL || '';
  const nonMemberPassword = process.env.E2E_NONMEMBER_PASSWORD || '';
  await page.fill('input[type="email"]', nonMemberEmail);
  await page.fill('input[type="password"]', nonMemberPassword);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  // Should see an error or be denied access
  await expect(page.locator('text=Access Denied')).toBeVisible();
});
