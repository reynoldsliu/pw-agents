// 對應文章：Day 26 — 分身術：平行測試與 Worker

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

// =====================================================
// test.describe.parallel() — 強制讓 describe 區塊內的測試並行執行
// =====================================================
test.describe.parallel('Day 26：分身術 — 平行測試（並行執行區塊）', () => {

  // 這些測試在同一個 describe 區塊內，會並行執行
  // 每個測試有獨立的 page（因為 Playwright 預設 test-level 隔離）

  test('Worker 1 — 首頁標題', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
  });

  test('Worker 2 — 登入頁面', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await expect(page).toHaveTitle('場景 1: 表單登入驗證');
  });

  test('Worker 3 — 動態載入頁面', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);
    await expect(page.locator('#startBtn')).toBeVisible();
  });

  test('Worker 4 — 表格頁面', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/table-demo.html`);
    await expect(page.locator('#user-table')).toBeVisible();
  });

  test('Worker 5 — 複雜 DOM 頁面', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/complex-dom.html`);
    await expect(page.locator('.product-grid')).toBeVisible();
  });

  test('💥 [錯誤示範] 並行執行中斷言不存在的導覽文字', async ({ page }) => {
    await page.goto(BASE_URL);
    // 錯誤：導覽列沒有此文字，並行執行時同樣會失敗並捕獲截圖/錄影
    await expect(page.getByText('不存在的導覽項目')).toBeVisible({ timeout: 3000 });
  });

});

// =====================================================
// 一般測試（序列或並行，由配置決定）
// =====================================================
test.describe('Day 26：分身術 — 並行設定說明', () => {

  test.describe.configure({ mode: 'parallel' });

  test('parallel mode — 測試 A（第一個）', async ({ page }) => {
    await page.goto(BASE_URL);
    const links = page.locator('nav .nav-list a');
    expect(await links.count()).toBeGreaterThan(0);
  });

  test('parallel mode — 測試 B（第二個）', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/assertions-demo.html`);
    await expect(page.locator('#visible-item')).toBeVisible();
  });

  test('parallel mode — 測試 C（第三個）', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/locators-demo.html`);
    await expect(page.getByRole('button', { name: 'GO！' })).toBeVisible();
  });

});

// =====================================================
// 序列測試（一個接一個執行）
// =====================================================
test.describe('Day 26：分身術 — 序列測試', () => {

  test.describe.configure({ mode: 'serial' });

  // serial 模式下，若一個測試失敗，後續測試會被跳過
  test('序列 1 — 首頁基本驗證', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('header')).toBeVisible();
  });

  test('序列 2 — 導覽到登入頁', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('nav a').first().click();
    // 等待頁面轉換
    await page.waitForLoadState('load');
  });

  test('序列 3 — 登入頁存在', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await expect(page.locator('#username')).toBeVisible();
  });

});

// =====================================================
// test.skip / test.only / test.fixme 控制執行
// =====================================================
test.describe('Day 26：測試執行控制', () => {

  test('正常測試 — 應該執行', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
  });

  test.skip('skip — 此測試被跳過', async ({ page }) => {
    // test.skip() 標記此測試為跳過（不執行）
    await page.goto(BASE_URL);
  });

  test.fixme('fixme — 此測試已知有問題待修', async ({ page }) => {
    // test.fixme() 標記此測試為待修，會跳過執行
    await page.goto(BASE_URL);
  });

  // 條件式跳過
  test('條件跳過 — CI 環境中跳過', async ({ page }) => {
    test.skip(!!process.env.CI, 'CI 環境中跳過此測試');

    await page.goto(BASE_URL);
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
  });

  // 預期失敗（fail）
  test.fail('fail — 此測試預期會失敗', async ({ page }) => {
    await page.goto(BASE_URL);
    // 故意斷言錯誤的標題，因為用了 test.fail()，測試會被標記為「預期失敗 ✓」
    await expect(page).toHaveTitle('錯誤的標題');
  });

});
