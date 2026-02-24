// 對應文章：Day 27 — 免除重複登入：Auth State 複用

import { test as setup, test, expect } from '@playwright/test';
// import path from 'path';
import path = require("path")
import fs = require("fs")

const BASE_URL = 'http://localhost:8080';

/**
 * 各角色的認證狀態（storageState）儲存路徑
 *
 * `storageState()` 會將以下資料序列化為 JSON 檔案：
 * - `cookies`：瀏覽器的所有 cookie（本專案不使用 cookie，此陣列為空）
 * - `origins`：各 origin 的 localStorage / sessionStorage 內容
 *
 * 本專案的登入狀態儲存於 localStorage（currentUser、currentRole 等），
 * 因此 storageState 能正確捕捉並還原登入狀態。
 *
 * 注意：sessionStorage 不會被 storageState 儲存，
 * 若改用 sessionStorage 存放 token，則此方法無法複用登入狀態。
 */
const AUTH_STATE_DIR = path.join(process.cwd(), 'test-results', 'auth');
const TESTUSER_STATE = path.join(AUTH_STATE_DIR, 'testuser.json');
const ADMIN_STATE = path.join(AUTH_STATE_DIR, 'admin.json');
const EDITOR_STATE = path.join(AUTH_STATE_DIR, 'editor.json');

test.describe('Day 27：免除重複登入 — Auth State 複用', () => {

  // --- 準備：儲存各角色的登入狀態 ---

  test.beforeAll(async ({ browser }) => {
    // 確保目錄存在
    if (!fs.existsSync(AUTH_STATE_DIR)) {
      fs.mkdirSync(AUTH_STATE_DIR, { recursive: true });
    }

    // 儲存 testuser 的登入狀態
    const ctx1 = await browser.newContext();
    const p1 = await ctx1.newPage();
    await p1.goto(`${BASE_URL}/pages/form-auth.html`);
    await p1.locator('#username').fill('testuser');
    await p1.locator('#password').fill('Test@1234');
    await p1.locator('button[type="submit"]').click();
    await p1.waitForURL(/secure/, { timeout: 5000 });
    await ctx1.storageState({ path: TESTUSER_STATE });
    await ctx1.close();

    // 儲存 admin 的登入狀態
    const ctx2 = await browser.newContext();
    const p2 = await ctx2.newPage();
    await p2.goto(`${BASE_URL}/pages/form-auth.html`);
    await p2.locator('#username').fill('admin');
    await p2.locator('#password').fill('Admin@1234');
    await p2.locator('button[type="submit"]').click();
    await p2.waitForURL(/secure/, { timeout: 5000 });
    await ctx2.storageState({ path: ADMIN_STATE });
    await ctx2.close();

    // 儲存 editor 的登入狀態
    const ctx3 = await browser.newContext();
    const p3 = await ctx3.newPage();
    await p3.goto(`${BASE_URL}/pages/form-auth.html`);
    await p3.locator('#username').fill('editor');
    await p3.locator('#password').fill('Editor@1234');
    await p3.locator('button[type="submit"]').click();
    await p3.waitForURL(/secure/, { timeout: 5000 });
    await ctx3.storageState({ path: EDITOR_STATE });
    await ctx3.close();
  });

  // --- 使用儲存的登入狀態 ---

  test('testuser — 用儲存的 auth state 直接訪問 secure 頁面', async ({ browser }) => {
    // 用儲存的 testuser 登入狀態建立新 context
    const context = await browser.newContext({ storageState: TESTUSER_STATE });
    const page = await context.newPage();

    // 直接前往 secure 頁面（不需要重新登入）
    await page.goto(`${BASE_URL}/pages/secure.html`);

    // 驗證頁面正確顯示
    await expect(page.locator('h1')).toContainText('登入成功');

    // 驗證 localStorage 中的使用者資訊（storageState 儲存 localStorage）
    const username = await page.evaluate(() => localStorage.getItem('currentUser'));
    expect(username).toBe('testuser');

    await context.close();
  });

  test('admin — 用儲存的 auth state 驗證管理員角色', async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/pages/secure.html`);
    await expect(page.locator('h1')).toContainText('登入成功');

    const role = await page.evaluate(() => localStorage.getItem('currentRole'));
    expect(role).toBe('管理員');

    await context.close();
  });

  test('editor — 用儲存的 auth state 驗證編輯者角色', async ({ browser }) => {
    const context = await browser.newContext({ storageState: EDITOR_STATE });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/pages/secure.html`);
    await expect(page.locator('h1')).toContainText('登入成功');

    const role = await page.evaluate(() => localStorage.getItem('currentRole'));
    expect(role).toBe('編輯者');

    await context.close();
  });

  // --- 多角色並行測試（展示 auth state 的實際效益）---

  test('多角色平行驗證 — testuser 與 admin 同時在線', async ({ browser }) => {
    /**
     * 每個 `browser.newContext({ storageState })` 建立的 context 互相隔離，
     * 各自帶有不同角色的 localStorage，模擬多個使用者同時在線的情境。
     * 使用 Promise.all 平行建立 context，縮短前置作業時間。
     */
    const [testuserCtx, adminCtx] = await Promise.all([
      browser.newContext({ storageState: TESTUSER_STATE }),
      browser.newContext({ storageState: ADMIN_STATE }),
    ]);

    const [testuserPage, adminPage] = await Promise.all([
      testuserCtx.newPage(),
      adminCtx.newPage(),
    ]);

    // 兩個使用者同時訪問 secure 頁面
    await Promise.all([
      testuserPage.goto(`${BASE_URL}/pages/secure.html`),
      adminPage.goto(`${BASE_URL}/pages/secure.html`),
    ]);

    // 各自驗證自己的角色
    const [testuserRole, adminRole] = await Promise.all([
      testuserPage.evaluate(() => localStorage.getItem('currentRole')),
      adminPage.evaluate(() => localStorage.getItem('currentRole')),
    ]);

    expect(testuserRole).toBe('一般使用者');
    expect(adminRole).toBe('管理員');

    await Promise.all([testuserCtx.close(), adminCtx.close()]);
  });

  // --- storageState 的結構驗證 ---

  test('storageState 結構 — 確認儲存的資訊格式', async () => {
    // 讀取並驗證 storageState JSON 格式
    const state = JSON.parse(fs.readFileSync(TESTUSER_STATE, 'utf-8'));

    expect(state).toHaveProperty('cookies');
    expect(state).toHaveProperty('origins');
    expect(Array.isArray(state.cookies)).toBe(true);
    expect(Array.isArray(state.origins)).toBe(true);

    // 驗證 origins 包含 localStorage/sessionStorage 資料
    const origin = state.origins.find((o: any) => o.origin.includes('localhost:8080'));
    if (origin) {
      expect(origin).toHaveProperty('localStorage');
    }
  });

  // --- 未登入狀態的對比 ---

  test('未登入狀態 — 無 sessionStorage 資料', async ({ page }) => {
    // 一般新頁面（無 auth state）
    await page.goto(`${BASE_URL}/pages/secure.html`);

    // secure 頁面本身沒有跳轉保護，但 localStorage 應為空
    const username = await page.evaluate(() => localStorage.getItem('currentUser'));
    expect(username).toBeNull();
  });

});
