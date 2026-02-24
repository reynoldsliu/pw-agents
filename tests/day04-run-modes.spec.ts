// 對應文章：Day 04 — 四種測試執行模式（CLI / Debug / UI / Extension）

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

/**
 * 四種執行模式說明：
 *
 * 1. CLI 模式：  npx playwright test day04-run-modes.spec.ts
 * 2. Debug 模式：npx playwright test day04-run-modes.spec.ts --debug
 * 3. UI 模式：   npx playwright test --ui
 * 4. Extension： 在 VS Code 安裝 Playwright Test for VSCode 後，直接點擊 run 按鈕
 *
 * 這個 spec 本身就是一個普通測試，適合用以上任何一種模式執行。
 */

test.describe('Day 04：四種測試執行模式', () => {

  test.describe('Mode 1 — CLI 模式：基本 smoke test', () => {

    test('首頁可正常訪問', async ({ page }) => {
      // CLI 模式：npx playwright test
      console.log('[CLI] 開始執行首頁 smoke test');

      await page.goto(BASE_URL);
      await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
      await expect(page.locator('header')).toBeVisible();

      console.log('[CLI] 首頁 smoke test 通過');
    });

    test('登入頁可正常訪問', async ({ page }) => {
      console.log('[CLI] 開始執行登入頁 smoke test');

      await page.goto(`${BASE_URL}/pages/form-auth.html`);
      await expect(page.locator('#loginForm')).toBeVisible();

      console.log('[CLI] 登入頁 smoke test 通過');
    });

    test('動態載入頁可正常訪問', async ({ page }) => {
      console.log('[CLI] 開始執行動態載入頁 smoke test');

      await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);
      await expect(page.locator('#startBtn')).toBeVisible();

      console.log('[CLI] 動態載入頁 smoke test 通過');
    });

  });

  test.describe('Mode 2 — Debug 模式：含詳細 console.log 的測試', () => {

    test('登入流程 debug 追蹤', async ({ page }) => {
      // Debug 模式：npx playwright test --debug
      // 加上 console.log 模擬每一步的 debug 輸出
      console.log('[DEBUG] Step 1: 訪問登入頁面');
      await page.goto(`${BASE_URL}/pages/form-auth.html`);

      console.log('[DEBUG] Step 2: 確認表單存在');
      await expect(page.locator('#loginForm')).toBeVisible();

      console.log('[DEBUG] Step 3: 填入使用者名稱');
      await page.locator('#username').fill('testuser');
      const usernameValue = await page.locator('#username').inputValue();
      console.log(`[DEBUG] username 輸入值：${usernameValue}`);

      console.log('[DEBUG] Step 4: 填入密碼');
      await page.locator('#password').fill('Test@1234');

      console.log('[DEBUG] Step 5: 點擊登入按鈕');
      await page.locator('button[type="submit"]').click();

      console.log('[DEBUG] Step 6: 等待成功訊息');
      await expect(page.locator('#message')).toContainText('登入成功');

      console.log('[DEBUG] 登入流程全部通過！');
    });

  });

  test.describe('Mode 3 — UI 模式：可在 UI 中視覺化追蹤的測試', () => {

    test('多頁面連續訪問（UI 模式下可見時間軸）', async ({ page }) => {
      // UI 模式：npx playwright test --ui
      // 在 UI 中可看到每個 step 的截圖時間軸
      const pages = [
        { url: `${BASE_URL}`, name: '首頁' },
        { url: `${BASE_URL}/pages/locators-demo.html`, name: '元素定位術示範頁' },
        { url: `${BASE_URL}/pages/actions-demo.html`, name: 'Actions 示範頁' },
        { url: `${BASE_URL}/pages/assertions-demo.html`, name: '斷言示範頁' },
      ];

      for (const p of pages) {
        console.log(`[UI] 訪問：${p.name}`);
        await page.goto(p.url);
        await expect(page.locator('h1')).toBeVisible();
        console.log(`[UI] ${p.name} — h1 標題可見`);
      }
    });

  });

  test.describe('Mode 4 — Extension 模式：適合在 VS Code 中點擊執行的測試', () => {

    test('快速驗證所有主要頁面', async ({ page }) => {
      // Extension 模式：在 VS Code 的 Testing 面板中點擊 run 圖示
      // 每個 test 都可以單獨執行，也可以右鍵 "Debug Test"

      // 驗證 1：首頁
      await page.goto(BASE_URL);
      await expect(page.locator('h1')).toContainText('Playwright 玩家攻略');

      // 驗證 2：登入頁
      await page.goto(`${BASE_URL}/pages/form-auth.html`);
      await expect(page.locator('#username')).toBeVisible();

      // 驗證 3：定位術示範頁
      await page.goto(`${BASE_URL}/pages/locators-demo.html`);
      await expect(page.locator('#go-btn')).toBeVisible();

      // 驗證 4：表格示範頁
      await page.goto(`${BASE_URL}/pages/table-demo.html`);
      await expect(page.locator('#user-table')).toBeVisible();
    });

  });

});
