// 對應文章：Day 08 — Soft Assertions：不中斷的斷言魔法

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const PAGE_URL = `${BASE_URL}/pages/assertions-demo.html`;

test.describe('Day 08：Soft Assertions — 不中斷的斷言魔法', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  // --- expect.soft() 基本用法 ---

  test('expect.soft() — 多個斷言全部執行完再報錯', async ({ page }) => {
    // 一般 expect() 若失敗會立刻中斷測試
    // expect.soft() 失敗後仍會繼續執行後續斷言，最後一次報告所有失敗
    expect.soft(await page.title()).toBe('Day 07: 斷言示範');
    await expect.soft(page.locator('#visible-item')).toBeVisible();
    await expect.soft(page.locator('#enabled-btn')).toBeEnabled();
    await expect.soft(page.locator('#disabled-btn')).toBeDisabled();
    await expect.soft(page.locator('#checked-box')).toBeChecked();
  });

  test('expect.soft() — 驗證多個文字斷言', async ({ page }) => {
    // 一次驗證頁面上多個文字元素，不因單一失敗中斷
    await expect.soft(page.locator('#exact-text')).toHaveText('Playwright 測試框架');
    await expect.soft(page.locator('#partial-text')).toContainText('Playwright');
    await expect.soft(page.locator('#value-input')).toHaveValue('預設文字內容');
    await expect.soft(page.locator('#number-input')).toHaveValue('42');
  });

  test('expect.soft() — 驗證元素屬性群', async ({ page }) => {
    // 批次驗證連結的多個屬性
    const link = page.locator('#link-with-href');
    await expect.soft(link).toBeVisible();
    await expect.soft(link).toHaveAttribute('href', 'https://playwright.dev');
    await expect.soft(link).toHaveAttribute('target', '_blank');
  });

  test('expect.soft() — 混合驗證可見性與狀態', async ({ page }) => {
    // 同時驗證可見性與啟用狀態
    await expect.soft(page.locator('#enabled-btn')).toBeVisible();
    await expect.soft(page.locator('#enabled-btn')).toBeEnabled();
    await expect.soft(page.locator('#disabled-btn')).toBeVisible();
    await expect.soft(page.locator('#disabled-btn')).toBeDisabled();
    await expect.soft(page.locator('#hidden-item')).toBeHidden();
  });

  test('expect.soft() — 驗證 class 與計數', async ({ page }) => {
    // 批次驗證 class 與元素數量
    await expect.soft(page.locator('#class-item')).toHaveClass(/active/);
    await expect.soft(page.locator('#class-item')).toHaveClass(/badge/);
    await expect.soft(page.locator('#warning-item')).toHaveClass(/warning/);
    await expect.soft(page.locator('.list-item')).toHaveCount(3);
  });

  test('expect.soft() — 驗證頁面層級資訊', async ({ page }) => {
    // 批次驗證頁面 URL 和標題
    await expect.soft(page).toHaveURL(/assertions-demo/);
    await expect.soft(page).toHaveTitle('Day 07: 斷言示範');
  });

  // --- 一般 expect 與 soft 並用 ---

  test('混合 expect() 與 expect.soft() — 先確保關鍵元素存在', async ({ page }) => {
    // 先用一般 expect 確認頁面有載入（若失敗就不必繼續）
    await expect(page.locator('h1')).toBeVisible();

    // 再用 expect.soft 批次驗證其餘細節
    await expect.soft(page.locator('#visible-item')).toBeVisible();
    await expect.soft(page.locator('#enabled-btn')).toBeEnabled();
    await expect.soft(page.locator('#disabled-btn')).toBeDisabled();
    await expect.soft(page.locator('.list-item')).toHaveCount(3);
  });

  test('expect.soft() — 驗證 checkbox 狀態群', async ({ page }) => {
    // 批次驗證所有 checkbox 狀態
    await expect.soft(page.locator('#checked-box')).toBeChecked();
    await expect.soft(page.locator('#unchecked-box')).not.toBeChecked();
  });

});
