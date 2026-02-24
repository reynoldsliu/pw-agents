// 對應文章：Day 11 — 等待動態魔物：非同步內容處理

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const PAGE_URL = `${BASE_URL}/pages/dynamic-loading.html`;

test.describe('Day 11：等待動態魔物 — 非同步內容處理', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  // --- 基本動態載入流程 ---

  test('動態載入 — 點擊後等待內容出現', async ({ page }) => {
    // 確認初始狀態：按鈕存在，內容隱藏
    await expect(page.locator('#startBtn')).toBeVisible();
    await expect(page.locator('#content')).toBeHidden();

    // 點擊觸發載入
    await page.locator('#startBtn').click();

    // 等待 loading 指示器出現
    await expect(page.locator('#loading')).toBeVisible({ timeout: 2000 });

    // 等待動態內容出現（3 秒後）
    await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });

    // 驗證內容正確
    await expect(page.locator('#content h2')).toContainText('Hello World');
    await expect(page.locator('#content p')).toContainText('動態內容已成功載入');
  });

  test('動態載入 — loading 指示器在載入後消失', async ({ page }) => {
    await page.locator('#startBtn').click();

    // 等待 loading 出現
    await expect(page.locator('#loading')).toBeVisible({ timeout: 2000 });

    // 等待 loading 消失
    await expect(page.locator('#loading')).toBeHidden({ timeout: 10000 });

    // 確認內容已出現
    await expect(page.locator('#content')).toBeVisible();
  });

  test('動態載入 — 按鈕點擊後消失', async ({ page }) => {
    // 點擊前按鈕可見
    await expect(page.locator('#startBtn')).toBeVisible();

    // 點擊後按鈕隱藏
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toBeHidden();
  });

  // --- waitForSelector 精確控制 ---

  test('waitForSelector() — 等待元素進入可見狀態', async ({ page }) => {
    await page.locator('#startBtn').click();

    // waitForSelector 搭配 state: 'visible'
    const content = await page.waitForSelector('#content', {
      state: 'visible',
      timeout: 10000
    });

    expect(content).not.toBeNull();
    const text = await content.textContent();
    expect(text).toContain('Hello World');
  });

  test('waitForSelector() — 等待元素進入 DOM', async ({ page }) => {
    // 等待元素存在於 DOM（不論是否可見）
    const loadingEl = await page.waitForSelector('#loading', {
      state: 'attached',
      timeout: 5000
    });

    expect(loadingEl).not.toBeNull();
  });

  // --- waitForFunction 條件等待 ---

  test('waitForFunction() — 等待文字內容更新', async ({ page }) => {
    await page.locator('#startBtn').click();

    // 等待 h2 內容包含 'Hello World'
    await page.waitForFunction(
      () => {
        const h2 = document.querySelector('#content h2');
        return h2 && h2.textContent?.includes('Hello World');
      },
      { timeout: 10000 }
    );

    await expect(page.locator('#content h2')).toContainText('Hello World');
  });

  // --- evaluate 直接操作 DOM ---

  test('evaluate() — 直接讀取 DOM 狀態', async ({ page }) => {
    // 使用 evaluate 在瀏覽器環境執行 JavaScript
    const isButtonVisible = await page.evaluate(
      () => {
        const btn = document.getElementById('startBtn');
        return btn ? getComputedStyle(btn).display !== 'none' : false;
      }
    );

    expect(isButtonVisible).toBe(true);
  });

  test('evaluate() — 點擊後確認 DOM 變化', async ({ page }) => {
    await page.locator('#startBtn').click();

    // 使用 evaluate 等待並確認 class 變化
    await page.waitForFunction(
      () => document.getElementById('content')?.classList.contains('show')
        || document.getElementById('loading')?.classList.contains('show'),
      { timeout: 5000 }
    );

    // 確認 loading 或 content 已啟動
    const loadingVisible = await page.locator('#loading').isVisible();
    const contentVisible = await page.locator('#content').isVisible();
    expect(loadingVisible || contentVisible).toBe(true);
  });

  // --- 重試機制 ---

  test('內建重試 — toBeVisible 自動重試直到超時', async ({ page }) => {
    await page.locator('#startBtn').click();

    // Playwright 的 expect() 會持續輪詢直到條件成立或超時
    // 這裡設定 10 秒超時，等待動態內容出現
    await expect(page.locator('#content h2')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#content h2')).toHaveText('🎉 Hello World!');
  });

  test('💥 [錯誤示範] timeout 不足 — 動態載入需 3 秒但只等 1 秒', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.locator('#startBtn').click();
    // 錯誤：載入需 3000ms，但 timeout 僅設 1000ms，提前逾時失敗
    await expect(page.locator('#content')).toBeVisible({ timeout: 1000 });
  });

});
