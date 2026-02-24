// 對應文章：Day 02 — 跨瀏覽器測試：Playwright vs Cypress vs Selenium

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 02：跨瀏覽器測試 — Playwright 原生跨瀏覽器能力', () => {

  test('場景 1: 登入頁基本結構 — 跨瀏覽器', async ({ page, browserName }) => {
    // 在 test.info() 中記錄目前瀏覽器名稱
    test.info().annotations.push({
      type: '瀏覽器',
      description: `目前執行於：${browserName}`,
    });
    console.log(`[${browserName}] 正在測試登入頁基本結構`);

    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 各瀏覽器都應能正確顯示登入表單
    await expect(page.locator('h1')).toContainText('表單登入驗證');
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();

    console.log(`[${browserName}] 登入頁基本結構驗證通過`);
  });

  test('場景 2: 表單輸入 — 跨瀏覽器', async ({ page, browserName }) => {
    // 記錄瀏覽器資訊
    test.info().annotations.push({
      type: '瀏覽器',
      description: `目前執行於：${browserName}`,
    });
    console.log(`[${browserName}] 正在測試表單輸入功能`);

    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 各瀏覽器都應能正常填寫表單
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');

    // 驗證輸入值在各瀏覽器中都能正確讀取
    await expect(page.locator('#username')).toHaveValue('testuser');
    await expect(page.locator('#password')).toHaveValue('Test@1234');

    console.log(`[${browserName}] 表單輸入驗證通過`);
  });

  test('場景 3: 頁面導覽 — 跨瀏覽器', async ({ page, browserName }) => {
    test.info().annotations.push({
      type: '瀏覽器',
      description: `目前執行於：${browserName}`,
    });
    console.log(`[${browserName}] 正在測試頁面導覽`);

    await page.goto(BASE_URL);

    // 驗證首頁在各瀏覽器都能正常載入
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');

    // 點擊導覽列中的登入頁連結
    await page.locator('nav a[href="pages/form-auth.html"]').click();

    // 驗證已成功導覽到登入頁
    await expect(page).toHaveURL(/form-auth/);
    await expect(page.locator('h1')).toContainText('表單登入驗證');

    console.log(`[${browserName}] 頁面導覽驗證通過`);
  });

  test('場景 4: JavaScript 互動 — 跨瀏覽器', async ({ page, browserName }) => {
    test.info().annotations.push({
      type: '瀏覽器',
      description: `目前執行於：${browserName}`,
    });
    console.log(`[${browserName}] 正在測試 JavaScript 互動`);

    await page.goto(`${BASE_URL}/pages/actions-demo.html`);

    // 各瀏覽器都應能執行 JavaScript 互動（點擊按鈕計數）
    const clickCount = page.locator('#click-count');
    await expect(clickCount).toHaveText('0');

    await page.locator('#click-btn').click();
    await expect(clickCount).toHaveText('1');

    await page.locator('#click-btn').click();
    await expect(clickCount).toHaveText('2');

    console.log(`[${browserName}] JavaScript 互動驗證通過`);
  });

});
