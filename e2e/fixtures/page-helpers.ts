/**
 * Page Helper for E2E Tests
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

export class AppPage {
  constructor(private page: Page) {}

  /**
   * Get page instance (for direct access when needed)
   */
  get pageInstance(): Page {
    return this.page;
  }

  /**
   * Navigate to home page
   */
  async navigateToHome() {
    await this.page.goto("/");
    await expect(this.page).toHaveTitle(/Paper OCR|Home/);
  }

  /**
   * Navigate to template management page
   */
  async navigateToTemplateManagement() {
    await this.page.goto("/template-management");
    await expect(this.page).toHaveTitle(/Template|テンプレート/);
  }

  /**
   * Navigate to data input page
   */
  async navigateToDataInput() {
    await this.page.goto("/data-input");
    await expect(this.page).toHaveTitle(/Data|データ入力|OCR/);
  }

  /**
   * Check if page has heading with text
   */
  async hasHeading(text: string) {
    const heading = this.page.locator(
      `heading:has-text("${text}"), h1:has-text("${text}"), h2:has-text("${text}")`
    );
    return await heading.isVisible();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Get text content of element
   */
  async getTextContent(selector: string) {
    return await this.page.locator(selector).textContent();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
    });
  }

  /**
   * Template Management Actions
   */

  /**
   * Click "Create Template" button
   */
  async clickCreateTemplateButton() {
    await this.page.click(
      'button:has-text("新規作成"), button:has-text("Create")'
    );
  }

  /**
   * Fill template name
   */
  async fillTemplateName(name: string) {
    const input = this.page
      .locator(
        'input[placeholder*="テンプレート"], input[placeholder*="Template"]'
      )
      .first();
    await input.fill(name);
  }

  /**
   * Upload template image
   */
  async uploadTemplateImage(filePath: string) {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Click region on canvas to define area
   */
  async defineRegion(
    _x: number,
    _y: number,
    _width: number,
    _height: number,
    regionName: string
  ) {
    // Click and drag to define region
    const canvas = this.page.locator("canvas").first();
    await canvas.click({ position: { x: 100, y: 100 } });
    // Fill region name
    const nameInput = this.page.locator('input[placeholder*="領域"]').first();
    await nameInput.fill(regionName);
    await this.page.keyboard.press("Enter");
  }

  /**
   * Save template
   */
  async saveTemplate() {
    await this.page.click('button:has-text("保存"), button:has-text("Save")');
    // Wait for success message or confirmation
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get template list items
   */
  async getTemplateListItems() {
    const items = this.page.locator(
      '[data-testid="template-item"], .template-list-item, li'
    );
    return await items.count();
  }

  /**
   * Click template from list
   */
  async selectTemplate(templateName: string) {
    await this.page.click(`text=${templateName}`);
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateName: string) {
    await this.selectTemplate(templateName);
    await this.page.click('button:has-text("削除"), button:has-text("Delete")');
    // Confirm deletion
    const confirmButton = this.page.locator(
      'button:has-text("確定"), button:has-text("Confirm")'
    );
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }

  /**
   * Data Input Actions
   */

  /**
   * Select template for data input
   */
  async selectTemplateForInput(templateName: string) {
    const select = this.page.locator('select, [role="combobox"]').first();
    await select.click();
    await this.page.click(`text=${templateName}`);
  }

  /**
   * Upload image for OCR
   */
  async uploadImageForOCR(filePath: string) {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Click execute OCR button
   */
  async executeOCR() {
    await this.page.click(
      'button:has-text("実行"), button:has-text("Execute"), button:has-text("OCR")'
    );
    // Wait for OCR processing
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get OCR results
   */
  async getOCRResults() {
    const results = this.page.locator(
      '[data-testid="ocr-result"], .ocr-result, .result-item'
    );
    return await results.allTextContents();
  }

  /**
   * Edit OCR result
   */
  async editOCRResult(index: number, newText: string) {
    const resultInput = this.page
      .locator('input[placeholder*="結果"]')
      .nth(index);
    await resultInput.clear();
    await resultInput.fill(newText);
  }

  /**
   * Copy results to clipboard
   */
  async copyToClipboard() {
    await this.page.click('button:has-text("コピー"), button:has-text("Copy")');
  }

  /**
   * Check if success message is displayed
   */
  async checkSuccessMessage(message?: string) {
    const messageText = message || "成功|Success|完了|Completed|コピー|Copied";
    const successElement = this.page.locator(`text=/${messageText}/i`);
    await expect(successElement).toBeVisible();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Check if on home page
   */
  async isOnHomePage() {
    return this.page.url().includes("/");
  }

  /**
   * Check if on template management page
   */
  async isOnTemplateManagementPage() {
    return this.page.url().includes("/template-management");
  }

  /**
   * Check if on data input page
   */
  async isOnDataInputPage() {
    return this.page.url().includes("/data-input");
  }

  /**
   * Utility: Reload page
   */
  async reloadPage() {
    await this.page.reload();
  }

  /**
   * Utility: Wait for navigation
   */
  async waitForNavigation() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Utility: Check local storage
   */
  async getLocalStorageItem(key: string) {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * Utility: Clear local storage
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }
}
