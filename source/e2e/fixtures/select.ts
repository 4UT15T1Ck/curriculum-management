import { expect, type Locator, type Page } from '@playwright/test';

interface ChooseOptionOptions {
  search?: string;
}

export async function chooseOption(
  page: Page,
  combobox: Locator,
  label: string,
  options: ChooseOptionOptions = {},
): Promise<void> {
  if ((await combobox.getAttribute('aria-expanded')) !== 'true') {
    await combobox.click();
  }
  if (options.search !== undefined) {
    await combobox.fill(options.search);
  }
  // AntD virtual Select options expose hidden ARIA nodes; click the titled item in the visible popup instead.
  const dropdown = page.locator('.ant-select-dropdown:visible');
  await dropdown.getByTitle(label, { exact: true }).click();
  await expect(combobox).toHaveAttribute('aria-expanded', 'false');
  await expect(dropdown).toHaveCount(0);
}
