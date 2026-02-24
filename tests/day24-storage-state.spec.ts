// 對應文章：Day 24 — 存取秘密寶箱：Storage State 與 Cookie

import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';
const STORAGE_STATE_PATH = path.join(process.cwd(), 'test-results', 'storageState.json');

test.describe('Day 24：存取秘密寶箱 — Storage State 與 Cookie', () => {

  test.beforeAll(async () => {
    const dir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // --- context.storageState() ---

  test('storageState() — 儲存登入後的 Storage State', async ({ page, context }) => {
    // 執行登入
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/secure/, { timeout: 5000 });

    // 儲存目前的 storage state（含 cookies、localStorage、sessionStorage）
    const storageState = await context.storageState();

    // 確認 storageState 結構存在
    expect(storageState).toHaveProperty('cookies');
    expect(storageState).toHaveProperty('origins');
  });

  test('storageState() — 儲存到檔案', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/secure/, { timeout: 5000 });

    // 儲存到 JSON 檔案
    await context.storageState({ path: STORAGE_STATE_PATH });

    // 確認檔案已建立
    expect(fs.existsSync(STORAGE_STATE_PATH)).toBe(true);

    // 確認 JSON 格式正確
    const data = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
    expect(data).toHaveProperty('cookies');
  });

  // --- sessionStorage / localStorage 操作 ---

  test('evaluate() — 讀取 sessionStorage', async ({ page }) => {
    // 登入後驗證 sessionStorage 被設定
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/secure/, { timeout: 5000 });

    // 讀取 localStorage（form-auth.html 使用 localStorage 儲存登入資訊）
    const user = await page.evaluate(() => localStorage.getItem('currentUser'));
    const role = await page.evaluate(() => localStorage.getItem('currentRole'));

    expect(user).toBe('testuser');
    expect(role).toBe('一般使用者');
  });

  test('evaluate() — 直接設定 sessionStorage', async ({ page }) => {
    await page.goto(BASE_URL);

    // 直接在瀏覽器端設定 sessionStorage
    await page.evaluate(() => {
      sessionStorage.setItem('testKey', 'testValue');
      sessionStorage.setItem('user', 'injectedUser');
    });

    // 驗證設定成功
    const testKey = await page.evaluate(() => sessionStorage.getItem('testKey'));
    const user = await page.evaluate(() => sessionStorage.getItem('user'));

    expect(testKey).toBe('testValue');
    expect(user).toBe('injectedUser');
  });

  test('evaluate() — 讀寫 localStorage', async ({ page }) => {
    await page.goto(BASE_URL);

    // 設定 localStorage
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('language', 'zh-TW');
    });

    // 讀取 localStorage
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    const lang = await page.evaluate(() => localStorage.getItem('language'));

    expect(theme).toBe('dark');
    expect(lang).toBe('zh-TW');
  });

  test('evaluate() — 清除 localStorage', async ({ page }) => {
    await page.goto(BASE_URL);

    // 設定後清除
    await page.evaluate(() => {
      localStorage.setItem('temp', 'value');
    });

    await page.evaluate(() => localStorage.removeItem('temp'));

    const value = await page.evaluate(() => localStorage.getItem('temp'));
    expect(value).toBeNull();
  });

  // --- cookies ---

  test('context.cookies() — 讀取 cookies', async ({ page, context }) => {
    await page.goto(BASE_URL);

    // 取得目前的 cookies
    const cookies = await context.cookies();

    // 確認 cookies 是陣列（可能是空的或有一些）
    expect(Array.isArray(cookies)).toBe(true);
  });

  test('context.addCookies() — 新增 cookie', async ({ page, context }) => {
    // 新增自訂 cookie
    await context.addCookies([
      {
        name: 'playwright-test',
        value: 'day24',
        url: BASE_URL,
      }
    ]);

    await page.goto(BASE_URL);

    // 驗證 cookie 已設定
    const cookies = await context.cookies(BASE_URL);
    const testCookie = cookies.find(c => c.name === 'playwright-test');
    expect(testCookie?.value).toBe('day24');
  });

  test('context.clearCookies() — 清除所有 cookies', async ({ page, context }) => {
    // 先新增 cookie
    await context.addCookies([{ name: 'temp', value: 'temp-val', url: BASE_URL }]);

    // 清除所有 cookies
    await context.clearCookies();

    await page.goto(BASE_URL);

    // 確認已清除
    const cookies = await context.cookies(BASE_URL);
    const tempCookie = cookies.find(c => c.name === 'temp');
    expect(tempCookie).toBeUndefined();
  });

  // --- 建立帶有 storageState 的新 context ---

  test('browser.newContext({ storageState }) — 複用已儲存的登入狀態', async ({ browser }) => {
    // 先執行登入並儲存狀態
    const loginContext = await browser.newContext();
    const loginPage = await loginContext.newPage();

    await loginPage.goto(`${BASE_URL}/pages/form-auth.html`);
    await loginPage.locator('#username').fill('testuser');
    await loginPage.locator('#password').fill('Test@1234');
    await loginPage.locator('button[type="submit"]').click();
    await loginPage.waitForURL(/secure/, { timeout: 5000 });

    const storagePath = path.join(process.cwd(), 'test-results', 'auth-state.json');
    await loginContext.storageState({ path: storagePath });
    await loginContext.close();

    // 用儲存的登入狀態建立新 context
    const authContext = await browser.newContext({ storageState: storagePath });
    const authPage = await authContext.newPage();

    // 直接訪問 secure 頁面，sessionStorage 已恢復
    await authPage.goto(`${BASE_URL}/pages/secure.html`);

    // 驗證頁面可正常顯示
    await expect(authPage.locator('h1')).toContainText('登入成功');

    await authContext.close();
  });

  test('💥 [錯誤示範] 無 storageState 下斷言 localStorage 有登入資料', async ({ browser }) => {
    const context = await browser.newContext(); // 無 storageState，模擬未登入狀態
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/pages/secure.html`);
    const username = await page.evaluate(() => localStorage.getItem('currentUser'));
    // 錯誤：未登入時 currentUser 為 null，但斷言等於 'testuser'
    expect(username).toBe('testuser');
    await context.close();
  });

});
