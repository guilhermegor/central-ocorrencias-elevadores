import { expect, test } from '@playwright/test';

test.use({ locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-24T12:00:00.000Z'));
});

test('queue boots with the seeded fake database', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Fila de ocorrências' })).toBeVisible();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('registering an incident lands it in the queue', async ({ page }) => {
  await page.goto('/#/nova');
  await page.getByLabel('Elevador').selectOption('EL-01');
  await page.getByLabel('Tipo de ocorrência').selectOption('trapped_passenger');
  await page.getByLabel('Descrição').fill('Pessoa presa entre andares, interfone ok.');
  await page.getByLabel('Reportado por').fill('Portaria');
  await page.getByRole('button', { name: 'Registrar ocorrência' }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole('status')).toContainText('OC-0061 registrada');
});

test('dashboard shows the management indicators', async ({ page }) => {
  await page.goto('/#/painel');
  await expect(page.getByRole('heading', { name: 'Painel gerencial' })).toBeVisible();
  await expect(page.getByText('Elevadores reincidentes (8+ ocorrências)')).toBeVisible();
});

test('queue matches the committed visual baseline', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('article').first()).toBeVisible();
  await expect(page).toHaveScreenshot('home.png');
});
