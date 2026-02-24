// 對應文章：Day 21 — 製作你的魔法道具箱：Fixtures

import { test as base, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

// =====================================================
// 自訂 Fixture 型別宣告
// =====================================================

/**
 * 自訂 Fixtures 的型別定義
 *
 * 每個 key 對應一個 fixture 名稱，value 型別即為測試函式接收到的值。
 * 此型別傳入 `base.extend<MyFixtures>()` 供 TypeScript 推斷。
 */
type MyFixtures = {
  /** 已導航到首頁的 page */
  homePage: Page;
  /** 已導航到登入頁的 page */
  loginPage: Page;
  /** 已完成登入的 page（在 secure 頁面）*/
  loggedInPage: Page;
};

// =====================================================
// 使用 test.extend() 擴充內建 fixtures
// =====================================================

/**
 * 擴充後的 `test` 物件，包含自訂 fixtures。
 *
 * `base.extend<MyFixtures>({...})` 的每個 property 都是一個
 * async generator function，格式為：
 *
 *   `async ({ page }, use) => { /* setup * / await use(value); /* teardown * / }`
 *
 * - `use(value)` 之前的程式碼為「setup」，在測試開始前執行
 * - `await use(value)` 將 value 注入測試函式
 * - `use()` 之後的程式碼為「teardown」，在測試結束後執行（類似 afterEach）
 */
const test = base.extend<MyFixtures>({

  // Fixture：已開啟首頁的 page
  homePage: async ({ page }, use) => {
    await page.goto(BASE_URL);
    await use(page);
    // use() 之後可放清理邏輯（如 localStorage.clear()）
  },

  // Fixture：已開啟登入頁的 page
  loginPage: async ({ page }, use) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await use(page);
  },

  // Fixture：已完成登入的 page（位於 secure 頁面）
  loggedInPage: async ({ page }, use) => {
    // setup：執行完整登入流程，確保 page 在 secure 頁面
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/secure/, { timeout: 5000 });
    // 將已登入的 page 提供給測試使用
    await use(page);
    // teardown：此處可加登出或清除 localStorage
  },
});

// =====================================================
// 使用自訂 Fixtures 撰寫測試
// =====================================================
test.describe('Day 21：製作你的魔法道具箱 — Fixtures', () => {

  // --- 使用 homePage fixture ---

  test('homePage fixture — 首頁已載入', async ({ homePage }) => {
    // homePage 已自動導航到首頁，不需要手動 goto
    await expect(homePage).toHaveTitle('Playwright 玩家攻略 — 測試網站');
    await expect(homePage.locator('header h1')).toBeVisible();
  });

  test('homePage fixture — 導覽列存在', async ({ homePage }) => {
    await expect(homePage.locator('nav')).toBeVisible();
    const links = homePage.locator('nav .nav-list a');
    expect(await links.count()).toBeGreaterThan(0);
  });

  // --- 使用 loginPage fixture ---

  test('loginPage fixture — 登入表單元素存在', async ({ loginPage }) => {
    // loginPage 已導航到登入頁，直接驗證
    await expect(loginPage.locator('#username')).toBeVisible();
    await expect(loginPage.locator('#password')).toBeVisible();
    await expect(loginPage.locator('button[type="submit"]')).toBeVisible();
  });

  test('loginPage fixture — 可以執行登入', async ({ loginPage }) => {
    await loginPage.locator('#username').fill('testuser');
    await loginPage.locator('#password').fill('Test@1234');
    await loginPage.locator('button[type="submit"]').click();

    await expect(loginPage.locator('#message')).toContainText('登入成功');
  });

  // --- 使用 loggedInPage fixture ---

  test('loggedInPage fixture — 已在安全頁面', async ({ loggedInPage }) => {
    // loggedInPage 已完成登入，直接在 secure 頁面
    await expect(loggedInPage).toHaveURL(/secure/);
    await expect(loggedInPage.locator('h1')).toContainText('登入成功');
  });

  test('loggedInPage fixture — 可以點擊登出', async ({ loggedInPage }) => {
    loggedInPage.on('dialog', dialog => dialog.accept());
    await loggedInPage.locator('#logoutBtn').click();
    await loggedInPage.waitForURL(/form-auth/, { timeout: 5000 });
    await expect(loggedInPage).toHaveURL(/form-auth/);
  });

  // --- 內建 Fixture 示範 ---

  test('內建 page fixture — 基本使用', async ({ page }) => {
    // 內建的 page fixture，每個測試都有獨立的 page 實例
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
  });

  test('內建 context fixture — 建立多個 page', async ({ context }) => {
    // context fixture 可以建立多個 page 共享同一個 browser context
    // 同一 context 的多個 page 共享 cookies / localStorage
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto(BASE_URL);
    await page2.goto(`${BASE_URL}/pages/form-auth.html`);

    await expect(page1).toHaveTitle('Playwright 玩家攻略 — 測試網站');
    await expect(page2).toHaveTitle('場景 1: 表單登入驗證');

    await page1.close();
    await page2.close();
  });

  test('內建 browser fixture — 建立新 context', async ({ browser }) => {
    // browser fixture 允許建立新的隔離 context
    // 不同 context 之間完全隔離（各自的 cookies / localStorage）
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(BASE_URL);
    await expect(page.locator('footer')).toBeVisible();

    await context.close();
  });

  // --- Fixture 進階：teardown 與 scope ---

  test('fixture teardown — use() 後的程式碼在測試結束後執行', async ({ page }) => {
    // 示範 fixture 的 teardown 機制（setup → use → teardown）
    // 實際 teardown 在 test.extend 的 homePage fixture 中可加：
    //   await use(page);
    //   await page.evaluate(() => localStorage.clear()); // ← teardown
    //
    // 此處用 test 內建的 addTeardownCallback 示範等效行為

    const cleanupSteps: string[] = [];

    // 模擬 fixture setup
    cleanupSteps.push('setup');
    await page.goto(BASE_URL);

    // 在測試結束時執行清理（等同 fixture teardown）
    page.on('close', () => cleanupSteps.push('teardown'));

    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
    cleanupSteps.push('test-body');

    // 驗證執行順序正確
    expect(cleanupSteps).toEqual(['setup', 'test-body']);
  });

  test('fixture scope 說明 — test scope vs worker scope', async ({}, testInfo) => {
    // test scope（預設）：每個測試都重新建立 fixture 實例
    // worker scope：同一 worker 中所有測試共享同一個 fixture 實例
    //
    // 宣告方式：
    //   myFixture: [async ({}, use) => { await use(value); }, { scope: 'worker' }]
    //
    // 適用情境：
    //   - test scope：page, context（每測試隔離，預設）
    //   - worker scope：重量級資源（資料庫連線、建立好的 storageState）

    test.info().annotations.push({
      type: 'fixture scope',
      description: [
        '• test scope（預設）：每個測試獨立建立/銷毀，保證隔離',
        '• worker scope：同 worker 所有測試共享一個實例，提升效能',
        `• 目前 workerIndex: ${testInfo.workerIndex}`,
      ].join('\n'),
    });

    // worker scope fixture 適合：每次 login 很慢時先登入一次存成 storageState
    expect(testInfo.workerIndex).toBeGreaterThanOrEqual(0);
  });

  test('💥 [錯誤示範] loggedInPage fixture 已登入，但斷言在登入頁', async ({ loggedInPage }) => {
    // 錯誤：loggedInPage fixture 已完成登入並在 secure 頁面，但斷言 URL 含 form-auth
    await expect(loggedInPage).toHaveURL(/form-auth/);
  });

});
