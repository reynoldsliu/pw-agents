// 對應文章：Day 17 — 擊退偷襲怪：Dialog Handler 技能演練

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 17：擊退偷襲怪 — Dialog Handler 技能演練', () => {

  // 測試 1：處理 Alert — 接受後驗證結果文字
  test('處理 Alert — 接受後驗證結果文字', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dialogs-demo`);

    // 註冊 dialog 事件處理器，自動接受 alert
    page.on('dialog', async (dialog) => {
      // 驗證 dialog 類型為 alert
      expect(dialog.type()).toBe('alert');
      // 驗證 dialog 訊息包含預期文字
      expect(dialog.message()).toContain('Alert');
      // 接受 alert
      await dialog.accept();
    });

    // 點擊觸發 alert 的按鈕
    await page.locator('#alert-btn').click();

    // 驗證觸發 alert 後頁面顯示的結果（HTML 使用 #alert-result）
    await expect(page.locator('#alert-result')).toContainText('已被接受');
  });

  // 測試 2：處理 Confirm — 點擊確定，驗證結果為「確認」
  test('處理 Confirm — 點擊確定，驗證結果為「確認」', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dialogs-demo`);

    // 使用 dialog.accept() 接受 confirm 對話框
    page.on('dialog', async (dialog) => {
      // 驗證 dialog 類型為 confirm
      expect(dialog.type()).toBe('confirm');
      // 接受（點擊確定）
      await dialog.accept();
    });

    await page.locator('#confirm-delete-btn').click();

    // 驗證接受後顯示「確認」
    await expect(page.locator('#confirm-result')).toContainText('確認');
  });

  // 測試 3：處理 Confirm — 點擊取消，驗證結果為「取消」
  test('處理 Confirm — 點擊取消，驗證結果為「取消」', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dialogs-demo`);

    // 使用 dialog.dismiss() 拒絕 confirm 對話框
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      // 取消（點擊取消）
      await dialog.dismiss();
    });

    await page.locator('#confirm-delete-btn').click();

    // 驗證取消後顯示「取消」
    await expect(page.locator('#confirm-result')).toContainText('取消');
  });

  // 測試 4：處理 Prompt — 輸入姓名，驗證結果顯示姓名
  test('處理 Prompt — 輸入姓名，驗證結果顯示姓名', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dialogs-demo`);

    const testName = '測試使用者';

    // 使用 dialog.accept(文字) 在 prompt 中輸入文字
    page.on('dialog', async (dialog) => {
      // 驗證 dialog 類型為 prompt
      expect(dialog.type()).toBe('prompt');
      // 輸入姓名並接受
      await dialog.accept(testName);
    });

    await page.locator('#prompt-name-btn').click();

    // 驗證結果顯示輸入的姓名（HTML 使用 #prompt-result）
    await expect(page.locator('#prompt-result')).toContainText(testName);
  });

  // 測試 5：驗證 dialog.message() 包含特定文字
  test('驗證 dialog.message() 包含特定文字', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dialogs-demo`);

    let capturedMessage = '';

    // 捕捉 dialog 訊息
    page.on('dialog', async (dialog) => {
      // 使用 dialog.message() 取得訊息文字
      capturedMessage = dialog.message();
      await dialog.accept();
    });

    await page.locator('#alert-btn').click();

    // 等待 dialog 處理完成後驗證訊息內容
    await expect(page.locator('#alert-result')).toBeVisible();
    // 驗證捕捉到的訊息不為空
    expect(capturedMessage).toBeTruthy();
    expect(capturedMessage.length).toBeGreaterThan(0);
  });

  // 測試 6：使用 page.once() 只處理一次 dialog
  test('使用 page.once() — 只處理單次 dialog 事件', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dialogs-demo`);

    // page.once() 只會觸發一次，避免影響後續測試
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.locator('#alert-btn').click();

    // 驗證頁面狀態正常
    await expect(page.locator('#alert-result')).toBeVisible();
  });

  test('💥 [錯誤示範] dismiss confirm 後仍斷言「確認刪除」文字', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dialogs-demo.html`);
    page.on('dialog', dialog => dialog.dismiss()); // 拒絕對話框
    await page.locator('#confirm-delete-btn').click();
    // 錯誤：dismiss 後顯示「取消刪除」，但斷言「確認刪除」
    await expect(page.locator('#confirm-result')).toContainText('確認刪除');
  });
});
