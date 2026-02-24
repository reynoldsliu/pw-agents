// 對應文章：Day 12 — 守衛的考驗：表單驗證與登入流程

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const PAGE_URL = `${BASE_URL}/pages/form-auth.html`;

test.describe('Day 12：守衛的考驗 — 表單驗證與登入流程', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  // --- 成功登入情境 ---

  test('成功登入 — testuser 帳號', async ({ page }) => {
    // 填入正確的使用者名稱與密碼
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');

    // 送出表單
    await page.locator('button[type="submit"]').click();

    // 驗證成功訊息
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toContainText('登入成功');
    await expect(page.locator('#message')).toHaveClass(/success/);
  });

  test('成功登入 — admin 帳號', async ({ page }) => {
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('Admin@1234');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#message')).toContainText('登入成功');
  });

  test('成功登入 — editor 帳號', async ({ page }) => {
    await page.locator('#username').fill('editor');
    await page.locator('#password').fill('Editor@1234');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#message')).toContainText('登入成功');
  });

  test('成功登入 — viewer 帳號', async ({ page }) => {
    await page.locator('#username').fill('viewer');
    await page.locator('#password').fill('Viewer@1234');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#message')).toContainText('登入成功');
  });

  // --- 失敗登入情境 ---

  test('登入失敗 — 錯誤密碼', async ({ page }) => {
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // 驗證錯誤訊息
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toContainText('登入失敗');
    await expect(page.locator('#message')).toHaveClass(/error/);
  });

  test('登入失敗 — 帳號不存在', async ({ page }) => {
    await page.locator('#username').fill('nonexistent');
    await page.locator('#password').fill('Test@1234');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#message')).toContainText('登入失敗');
    await expect(page.locator('#message')).toHaveClass(/error/);
  });

  test('登入失敗 — 空白帳號', async ({ page }) => {
    // 不填帳號直接送出
    await page.locator('#password').fill('Test@1234');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#message')).toContainText('登入失敗');
  });

  test('登入失敗 — 空白密碼', async ({ page }) => {
    await page.locator('#username').fill('testuser');
    // 不填密碼直接送出
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#message')).toContainText('登入失敗');
  });

  test('登入失敗 — 全空白', async ({ page }) => {
    // 完全不填直接送出
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#message')).toContainText('登入失敗');
  });

  // --- 頁面元素驗證 ---

  test('登入頁面結構 — 必要欄位都存在', async ({ page }) => {
    // 驗證頁面有所有必要元素
    await expect(page.locator('h1')).toContainText('表單登入驗證');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('登入頁面 — placeholder 提示文字正確', async ({ page }) => {
    await expect(page.locator('#username')).toHaveAttribute('placeholder', '請輸入 testuser');
    await expect(page.locator('#password')).toHaveAttribute('placeholder', '請輸入 Test@1234');
  });

  test('登入頁面 — 密碼欄位為 password 類型', async ({ page }) => {
    // 確保密碼欄位使用 type="password"，不會明文顯示
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });

  // --- 成功後跳轉 ---

  test('成功登入後跳轉到 secure 頁面', async ({ page }) => {
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');
    await page.locator('button[type="submit"]').click();

    // 等待 URL 跳轉（2 秒後跳轉）
    await page.waitForURL(/secure/, { timeout: 5000 });

    // 驗證已在 secure 頁面
    await expect(page).toHaveURL(/secure/);
  });

  // --- 使用 getByLabel 定位（語意定位）---

  test('使用 getByLabel 定位欄位', async ({ page }) => {
    // 使用語意定位方式填入表單
    await page.getByLabel('使用者名稱').fill('testuser');
    await page.getByLabel('密碼').fill('Test@1234');
    await page.getByRole('button', { name: '登入' }).click();

    await expect(page.locator('#message')).toContainText('登入成功');
  });

  // --- 登入狀態持久化 ---

  test('成功登入後 — localStorage 儲存登入狀態', async ({ page }) => {
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('Test@1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/secure/, { timeout: 5000 });

    // 驗證 localStorage 已存入使用者資訊（登入狀態持久化的關鍵）
    const currentUser = await page.evaluate(() => localStorage.getItem('currentUser'));
    const currentRole = await page.evaluate(() => localStorage.getItem('currentRole'));

    expect(currentUser).toBe('testuser');
    expect(currentRole).toBe('一般使用者');
  });

  test('成功登入後 — admin 角色 localStorage 驗證', async ({ page }) => {
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('Admin@1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/secure/, { timeout: 5000 });

    const role = await page.evaluate(() => localStorage.getItem('currentRole'));
    expect(role).toBe('管理員');
  });

  test('登入失敗後 — localStorage 不含使用者資訊', async ({ page }) => {
    await page.locator('#username').fill('wronguser');
    await page.locator('#password').fill('wrongpass');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#message')).toContainText('登入失敗');

    // 登入失敗時 localStorage 應無使用者資訊
    const currentUser = await page.evaluate(() => localStorage.getItem('currentUser'));
    expect(currentUser).toBeNull();
  });

  test('💥 [錯誤示範] 密碼錯誤後仍斷言跳轉到安全頁面', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('WrongPassword!');
    await page.locator('button[type="submit"]').click();
    // 錯誤：密碼錯誤，頁面顯示錯誤訊息且不跳轉
    await expect(page).toHaveURL(/secure/, { timeout: 3000 });
  });

});
