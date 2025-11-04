/**
 * Test Helpers for E2E Tests
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
 *   ├─ @playwright/test (Page)
 *   └─ ./test-data.ts
 *
 * Related Documentation:
 *   └─ Plan: docs/03_plans/phase4-4-e2e-testing-plan.md
 */

import type { Page } from "@playwright/test";
import { TEST_TEMPLATES } from "./test-data";

/**
 * Generate unique template name with timestamp
 */
export function generateTemplateName(
  baseName: string = "Test Template"
): string {
  const timestamp = Date.now();
  return `${baseName}_${timestamp}`;
}

/**
 * Wait for element by text
 */
export async function waitForElementByText(
  page: Page,
  text: string,
  timeout = 5000
) {
  await page.waitForSelector(`text=${text}`, { timeout });
}

/**
 * Click element by text
 */
export async function clickByText(page: Page, text: string) {
  await page.click(`text=${text}`);
}

/**
 * Fill input by placeholder
 */
export async function fillByPlaceholder(
  page: Page,
  placeholder: string,
  value: string
) {
  await page.fill(`input[placeholder*="${placeholder}"]`, value);
}

/**
 * Get count of elements
 */
export async function getElementCount(
  page: Page,
  selector: string
): Promise<number> {
  return await page.locator(selector).count();
}

/**
 * Get all text from elements
 */
export async function getAllText(
  page: Page,
  selector: string
): Promise<string[]> {
  return await page.locator(selector).allTextContents();
}

/**
 * Check if element is visible
 */
export async function isElementVisible(
  page: Page,
  selector: string
): Promise<boolean> {
  return await page.locator(selector).isVisible();
}

/**
 * Check if element is enabled
 */
export async function isElementEnabled(
  page: Page,
  selector: string
): Promise<boolean> {
  return await page.locator(selector).isEnabled();
}

/**
 * Wait for timeout
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create template via UI
 */
export async function createTemplateViaUI(page: Page, templateName: string) {
  // Navigate to template management
  await page.goto("/template-management");

  // Click create button
  await clickByText(page, "新規");
  await delay(500);

  // Fill template name
  const nameInput = page.locator('input[type="text"]').first();
  await nameInput.fill(templateName);

  // Click confirm
  await clickByText(page, "作成");
  await delay(1000);
}

/**
 * Get template from test data
 */
export function getTestTemplate(templateKey: keyof typeof TEST_TEMPLATES) {
  return TEST_TEMPLATES[templateKey];
}

/**
 * Format date for display
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 10): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if text contains any of the provided strings
 */
export function containsAny(text: string, ...strings: string[]): boolean {
  return strings.some((str) => text.includes(str));
}

/**
 * Parse JSON from local storage
 */
export async function getLocalStorageJSON(page: Page, key: string) {
  const item = await page.evaluate((k) => localStorage.getItem(k), key);
  return item ? JSON.parse(item) : null;
}

/**
 * Set JSON in local storage
 */
export async function setLocalStorageJSON(
  page: Page,
  key: string,
  value: unknown
) {
  const jsonString = JSON.stringify(value);
  await page.evaluate(
    ([k, v]) => localStorage.setItem(k, v),
    [key, jsonString]
  );
}

/**
 * Clear all local storage
 */
export async function clearAllLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Get clipboard content (if available)
 */
export async function getClipboardContent(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => navigator.clipboard.readText());
  } catch {
    return null;
  }
}
