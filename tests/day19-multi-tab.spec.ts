// 對應文章：Day 19 — 戰鬥場景轉換：多分頁/視窗處理

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 19：戰鬥場景轉換 — 多分頁/視窗處理', () => {

  // 測試 1：target="_blank" — 在新分頁開啟連結
  test('target="_blank" — 在新分頁開啟連結', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/pages/multi-tab-demo`);

    /**
     * Promise.all([waitForEvent, click]) 是多分頁的標準模式：
     * - `context.waitForEvent('page')` 必須在 click() 之前開始監聽，
     *   否則新分頁可能在監聽前就開啟，導致等待超時。
     * - 用 Promise.all 同時啟動兩者，確保監聽與觸發不會錯過彼此。
     */
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#new-tab-link').click()
    ]);

    // 等待新分頁載入完成
    await newPage.waitForLoadState();

    // 驗證新分頁的標題
    await expect(newPage).toHaveTitle('場景 1: 表單登入驗證');

    // 關閉新分頁
    await newPage.close();
  });

  // 測試 2：window.open() — 等待 popup 視窗
  test('window.open() — 等待 popup 視窗', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/multi-tab-demo`);

    /**
     * `page.waitForEvent('popup')` 監聽由 `window.open()` 觸發的彈出視窗。
     * 與 `context.waitForEvent('page')` 的差別：
     * - `context.waitForEvent('page')` 監聽整個 context 中任何新頁面（含 target="_blank"）
     * - `page.waitForEvent('popup')` 只監聽由此 page 觸發的 popup
     */
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('#open-popup-btn').click()
    ]);

    // 等待 popup 載入
    await popup.waitForLoadState();

    // 驗證 popup 的標題
    await expect(popup).toHaveTitle('Day 07: 斷言示範');

    // 關閉 popup
    await popup.close();
  });

  // 測試 3：context.pages() — 取得所有分頁
  test('context.pages() — 取得並操作所有分頁', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/pages/multi-tab-demo`);

    // 開啟新分頁
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#new-tab-link').click()
    ]);
    await newPage.waitForLoadState();

    // 使用 context.pages() 取得所有分頁
    const allPages = context.pages();

    // 驗證有兩個分頁
    expect(allPages.length).toBe(2);

    // 驗證第一個分頁是 multi-tab-demo
    await expect(allPages[0]).toHaveURL(`${BASE_URL}/pages/multi-tab-demo`);

    // 關閉新分頁後確認只剩一個分頁
    await newPage.close();
    expect(context.pages().length).toBe(1);
  });

  // 測試 4：在新分頁中執行操作後回到原分頁
  test('切換分頁 — 在新分頁操作後回到原分頁', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/pages/multi-tab-demo`);

    // 開啟新分頁
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#new-tab-link').click()
    ]);
    await newPage.waitForLoadState();

    // 在新分頁中進行操作（確認已到達目標頁面）
    await expect(newPage.locator('h1')).toBeVisible();

    // 回到原分頁繼續操作
    await page.bringToFront();
    await expect(page).toHaveURL(`${BASE_URL}/pages/multi-tab-demo`);

    // 原分頁仍然正常
    await expect(page.locator('h1')).toBeVisible();

    await newPage.close();
  });

  // 測試 5：同時開啟多個分頁並逐一驗證
  test('同時開啟多個分頁並逐一驗證', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/pages/multi-tab-demo`);

    // 等待第一個新分頁
    const [firstNewPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#new-tab-link').click()
    ]);
    await firstNewPage.waitForLoadState();

    // 確認已有兩個分頁
    expect(context.pages().length).toBe(2);

    // 驗證各分頁的 URL
    await expect(firstNewPage).toHaveURL(/.*form-auth.*/);

    // 關閉所有新分頁
    await firstNewPage.close();
  });

  // 測試 6：新分頁 waitForLoadState 等待不同載入狀態
  test('newPage.waitForLoadState() — 等待不同載入狀態', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/pages/multi-tab-demo`);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#new-tab-link').click()
    ]);

    // 等待 DOM 內容載入完成
    await newPage.waitForLoadState('domcontentloaded');

    // 驗證頁面已載入
    await expect(newPage.locator('body')).toBeVisible();

    // 繼續等待完整載入（包含所有資源）
    await newPage.waitForLoadState('load');

    // 驗證完整載入後頁面標題存在
    const title = await newPage.title();
    expect(title).toBeTruthy();

    await newPage.close();
  });

  test('💥 [錯誤示範] 新分頁標題斷言與實際不符', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/pages/multi-tab-demo.html`);
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#new-tab-link').click(),
    ]);
    await newPage.waitForLoadState();
    // 錯誤：新分頁實際標題是「場景 1: 表單登入驗證」，不是「Playwright 官方文件」
    await expect(newPage).toHaveTitle('Playwright 官方文件');
  });
});
