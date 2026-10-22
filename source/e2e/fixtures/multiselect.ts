import { expect, type Locator, type Page } from '@playwright/test';

export async function chooseMultipleOption(page: Page, combobox: Locator, label: string, search: string, options: { skipSearch?: boolean } = {}) {
  // AntD multiple Select stays open after selection, unlike chooseOption's single-select contract.
  if ((await combobox.getAttribute('aria-expanded')) !== 'true') await combobox.click();
  if (!options.skipSearch) await combobox.fill(search);
  const dropdown = page.locator('.ant-select-dropdown:visible');
  if (options.skipSearch) await dropdown.getByText(label, { exact: true }).click();
  else await dropdown.getByTitle(label, { exact: true }).click();
  await combobox.press('Escape');
  await expect(combobox).toHaveAttribute('aria-expanded', 'false');
  await expect(dropdown).toHaveCount(0);
}
