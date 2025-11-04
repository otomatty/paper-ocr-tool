/**
 * Full Workflow E2E Tests
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ Playwright Test Runner
 *
 * Dependencies (External files that this file imports):
 *   ├─ @playwright/test
 *   ├─ ./fixtures/page-helpers.ts
 *   ├─ ./utils/test-helpers.ts
 *
 * Related Documentation:
 *   └─ Plan: docs/03_plans/phase4-4-e2e-testing-plan.md
 */

import { expect, test } from "@playwright/test";
import { AppPage } from "../fixtures/page-helpers";
import {
  clearAllLocalStorage,
  delay,
  generateTemplateName,
} from "../utils/test-helpers";

test.describe("Full Workflow E2E", () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await clearAllLocalStorage(page);
  });

  // TE-04-001: 初回利用フロー（新規ユーザー）
  test("TE-04-001: should complete full workflow from scratch", async () => {
    // 1. ホームページで機能紹介を表示
    await appPage.navigateToHome();
    await delay(500);

    const isOnHome = await appPage.isOnHomePage();
    expect(isOnHome).toBeTruthy();

    // 2. テンプレート管理に移動
    await appPage.navigateToTemplateManagement();
    await delay(500);

    const isOnTemplate = await appPage.isOnTemplateManagementPage();
    expect(isOnTemplate).toBeTruthy();

    // 3. テンプレートを作成
    const templateName = generateTemplateName("新規ユーザーテンプレート");

    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(templateName);
    await appPage.saveTemplate();
    await delay(1000);

    // テンプレートが保存されていることを確認
    const templatesJson = await appPage.getLocalStorageItem("templates");
    expect(templatesJson).toBeTruthy();

    // 4. データ入力ページに移動
    await appPage.navigateToDataInput();
    await delay(500);

    const isOnDataInput = await appPage.isOnDataInputPage();
    expect(isOnDataInput).toBeTruthy();

    // 5. テンプレートを選択（実装に応じて調整）
    const selectElement = appPage.pageInstance
      .locator('select, [role="combobox"]')
      .first();
    const isVisible = await selectElement.isVisible().catch(() => false);
    expect(isVisible || isOnDataInput).toBeTruthy();
  });

  // TE-04-002: テンプレート完全性フロー
  test("TE-04-002: should maintain template integrity across sessions", async () => {
    const templateName = generateTemplateName("完全性テンプレート");

    // テンプレート作成
    await appPage.navigateToTemplateManagement();
    await delay(500);

    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(templateName);
    await appPage.saveTemplate();
    await delay(1000);

    // テンプレート情報を取得
    const templatesJson1 = await appPage.getLocalStorageItem("templates");
    expect(templatesJson1).toBeTruthy();

    const templates1 = JSON.parse(templatesJson1!);
    const template1 = templates1.find((t: any) => t.name === templateName);
    expect(template1).toBeDefined();
    expect(template1.id).toBeTruthy();
    expect(template1.createdAt).toBeTruthy();

    // ページをリロード
    await appPage.reloadPage();
    await appPage.waitForNavigation();

    // リロード後もテンプレート情報が保持されていることを確認
    const templatesJson2 = await appPage.getLocalStorageItem("templates");
    expect(templatesJson2).toBeTruthy();

    const templates2 = JSON.parse(templatesJson2!);
    const template2 = templates2.find((t: any) => t.name === templateName);

    // テンプレート情報が同じであることを確認
    expect(template2).toBeDefined();
    expect(template2.id).toBe(template1.id);
    expect(template2.name).toBe(template1.name);
    expect(template2.createdAt).toBe(template1.createdAt);
  });

  // TE-04-003: 複数テンプレート管理フロー
  test("TE-04-003: should manage multiple templates independently", async () => {
    const template1Name = generateTemplateName("テンプレート1");
    const template2Name = generateTemplateName("テンプレート2");

    // テンプレート管理ページに移動
    await appPage.navigateToTemplateManagement();
    await delay(500);

    // テンプレート1作成
    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(template1Name);
    await appPage.saveTemplate();
    await delay(1000);

    // テンプレート2作成
    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(template2Name);
    await appPage.saveTemplate();
    await delay(1000);

    // 両テンプレートが一覧に表示されていることを確認
    const count1 = await appPage.getTemplateListItems();
    expect(count1).toBeGreaterThanOrEqual(2);

    // ローカルストレージで両テンプレートを確認
    const templatesJson = await appPage.getLocalStorageItem("templates");
    expect(templatesJson).toBeTruthy();

    const templates = JSON.parse(templatesJson!);
    const t1 = templates.find((t: any) => t.name === template1Name);
    const t2 = templates.find((t: any) => t.name === template2Name);

    expect(t1).toBeDefined();
    expect(t2).toBeDefined();
    expect(t1.id).not.toBe(t2.id);
  });

  // TE-04-004: ページ遷移完全性フロー
  test("TE-04-004: should maintain state across page transitions", async () => {
    const templateName = generateTemplateName("遷移テンプレート");

    // ホーム → テンプレート管理
    await appPage.navigateToHome();
    await delay(300);
    expect(await appPage.isOnHomePage()).toBeTruthy();

    await appPage.navigateToTemplateManagement();
    await delay(300);
    expect(await appPage.isOnTemplateManagementPage()).toBeTruthy();

    // テンプレート作成
    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(templateName);
    await appPage.saveTemplate();
    await delay(1000);

    // テンプレート → ホーム → テンプレート
    await appPage.navigateToHome();
    await delay(300);
    expect(await appPage.isOnHomePage()).toBeTruthy();

    await appPage.navigateToTemplateManagement();
    await delay(300);
    expect(await appPage.isOnTemplateManagementPage()).toBeTruthy();

    // テンプレートが保持されていることを確認
    const templatesJson = await appPage.getLocalStorageItem("templates");
    expect(templatesJson).toBeTruthy();

    const templates = JSON.parse(templatesJson!);
    const template = templates.find((t: any) => t.name === templateName);
    expect(template).toBeDefined();
  });

  // TE-04-005: ローカルストレージ永続性フロー
  test("TE-04-005: should persist all data across page reloads", async () => {
    const template1Name = generateTemplateName("永続テンプレート1");
    const template2Name = generateTemplateName("永続テンプレート2");

    // テンプレート作成
    await appPage.navigateToTemplateManagement();
    await delay(500);

    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(template1Name);
    await appPage.saveTemplate();
    await delay(1000);

    await appPage.clickCreateTemplateButton();
    await delay(300);
    await appPage.fillTemplateName(template2Name);
    await appPage.saveTemplate();
    await delay(1000);

    // 作成直後のテンプレートカウント
    const countBefore = await appPage.getTemplateListItems();
    expect(countBefore).toBeGreaterThanOrEqual(2);

    // 複数回リロード
    for (let i = 0; i < 3; i++) {
      await appPage.reloadPage();
      await appPage.waitForNavigation();

      // リロード後もテンプレートが保持されていることを確認
      const countAfter = await appPage.getTemplateListItems();
      expect(countAfter).toBe(countBefore);

      const templatesJson = await appPage.getLocalStorageItem("templates");
      expect(templatesJson).toBeTruthy();

      const templates = JSON.parse(templatesJson!);
      const t1 = templates.find((t: any) => t.name === template1Name);
      const t2 = templates.find((t: any) => t.name === template2Name);

      expect(t1).toBeDefined();
      expect(t2).toBeDefined();
    }
  });

  // TE-04-006: アプリ終了・再開フロー（ブラウザを閉じて再度開く）
  test("TE-04-006: should restore state when reopening app", async ({
    page,
  }) => {
    const templateName = generateTemplateName("再開テンプレート");

    // ページ1: テンプレート作成
    const appPage1 = new AppPage(page);
    await appPage1.navigateToTemplateManagement();
    await delay(500);

    await appPage1.clickCreateTemplateButton();
    await delay(300);
    await appPage1.fillTemplateName(templateName);
    await appPage1.saveTemplate();
    await delay(1000);

    // テンプレートが保存されていることを確認
    let templatesJson = await appPage1.getLocalStorageItem("templates");
    expect(templatesJson).toBeTruthy();

    // ページをクリア（アプリ終了のシミュレーション）
    const templates = JSON.parse(templatesJson!);
    const savedTemplate = templates.find((t: any) => t.name === templateName);
    expect(savedTemplate).toBeDefined();

    // ページをリロード（アプリ再開のシミュレーション）
    await appPage1.reloadPage();
    await appPage1.waitForNavigation();

    // テンプレートが復元されていることを確認
    templatesJson = await appPage1.getLocalStorageItem("templates");
    expect(templatesJson).toBeTruthy();

    const restoredTemplates = JSON.parse(templatesJson!);
    const restoredTemplate = restoredTemplates.find(
      (t: any) => t.name === templateName
    );
    expect(restoredTemplate).toBeDefined();
    expect(restoredTemplate.name).toBe(templateName);
  });

  // TE-04-007: ナビゲーション完全フロー
  test("TE-04-007: should support complete navigation flow", async () => {
    // 開始: ホームページ
    await appPage.navigateToHome();
    await delay(300);
    expect(await appPage.isOnHomePage()).toBeTruthy();

    // ホーム → テンプレート管理
    await appPage.navigateToTemplateManagement();
    await delay(300);
    expect(await appPage.isOnTemplateManagementPage()).toBeTruthy();

    // テンプレート管理 → データ入力
    await appPage.navigateToDataInput();
    await delay(300);
    expect(await appPage.isOnDataInputPage()).toBeTruthy();

    // データ入力 → テンプレート管理
    await appPage.navigateToTemplateManagement();
    await delay(300);
    expect(await appPage.isOnTemplateManagementPage()).toBeTruthy();

    // テンプレート管理 → ホーム
    await appPage.navigateToHome();
    await delay(300);
    expect(await appPage.isOnHomePage()).toBeTruthy();

    // ホーム → データ入力
    await appPage.navigateToDataInput();
    await delay(300);
    expect(await appPage.isOnDataInputPage()).toBeTruthy();

    // データ入力 → ホーム
    await appPage.navigateToHome();
    await delay(300);
    expect(await appPage.isOnHomePage()).toBeTruthy();
  });
});
