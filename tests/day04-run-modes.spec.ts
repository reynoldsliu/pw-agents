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

  test.describe('執行控制 — test.skip / test.fixme / test.only 說明', () => {

    test('test.skip() — 條件性跳過（依瀏覽器）', async ({ page, browserName }) => {
      // test.skip(condition, reason) — condition 為 true 時跳過
      // 常見用法：已知某瀏覽器有特定問題時暫時跳過
      test.skip(browserName === 'firefox', '示範：Firefox 時跳過此測試');

      // 非 Firefox 才會執行到這裡
      await page.goto(BASE_URL);
      await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
      console.log(`[${browserName}] 非 Firefox，正常執行`);
    });

    test.skip('test.skip() — 靜態跳過整個測試', async ({ page }) => {
      // test.skip() 無參數 = 永遠跳過，但保留程式碼供參考
      // 適合暫時停用的測試
      await page.goto(BASE_URL);
      await expect(page.locator('header')).toBeVisible();
    });

    test('test.fixme() — 標記待修復的已知問題', async ({ page }) => {
      // test.fixme(condition, reason) — 語意同 skip，但明確表示「待修復」
      // 建議搭配 issue tracking 連結
      test.fixme(true, '已知問題 #123：功能尚未實作，待修復後移除此標記');

      // fixme 後以下程式碼不會執行
      await page.goto(BASE_URL);
      await expect(page.locator('#not-yet-implemented')).toBeVisible();
    });

    test('test.only / describe.only 使用說明（不實際呼叫）', async ({ page }, testInfo) => {
      // ⚠️ 在此示範說明，不實際使用 test.only / describe.only
      // 因為 playwright.config.ts 設定 forbidOnly: !!process.env.CI
      // CI 環境下有 .only 殘留會讓整個 build 失敗
      test.info().annotations.push({
        type: 'test.only 說明',
        description: [
          '• test.only()：只執行此測試（同 spec 中其他測試被跳過）',
          '• test.describe.only()：只執行此 describe 區塊的測試',
          '• CLI 替代方案（推薦，不改程式碼）：',
          '  npx playwright test --grep "標題關鍵字"',
          '  npx playwright test day04-run-modes.spec.ts',
          `• forbidOnly 目前設定：${!!process.env.CI}（CI 環境禁止 .only）`,
        ].join('\n'),
      });

      await page.goto(BASE_URL);
      await expect(page.locator('header')).toBeVisible();
      console.log(`workerIndex: ${testInfo.workerIndex}，project: ${testInfo.project.name}`);
    });

  });

  test('💥 [錯誤示範] 元素文字斷言錯誤 — h1 實際文字不是「管理後台」', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    // 錯誤：h1 實際文字是「場景 1: 表單登入驗證」，不是「管理後台」
    await expect(page.locator('h1')).toHaveText('管理後台', { timeout: 3000 });
  });

});
