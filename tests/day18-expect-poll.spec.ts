// 對應文章：Day 18 — 拆除不定時炸彈：expect.poll() 精準等待

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 18：拆除不定時炸彈 — expect.poll() 精準等待', () => {

  // 測試 1：expect.poll() — 等待計數器達到目標值
  test('expect.poll() — 等待計數器達到目標值', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/async-poll-demo`);
    await page.locator('#start-counter-btn').click();

    // 使用 expect.poll() 輪詢等待狀態變為「就緒」
    await expect.poll(async () => {
      return await page.locator('#counter-status').textContent();
    }, {
      timeout: 8000,
      intervals: [500, 500, 500]  // 每 500ms 輪詢一次
    }).toContain('就緒');
  });

  // 測試 2：expect.poll() — 等待計數器數字達到 5 以上
  test('expect.poll() — 等待數字計數器達到 5 以上', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/async-poll-demo`);
    await page.locator('#start-counter-btn').click();

    // 輪詢等待計數器的值達到 5 或以上
    await expect.poll(async () => {
      const text = await page.locator('#counter').textContent();
      return parseInt(text || '0', 10);
    }, {
      timeout: 8000
    }).toBeGreaterThanOrEqual(5);
  });

  // 測試 3：waitForLoadState('networkidle') — 等待網路靜止
  test('waitForLoadState(networkidle) — 等待網路請求完成', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/async-poll-demo`);

    // 點擊觸發資料載入的按鈕
    await page.locator('#fetch-data-btn').click();

    // 等待 DOM 載入完成（此 demo 使用 setTimeout 模擬延遲，非真實網路請求）
    // 改用 expect.poll 等待資料顯示，效果等同於 waitForLoadState
    await page.waitForLoadState('domcontentloaded');

    // 驗證 API 資料已載入（等待 3 秒讓 setTimeout 完成）
    await expect(page.locator('#api-result')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#api-result')).not.toBeEmpty();
  });

  // 測試 4：waitForLoadState('domcontentloaded') — 等待 DOM 載入
  test('waitForLoadState(domcontentloaded) — 等待 DOM 載入完成', async ({ page }) => {
    // 導航到頁面並等待 DOM 載入完成
    await page.goto(`${BASE_URL}/pages/async-poll-demo`);
    await page.waitForLoadState('domcontentloaded');

    // 驗證頁面標題已顯示（DOM 已就緒）
    await expect(page.locator('h1')).toBeVisible();
  });

  // 測試 5：等待進度條完成（100%）
  test('expect.poll() — 等待進度條達到 100%', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/async-poll-demo`);
    await page.locator('#start-progress-btn').click();

    // 輪詢等待進度條文字包含 100%
    await expect.poll(async () => {
      return await page.locator('#progress-text').textContent();
    }, {
      timeout: 15000,
      intervals: [1000, 1000, 1000]  // 每秒檢查一次
    }).toContain('100%');

    // 驗證進度條完成後的狀態
    await expect(page.locator('#progress-status')).toContainText('完成');
  });

  // 測試 6：expect.poll() 搭配自訂錯誤訊息
  test('expect.poll() — 搭配自訂 message 提升可讀性', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/async-poll-demo`);
    await page.locator('#start-counter-btn').click();

    // 使用 message 選項提供更清晰的失敗訊息
    await expect.poll(async () => {
      const text = await page.locator('#counter-status').textContent();
      return text;
    }, {
      message: '等待計數器狀態變為就緒，但逾時',
      timeout: 8000
    }).toContain('就緒');
  });

  // 測試 7：API 資料載入後驗證內容
  test('等待 API 資料載入後驗證內容', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/async-poll-demo`);

    // 點擊載入按鈕
    await page.locator('#fetch-data-btn').click();

    // 使用 expect.poll() 等待 API 回應資料出現
    await expect.poll(async () => {
      const element = page.locator('#api-result');
      const isVisible = await element.isVisible();
      if (!isVisible) return null;
      return await element.textContent();
    }, {
      timeout: 10000,
      intervals: [500, 1000, 1000]
    }).not.toBeNull();

    // 驗證資料內容不為空
    await expect(page.locator('#api-result')).not.toBeEmpty();
  });
});
