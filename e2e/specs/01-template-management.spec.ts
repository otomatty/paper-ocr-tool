/**
 * Template Management E2E Tests
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ Playwright Test Runner
 *
 * Dependencies (External files that this file imports):
 *   ├─ @playwright/test
 *   ├─ ./fixtures/page-helpers.ts
 *   ├─ ./utils/assertions.ts
 *   ├─ ./utils/test-helpers.ts
 *   └─ ./utils/test-data.ts
 *
 * Related Documentation:
 *   └─ Plan: docs/03_plans/phase4-4-e2e-testing-plan.md
 */

import { test, expect } from '@playwright/test';
import { AppPage } from '../fixtures/page-helpers';
import { assertTemplateExists, assertTemplateNotExists } from '../utils/assertions';
import { generateTemplateName, delay, clearAllLocalStorage } from '../utils/test-helpers';

interface Template {
  id: string;
  name: string;
  createdAt: string;
  regions: unknown[];
}

test.describe('Template Management E2E', () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await clearAllLocalStorage(page);
    await appPage.navigateToTemplateManagement();
  });

  // TE-01-001: 新規テンプレート作成フロー
  test('TE-01-001: should create new template with regions', async ({ page }) => {
    // 新しいテンプレート名を生成
    const templateName = generateTemplateName('新規テンプレート');

    // テンプレート作成ボタンをクリック
    await appPage.clickCreateTemplateButton();
    await delay(500);

    // テンプレート名を入力
    await appPage.fillTemplateName(templateName);

    // テンプレート名が入力されていることを確認
    const nameInput = page.locator('input[placeholder*="テンプレート"]').first();
    await expect(nameInput).toHaveValue(templateName);

    // テンプレートを保存
    await appPage.saveTemplate();
    await delay(1000);

    // テンプレートが一覧に表示されることを確認
    await assertTemplateExists(page, templateName);
  });

  // TE-01-002: テンプレート一覧表示
  test('TE-01-002: should display all templates in list', async ({ page }) => {
    const templateName1 = generateTemplateName('テンプレート1');
    const templateName2 = generateTemplateName('テンプレート2');

    // 最初のテンプレート作成
    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(templateName1);
    await appPage.saveTemplate();
    await delay(1000);

    // ページをリロード
    await appPage.reloadPage();
    await appPage.waitForNavigation();

    // テンプレート1が表示されていることを確認
    await assertTemplateExists(page, templateName1);

    // 2 番目のテンプレート作成
    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(templateName2);
    await appPage.saveTemplate();
    await delay(1000);

    // 両方のテンプレートが表示されていることを確認
    await assertTemplateExists(page, templateName1);
    await assertTemplateExists(page, templateName2);

    // テンプレート数を確認（少なくとも 2 つ）
    const count = await appPage.getTemplateListItems();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  // TE-01-003: テンプレート削除
  test('TE-01-003: should delete template', async ({ page }) => {
    const templateName = generateTemplateName('削除対象テンプレート');

    // テンプレート作成
    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(templateName);
    await appPage.saveTemplate();
    await delay(1000);

    // テンプレートが表示されていることを確認
    await assertTemplateExists(page, templateName);

    // テンプレートを選択
    await appPage.selectTemplate(templateName);
    await delay(300);

    // テンプレート削除ボタンをクリック
    const deleteButton = page.locator('button:has-text("削除"), button:has-text("Delete")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await delay(500);

      // 削除確認ダイアログがある場合は確認
      const confirmButton = page.locator(
        'button:has-text("確定"), button:has-text("OK"), button:has-text("Delete")'
      );
      if (await confirmButton.first().isVisible()) {
        await confirmButton.first().click();
      }
      await delay(1000);

      // テンプレートが削除されていることを確認
      await assertTemplateNotExists(page, templateName);
    }
  });

  // TE-01-004: テンプレート永続性
  test('TE-01-004: should persist templates across page reloads', async ({ page }) => {
    const templateName = generateTemplateName('永続性テンプレート');

    // テンプレート作成
    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(templateName);
    await appPage.saveTemplate();
    await delay(1000);

    // テンプレートが表示されることを確認
    await assertTemplateExists(page, templateName);
    const countBefore = await appPage.getTemplateListItems();

    // ページをリロード
    await appPage.reloadPage();
    await appPage.waitForNavigation();

    // リロード後もテンプレートが存在することを確認
    await assertTemplateExists(page, templateName);
    const countAfter = await appPage.getTemplateListItems();

    // テンプレート数が同じであることを確認
    expect(countAfter).toBe(countBefore);
  });

  // TE-01-005: テンプレートにローカルストレージが保存されている
  test('TE-01-005: should save template to local storage', async () => {
    const templateName = generateTemplateName('ストレージテンプレート');

    // テンプレート作成
    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(templateName);
    await appPage.saveTemplate();
    await delay(1000);

    // ローカルストレージにテンプレート情報が保存されていることを確認
    const templatesJson = await appPage.getLocalStorageItem('templates');
    expect(templatesJson).toBeTruthy();

    if (templatesJson) {
      const templates: Template[] = JSON.parse(templatesJson);
      const createdTemplate = templates.find((t) => t.name === templateName);
      expect(createdTemplate).toBeDefined();
      expect(createdTemplate?.name).toBe(templateName);
    }
  });

  // TE-01-006: テンプレート情報の完全性確認
  test('TE-01-006: should maintain complete template information', async () => {
    const templateName = generateTemplateName('完全性テンプレート');

    // テンプレート作成
    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(templateName);
    await appPage.saveTemplate();
    await delay(1000);

    // ローカルストレージから取得
    const templatesJson = await appPage.getLocalStorageItem('templates');
    expect(templatesJson).toBeTruthy();

    if (templatesJson) {
      const templates: Template[] = JSON.parse(templatesJson);
      const template = templates.find((t) => t.name === templateName);

      // テンプレートが必須フィールドを持つことを確認
      expect(template).toBeDefined();
      expect(template?.id).toBeDefined();
      expect(template?.name).toBe(templateName);
      expect(template?.createdAt).toBeDefined();
      expect(Array.isArray(template?.regions)).toBe(true);
    }
  });
});
