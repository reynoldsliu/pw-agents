// 對應文章：Day 23 — 鑑定師的眼睛：截圖與視覺比對

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 23：鑑定師的眼睛 — 截圖與視覺比對', () => {

  // 確保截圖輸出目錄存在
  test.beforeAll(async () => {
    const dir = path.join(process.cwd(), 'test-results', 'screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // --- page.screenshot() ---

  test('page.screenshot() — 全頁截圖', async ({ page }) => {
    await page.goto(BASE_URL);

    // 截取整個頁面（含滾動範圍）
    const screenshot = await page.screenshot({ fullPage: true });

    // 確認截圖是 Buffer 且有內容
    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('page.screenshot() — 截圖存檔', async ({ page }) => {
    await page.goto(BASE_URL);

    const screenshotPath = path.join(process.cwd(), 'test-results', 'screenshots', 'homepage.png');

    // 截圖並儲存到檔案
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // 確認檔案已建立
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });

  test('page.screenshot() — 只截取視窗範圍（非 fullPage）', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/assertions-demo.html`);

    // 預設截取目前視窗範圍
    const screenshot = await page.screenshot();
    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('page.screenshot() — 截圖並指定品質（JPEG）', async ({ page }) => {
    await page.goto(BASE_URL);

    const jpegPath = path.join(process.cwd(), 'test-results', 'screenshots', 'homepage.jpeg');
    await page.screenshot({ path: jpegPath, type: 'jpeg', quality: 80 });

    expect(fs.existsSync(jpegPath)).toBe(true);
  });

  // --- locator.screenshot() ---

  test('locator.screenshot() — 截取特定元素', async ({ page }) => {
    await page.goto(BASE_URL);

    // 只截取 header 元素
    const header = page.locator('header');
    const screenshot = await header.screenshot();

    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('locator.screenshot() — 截取導覽列', async ({ page }) => {
    await page.goto(BASE_URL);

    const navPath = path.join(process.cwd(), 'test-results', 'screenshots', 'nav.png');
    await page.locator('nav').screenshot({ path: navPath });

    expect(fs.existsSync(navPath)).toBe(true);
  });

  test('locator.screenshot() — 截取表格', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/table-demo.html`);

    const screenshot = await page.locator('#user-table').screenshot();
    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot.length).toBeGreaterThan(0);
  });

  // --- 截圖搭配遮罩 ---

  test('page.screenshot() — 遮罩敏感資訊（mask）', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 填入密碼後截圖，遮罩密碼欄位
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');

    const screenshot = await page.screenshot({
      mask: [page.locator('#password')],
    });

    expect(screenshot).toBeInstanceOf(Buffer);
  });

  // --- 視覺回歸比對（toHaveScreenshot）---

  test('toHaveScreenshot() — 首頁視覺快照比對', async ({ page }) => {
    await page.goto(BASE_URL);

    // 第一次執行會建立基準快照（.png），之後比對差異
    // 使用 { maxDiffPixelRatio: 0.1 } 允許 10% 的差異
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixelRatio: 0.1,
      fullPage: true,
    });
  });

  test('toHaveScreenshot() — 元素視覺快照比對', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/table-demo.html`);

    await expect(page.locator('#user-table')).toHaveScreenshot('user-table.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  // --- clip 截取特定區域 ---

  test('page.screenshot() — clip 截取特定座標區域', async ({ page }) => {
    await page.goto(BASE_URL);

    // 截取頁面左上角 300x200 的區域
    const screenshot = await page.screenshot({
      clip: { x: 0, y: 0, width: 300, height: 200 },
    });

    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('💥 [錯誤示範] 修改頁面狀態後斷言元素數量仍為舊值', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/assertions-demo.html`);
    await page.locator('#add-item-btn').click(); // 新增第 4 個項目
    // 錯誤：點擊後有 4 個項目，但仍斷言 3 個（Playwright 會截圖顯示實際狀態）
    await expect(page.locator('.list-item')).toHaveCount(3);
  });

});
