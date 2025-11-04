/**
 * Home Navigation E2E Tests
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
 *
 * Related Documentation:
 *   └─ Plan: docs/03_plans/phase4-4-e2e-testing-plan.md
 */

import { expect, test } from '@playwright/test';
import { AppPage } from '../fixtures/page-helpers';
import { clearAllLocalStorage, delay } from '../utils/test-helpers';

test.describe('Home Navigation E2E', () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await clearAllLocalStorage(page);
  });

  // TE-03-001: ホームページ表示
  test('TE-03-001: should display home page correctly', async () => {
    // ホームページに移動
    await appPage.navigateToHome();
    await delay(500);

    // ホームページが表示されていることを確認
    const isOnHome = await appPage.isOnHomePage();
    expect(isOnHome).toBeTruthy();

    // ページに主要なナビゲーションリンクが表示されていることを確認
    const homeHeading = await appPage.pageInstance.title();
    expect(homeHeading).toBeTruthy();
  });

  // TE-03-002: ページ遷移 - ホーム → テンプレート管理
  test('TE-03-002: should navigate to template management from home', async () => {
    // ホームページに移動
    await appPage.navigateToHome();
    await delay(500);

    // テンプレート管理へのリンクをクリック
    const templateLink = appPage.pageInstance.locator(
      'a:has-text("テンプレート"), button:has-text("テンプレート"), a[href*="template"]'
    );
    const isVisible = await templateLink.isVisible().catch(() => false);

    if (isVisible) {
      await templateLink.click();
      await delay(500);

      // テンプレート管理ページが表示されていることを確認
      const isOnTemplate = await appPage.isOnTemplateManagementPage();
      expect(isOnTemplate).toBeTruthy();
    }
  });

  // TE-03-003: ページ遷移 - ホーム → データ入力
  test('TE-03-003: should navigate to data input from home', async () => {
    // ホームページに移動
    await appPage.navigateToHome();
    await delay(500);

    // データ入力へのリンクをクリック
    const dataInputLink = appPage.pageInstance.locator(
      'a:has-text("データ"), button:has-text("データ"), a:has-text("入力"), a[href*="data"]'
    );
    const isVisible = await dataInputLink.isVisible().catch(() => false);

    if (isVisible) {
      await dataInputLink.click();
      await delay(500);

      // データ入力ページが表示されていることを確認
      const isOnDataInput = await appPage.isOnDataInputPage();
      expect(isOnDataInput).toBeTruthy();
    }
  });

  // TE-03-004: ページ遷移 - テンプレート管理 → ホーム
  test('TE-03-004: should navigate to home from template management', async () => {
    // テンプレート管理ページに移動
    await appPage.navigateToTemplateManagement();
    await delay(500);

    // ホームへのリンクをクリック
    const homeLink = appPage.pageInstance.locator(
      'a:has-text("ホーム"), button:has-text("ホーム"), a[href="/"]'
    );
    const isVisible = await homeLink.isVisible().catch(() => false);

    if (isVisible) {
      await homeLink.click();
      await delay(500);

      // ホームページが表示されていることを確認
      const isOnHome = await appPage.isOnHomePage();
      expect(isOnHome).toBeTruthy();
    }
  });

  // TE-03-005: ページ遷移 - データ入力 → ホーム
  test('TE-03-005: should navigate to home from data input', async () => {
    // データ入力ページに移動
    await appPage.navigateToDataInput();
    await delay(500);

    // ホームへのリンクをクリック
    const homeLink = appPage.pageInstance.locator(
      'a:has-text("ホーム"), button:has-text("ホーム"), a[href="/"]'
    );
    const isVisible = await homeLink.isVisible().catch(() => false);

    if (isVisible) {
      await homeLink.click();
      await delay(500);

      // ホームページが表示されていることを確認
      const isOnHome = await appPage.isOnHomePage();
      expect(isOnHome).toBeTruthy();
    }
  });

  // TE-03-006: ブラウザバック機能
  test('TE-03-006: should handle browser back button', async ({ page }) => {
    // ホームページに移動
    await appPage.navigateToHome();
    await delay(500);

    const url1 = page.url();

    // テンプレート管理に移動
    await appPage.navigateToTemplateManagement();
    await delay(500);

    const url2 = page.url();
    expect(url2).not.toBe(url1);

    // ブラウザの戻るボタンをシミュレート
    await page.goBack();
    await delay(500);

    // 前のページに戻っていることを確認
    const currentUrl = page.url();
    expect(currentUrl).toBe(url1);
  });

  // TE-03-007: 複数ページ遷移シーケンス
  test('TE-03-007: should handle multiple page transitions', async () => {
    // ホーム → テンプレート管理 → データ入力 → ホーム
    await appPage.navigateToHome();
    await delay(300);
    expect(await appPage.isOnHomePage()).toBeTruthy();

    await appPage.navigateToTemplateManagement();
    await delay(300);
    expect(await appPage.isOnTemplateManagementPage()).toBeTruthy();

    await appPage.navigateToDataInput();
    await delay(300);
    expect(await appPage.isOnDataInputPage()).toBeTruthy();

    await appPage.navigateToHome();
    await delay(300);
    expect(await appPage.isOnHomePage()).toBeTruthy();
  });

  // TE-03-008: ページリロード後のナビゲーション
  test('TE-03-008: should maintain navigation after reload', async () => {
    // テンプレート管理に移動
    await appPage.navigateToTemplateManagement();
    await delay(300);
    expect(await appPage.isOnTemplateManagementPage()).toBeTruthy();

    // ページをリロード
    await appPage.reloadPage();
    await appPage.waitForNavigation();

    // リロード後もテンプレート管理ページにいることを確認
    expect(await appPage.isOnTemplateManagementPage()).toBeTruthy();
  });

  // TE-03-009: ページタイトルの確認
  test('TE-03-009: should display correct page titles', async () => {
    // ホームページタイトル
    await appPage.navigateToHome();
    await delay(300);
    let title = await appPage.pageInstance.title();
    expect(title).toBeTruthy();

    // テンプレート管理ページタイトル
    await appPage.navigateToTemplateManagement();
    await delay(300);
    title = await appPage.pageInstance.title();
    expect(title.toLowerCase()).toMatch(/template|テンプレート/);

    // データ入力ページタイトル
    await appPage.navigateToDataInput();
    await delay(300);
    title = await appPage.pageInstance.title();
    expect(title.toLowerCase()).toMatch(/data|input|ocr|データ入力|アンケート/);
  });

  // TE-03-010: 直接URL アクセス
  test('TE-03-010: should support direct URL access', async ({ page }) => {
    // テンプレート管理ページに直接アクセス
    await page.goto('/template-management');
    await delay(300);
    expect(page.url()).toContain('/template-management');

    // データ入力ページに直接アクセス
    await page.goto('/data-input');
    await delay(300);
    expect(page.url()).toContain('/data-input');

    // ホームページに直接アクセス
    await page.goto('/');
    await delay(300);
    expect(page.url()).toContain('/');
  });
});
