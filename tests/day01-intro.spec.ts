// 對應文章：Day 01 — Playwright 簡介：冒險者登錄

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 01：冒險者登錄 — Playwright 基本冒煙測試', () => {

  test('首頁標題正確', async ({ page }) => {
    // 訪問首頁
    await page.goto(BASE_URL);

    // 驗證瀏覽器分頁標題
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');

    // 驗證 h1 標題包含正確文字
    const heading = page.locator('h1');
    await expect(heading).toContainText('Playwright 玩家攻略');
  });

  test('導覽列包含所有測試場景連結', async ({ page }) => {
    await page.goto(BASE_URL);

    // 取得導覽列中的所有連結
    const navLinks = page.locator('nav .nav-list a');

    // 導覽列至少應有 9 個場景連結
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(9);
  });

  test('導覽列包含各主要場景連結', async ({ page }) => {
    await page.goto(BASE_URL);

    // 驗證各核心頁面連結存在
    await expect(page.locator('nav').getByText('場景 1: 表單登入驗證')).toBeVisible();
    await expect(page.locator('nav').getByText('場景 2: 動態載入驗證')).toBeVisible();
    await expect(page.locator('nav').getByText('元素定位術示範')).toBeVisible();
    await expect(page.locator('nav').getByText('Actions 互動示範')).toBeVisible();
    await expect(page.locator('nav').getByText('斷言示範')).toBeVisible();
    await expect(page.locator('nav').getByText('表格定位示範')).toBeVisible();
    await expect(page.locator('nav').getByText('複雜 DOM 定位示範')).toBeVisible();
  });

  test('可成功訪問登入頁面', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 驗證登入頁面基本元素存在
    await expect(page.locator('h1')).toContainText('表單登入驗證');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('可成功訪問動態載入頁面', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);

    // 驗證動態載入頁面基本元素存在
    await expect(page.locator('h1')).toContainText('動態載入驗證');
    await expect(page.locator('#startBtn')).toBeVisible();
  });

  test('頁面基本結構完整', async ({ page }) => {
    await page.goto(BASE_URL);

    // 驗證 header、nav、footer 都存在
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // 驗證 footer 版權文字
    await expect(page.locator('footer')).toContainText('Playwright 玩家攻略');
  });

  test('💥 [錯誤示範] 頁面標題斷言錯誤 — toHaveTitle 值不符', async ({ page }) => {
    await page.goto(BASE_URL);
    // 錯誤：實際標題為中文，此斷言必定失敗
    await expect(page).toHaveTitle('Playwright Adventure Guide — Test Site');
  });

});
