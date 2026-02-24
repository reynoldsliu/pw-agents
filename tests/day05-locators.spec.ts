// 對應文章：Day 05 — 元素定位術入門

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const PAGE_URL = `${BASE_URL}/pages/locators-demo.html`;

test.describe('Day 05：元素定位術 — 展示所有定位方式', () => {

  // 每個測試前都先訪問定位術示範頁
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('getByRole — 用角色定位按鈕（GO！）', async ({ page }) => {
    // getByRole 是最推薦的定位方式，貼近 ARIA 規範
    const goBtn = page.getByRole('button', { name: 'GO！' });
    await expect(goBtn).toBeVisible();
    await expect(goBtn).toBeEnabled();
  });

  test('getByRole — 用角色定位按鈕（送出）', async ({ page }) => {
    // 可用 name 參數精確比對按鈕文字
    const sendBtn = page.getByRole('button', { name: '送出' });
    await expect(sendBtn).toBeVisible();
  });

  test('getByLabel — 用 label 文字定位輸入框（電子郵件）', async ({ page }) => {
    // getByLabel 會找到對應 <label for="..."> 的 input
    const emailInput = page.getByLabel('電子郵件');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEnabled();

    // 也可以填入值後驗證
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('getByLabel — 用 label 文字定位輸入框（電話號碼）', async ({ page }) => {
    const phoneInput = page.getByLabel('電話號碼');
    await expect(phoneInput).toBeVisible();
  });

  test('getByPlaceholder — 用 placeholder 定位搜尋框', async ({ page }) => {
    // getByPlaceholder 適合用在沒有 label 但有 placeholder 的輸入框
    const searchInput = page.getByPlaceholder('搜尋關鍵字...');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
  });

  test('getByTitle — 用 title 屬性定位刪除按鈕', async ({ page }) => {
    // getByTitle 比對元素的 title 屬性
    const deleteBtn = page.getByTitle('刪除項目');
    await expect(deleteBtn).toBeVisible();
    await expect(deleteBtn).toBeEnabled();
  });

  test('getByTitle — 用 title 屬性定位編輯按鈕', async ({ page }) => {
    const editBtn = page.getByTitle('編輯項目');
    await expect(editBtn).toBeVisible();
  });

  test('getByAltText — 用 alt 文字定位圖片', async ({ page }) => {
    // getByAltText 比對 <img> 的 alt 屬性
    const productImg = page.getByAltText('產品圖片');
    await expect(productImg).toBeVisible();
  });

  test('getByAltText — 用 alt 文字定位品牌 Logo', async ({ page }) => {
    const logoImg = page.getByAltText('品牌 Logo');
    await expect(logoImg).toBeVisible();
  });

  test('getByTestId — 用 data-testid 屬性定位提交按鈕', async ({ page }) => {
    // getByTestId 比對 data-testid 屬性，專為測試設計的定位方式
    const submitBtn = page.getByTestId('locator-submit-btn');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('getByTestId — 用 data-testid 屬性定位取消按鈕', async ({ page }) => {
    const cancelBtn = page.getByTestId('locator-cancel-btn');
    await expect(cancelBtn).toBeVisible();
  });

  test('getByText — 用文字內容定位元素', async ({ page }) => {
    // getByText 透過文字內容定位，適合用在純文字元素
    const specialText = page.getByText('特定文字內容');
    await expect(specialText).toBeVisible();
  });

  test('getByText — 用文字內容定位狀態文字', async ({ page }) => {
    const statusText = page.getByText('目前狀態：正常運作中');
    await expect(statusText).toBeVisible();
  });

  test('locator by ID — 用 CSS ID 選擇器定位', async ({ page }) => {
    // locator 搭配 # 選擇器，比對元素 id
    const resultDisplay = page.locator('#result-display');
    await expect(resultDisplay).toBeVisible();
    await expect(resultDisplay).toContainText('結果顯示區');
  });

  test('locator by class — 用 CSS class 選擇器定位', async ({ page }) => {
    // locator 搭配 . 選擇器，比對元素 class
    const resultBox = page.locator('.result-box');
    await expect(resultBox).toBeVisible();
  });

  test('各定位方式組合 — 點擊 GO！按鈕後驗證 action-result', async ({ page }) => {
    // 綜合運用多種定位方式完成一個完整互動流程
    const goBtn = page.getByRole('button', { name: 'GO！' });
    await goBtn.click();

    // 驗證點擊後的結果顯示
    const actionResult = page.locator('#action-result');
    await expect(actionResult).toBeVisible();
    await expect(actionResult).toContainText('點擊了');
  });

  test('💥 [錯誤示範] getByTestId 指定拼字錯誤的 testid', async ({ page }) => {
    await page.goto(PAGE_URL);
    // 錯誤：「locator-submit-botton」（應為 locator-submit-btn）不存在
    await expect(page.getByTestId('locator-submit-botton')).toBeVisible({ timeout: 3000 });
  });

});
