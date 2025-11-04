/**
 * Custom Assertions for E2E Tests
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ e2e/specs/01-template-management.spec.ts
 *   ├─ e2e/specs/02-data-input.spec.ts
 *   ├─ e2e/specs/03-home-navigation.spec.ts
 *   └─ e2e/specs/04-full-workflow.spec.ts
 *
 * Dependencies (External files that this file imports):
 *   └─ @playwright/test (Page, expect)
 *
 * Related Documentation:
 *   └─ Plan: docs/03_plans/phase4-4-e2e-testing-plan.md
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Assert template exists in template list
 */
export async function assertTemplateExists(page: Page, templateName: string) {
  const templateElement = page.locator(`text=${templateName}`);
  await expect(templateElement).toBeVisible();
}

/**
 * Assert template does not exist in template list
 */
export async function assertTemplateNotExists(
  page: Page,
  templateName: string
) {
  const templateElement = page.locator(`text=${templateName}`);
  await expect(templateElement).not.toBeVisible();
}

/**
 * Assert OCR results are displayed
 */
export async function assertOCRResultsDisplayed(
  page: Page,
  expectedFields: string[]
) {
  for (const field of expectedFields) {
    const fieldElement = page.locator(`text=${field}`);
    await expect(fieldElement).toBeVisible();
  }
}

/**
 * Assert success message is displayed
 */
export async function assertSuccessMessage(page: Page) {
  const successMsg = page.locator(
    "text=/成功|Success|完了|Completed|保存|Saved|コピー|Copied/i"
  );
  await expect(successMsg).toBeVisible();
}

/**
 * Assert error message is displayed
 */
export async function assertErrorMessage(page: Page) {
  const errorMsg = page.locator("text=/エラー|Error|失敗|Failed/i");
  await expect(errorMsg).toBeVisible();
}

/**
 * Assert page has heading
 */
export async function assertPageHasHeading(page: Page, headingText: string) {
  const heading = page.locator(`heading:has-text("${headingText}")`);
  await expect(heading).toBeVisible();
}

/**
 * Assert button is visible and enabled
 */
export async function assertButtonVisible(page: Page, buttonText: string) {
  const button = page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
}

/**
 * Assert button is disabled
 */
export async function assertButtonDisabled(page: Page, buttonText: string) {
  const button = page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeDisabled();
}

/**
 * Assert template count
 */
export async function assertTemplateCount(page: Page, expectedCount: number) {
  const templates = page.locator(
    '[data-testid="template-item"], .template-list-item, li'
  );
  await expect(templates).toHaveCount(expectedCount);
}

/**
 * Assert template has regions
 */
export async function assertTemplateHasRegions(
  page: Page,
  regionNames: string[]
) {
  for (const regionName of regionNames) {
    const region = page.locator(`text=${regionName}`);
    await expect(region).toBeVisible();
  }
}

/**
 * Assert page URL
 */
export async function assertPageUrl(page: Page, urlPath: string) {
  await expect(page).toHaveURL(new RegExp(urlPath));
}

/**
 * Assert page title
 */
export async function assertPageTitle(page: Page, titleText: string) {
  await expect(page).toHaveTitle(new RegExp(titleText, "i"));
}

/**
 * Assert local storage has item
 */
export async function assertLocalStorageItem(page: Page, key: string) {
  const item = await page.evaluate((k) => localStorage.getItem(k), key);
  expect(item).toBeTruthy();
  return item;
}

/**
 * Assert local storage item value
 */
export async function assertLocalStorageItemValue(
  page: Page,
  key: string,
  expectedValue: string
) {
  const item = await page.evaluate((k) => localStorage.getItem(k), key);
  expect(item).toBe(expectedValue);
}

/**
 * Assert element is visible
 */
export async function assertElementVisible(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
}

/**
 * Assert element is hidden
 */
export async function assertElementHidden(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeHidden();
}

/**
 * Assert element has text
 */
export async function assertElementHasText(
  page: Page,
  selector: string,
  expectedText: string
) {
  const element = page.locator(selector);
  await expect(element).toContainText(expectedText);
}

/**
 * Assert input field has value
 */
export async function assertInputValue(
  page: Page,
  selector: string,
  expectedValue: string
) {
  const input = page.locator(selector);
  await expect(input).toHaveValue(expectedValue);
}
