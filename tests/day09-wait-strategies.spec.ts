// 對應文章：Day 09 — 等待的藝術：智慧等待策略

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 09：等待的藝術 — 智慧等待策略', () => {

  // --- waitForSelector ---

  test('waitForSelector() — 等待動態內容出現', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);

    // 點擊開始載入按鈕（觸發 3 秒動態載入）
    await page.locator('#startBtn').click();

    // 使用 waitForSelector 等待內容顯示（最長 10 秒）
    await page.waitForSelector('#content.show', { timeout: 10000 });

    // 驗證動態內容已出現
    await expect(page.locator('#content')).toBeVisible();
    await expect(page.locator('#content h2')).toContainText('Hello World');
  });

  test('waitForSelector() — 等待 loading 消失', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);

    // 點擊開始載入
    await page.locator('#startBtn').click();

    // 等待 loading 指示器消失
    await page.waitForSelector('#loading.show', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('#loading.show', { state: 'hidden', timeout: 10000 });

    // 確認內容已載入
    await expect(page.locator('#content')).toBeVisible();
  });

  // --- waitForLoadState ---

  test('waitForLoadState("load") — 等待頁面 load 事件', async ({ page }) => {
    // 訪問頁面時 Playwright 預設等到 load，這裡展示明確指定
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');

    // 頁面完全載入後驗證內容
    await expect(page.locator('header h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('waitForLoadState("domcontentloaded") — 等待 DOM 解析完成', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    // DOM 已解析，可以查詢元素
    const links = page.locator('nav .nav-list a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('waitForLoadState("networkidle") — 等待網路靜止', async ({ page }) => {
    // networkidle 等待所有網路請求都結束（適合 SPA）
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // 網路靜止後驗證頁面
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
  });

  // --- waitForURL ---

  test('waitForURL() — 等待 URL 變更', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 填入登入資訊並送出
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');
    await page.locator('button[type="submit"]').click();

    // 等待 URL 變更到 secure 頁面
    await page.waitForURL(/secure/, { timeout: 5000 });

    // 驗證已跳轉
    await expect(page).toHaveURL(/secure/);
  });

  // --- waitForFunction ---

  test('waitForFunction() — 等待自訂 JavaScript 條件', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);

    // 點擊開始載入
    await page.locator('#startBtn').click();

    // 等待 #content 的 class 包含 'show'
    await page.waitForFunction(
      () => document.querySelector('#content')?.classList.contains('show'),
      { timeout: 10000 }
    );

    // 驗證條件成立
    const hasShow = await page.locator('#content').evaluate(
      el => el.classList.contains('show')
    );
    expect(hasShow).toBe(true);
  });

  // --- auto-waiting ---

  test('Playwright 自動等待 — click() 前自動等待可點擊', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);

    // Playwright 的 click() 會自動等待元素可見且可點擊
    // 不需要手動 waitForSelector
    await page.locator('#startBtn').click();

    // 自動等待 #content 可見（toBeVisible 內建等待）
    await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });
  });

  test('Playwright 自動等待 — fill() 前自動等待可輸入', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // fill() 會自動等待 input 可見且可互動
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');

    await expect(page.locator('#username')).toHaveValue('testuser');
    await expect(page.locator('#password')).toHaveValue('Test@1234');
  });

});
