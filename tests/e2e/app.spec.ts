import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/', '/onboarding', '/dashboard', '/discover', '/tracker', '/documents',
  '/calendar', '/compare', '/profile', '/not-a-route', '/scholarship/nope', '/scholarship/pragati',
];

test.setTimeout(300_000);

test('demo journey starts an application and updates its checklist', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try demo profile' }).first().click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText('Eligible scholarships')).toBeVisible();
  await expect(page.locator('main')).toContainText(/16/);
  await page.getByRole('button', { name: /Notifications/ }).click();
  await expect(page.getByRole('region', { name: 'Notifications' })).toBeVisible();
  await page.getByRole('button', { name: /Notifications/ }).click();

  await page.locator('main a[href^="/scholarship/"]').first().click();
  await page.getByRole('button', { name: /start application/i }).click();
  await page.getByRole('link', { name: 'Tracker' }).first().click();
  await expect(page.locator('main')).toContainText(/Saved|Preparing/);
  await page.locator('main').getByRole('button', { name: /open checklist and notes/i }).first().click();
  const documentCheckbox = page.getByRole('checkbox').first();
  await documentCheckbox.click();
  await expect(documentCheckbox).toHaveAttribute('aria-checked', 'true');
});

test('fresh onboarding produces non-zero dashboard matches', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Build my profile' }).click();
  await page.getByLabel('Your name').fill('Ananya Rao');
  await page.getByLabel('Current education').selectOption('class12');
  await page.getByLabel('Field of study').selectOption('science');
  await page.getByLabel('Latest percentage or GPA (as %)').fill('78');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('State of residence').selectOption('Maharashtra');
  await page.getByLabel('Category').selectOption('general');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Annual family income').selectOption('2_5l_5l');
  await page.getByRole('switch', { name: 'None of these apply to me' }).click();
  await page.getByRole('button', { name: 'See my matches' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText('Eligible scholarships')).toBeVisible();
  await expect(page.locator('main')).toContainText(/6/);
});

test('direct route refresh works for tracker and discover', async ({ page }) => {
  for (const route of ['/tracker', '/discover']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await page.reload();
    await expect(page.locator('main')).toBeVisible();
  }
});

test('Discover search, sort, empty state, save, and compare controls work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try demo profile' }).first().click();
  await page.getByRole('link', { name: 'Discover' }).first().click();
  const search = page.getByRole('searchbox', { name: 'Search scholarships by name, provider or keyword' });
  await expect(search).toBeVisible();
  await page.getByLabel('Sort by').selectOption('amount');
  await search.fill('no-scholarship-should-match-000');
  await expect(page.getByRole('heading', { name: 'No scholarships match these filters' })).toBeVisible();
  await search.fill('');
  const saveButton = page.getByRole('button', { name: /^Save / }).first();
  await expect(saveButton).toBeVisible();
  await saveButton.click();
  const compareBoxes = page.getByRole('checkbox', { name: 'Compare' });
  for (let index = 0; index < 4; index += 1) await compareBoxes.nth(index).click();
  await expect(page.getByText('Compare is full')).toBeVisible();
  await expect(compareBoxes).toHaveCount(9);
  await page.locator('main a[href^="/scholarship/"]').first().click();
  await page.getByRole('switch', { name: 'Plain-language mode' }).click();
  await page.getByRole('button', { name: 'Start application' }).click();
  await expect(page.getByText('Already in your tracker')).toBeVisible();
});

test('tracker status can be moved and an application removed with confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try demo profile' }).first().click();
  await page.getByRole('link', { name: 'Tracker' }).first().click();
  const firstMove = page.locator('main').getByLabel(/Move .* to/).first();
  const selectId = await firstMove.getAttribute('id');
  await firstMove.selectOption('submitted');
  await expect(page.locator(`#${selectId}`)).toHaveValue('submitted');
  await page.locator('main').getByRole('button', { name: /^Remove .* from tracker$/ }).first().click();
  await expect(page.getByRole('dialog', { name: /Remove .*\?/ })).toBeVisible();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.getByText('Removed from tracker')).toBeVisible();
  await expect(page.locator('main').getByRole('article')).toHaveCount(4);
});

test('corrupt browser storage falls back to defaults without crashing', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('grantly-preferences', '{broken');
    localStorage.setItem('grantly-profile', '{broken');
    localStorage.setItem('grantly-tracker', '{broken');
  });
  await page.goto('/dashboard');
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('main')).toContainText('Tell us about you first');
});

test('axe reports no serious or critical violations across all routes and themes', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    for (const route of routes) {
      await page.addInitScript((mode) => {
        const now = new Date().toISOString();
        localStorage.setItem('grantly-preferences', JSON.stringify({ state: { theme: mode, seenNotificationIds: [] }, version: 0 }));
        localStorage.setItem('grantly-profile', JSON.stringify({ state: { profile: {
          name: 'Ananya Rao', level: 'class12', field: 'science', state: 'Maharashtra', category: 'general',
          gender: 'female', incomeBand: '2_5l_5l', percentage: 78, flags: [], flagsKnown: true,
          isDemo: false, updatedAt: now,
        } }, version: 0 }));
        localStorage.setItem('grantly-tracker', JSON.stringify({ state: { applications: {}, reminderIds: [] }, version: 0 }));
      }, theme);
      await page.goto(route);
      await page.locator('main').waitFor({ state: 'visible' });
      await page.waitForTimeout(500);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const severe = result.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
      expect(severe, `${theme} ${route}: ${severe.map((item) => item.id).join(', ')}`).toEqual([]);
    }
  }
});
