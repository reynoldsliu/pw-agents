// 對應文章：Day 16 — 獻上素材與獲取秘方：檔案上傳與下載

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 16：獻上素材與獲取秘方', () => {

  // 確保 test-results 目錄存在
  test.beforeAll(async () => {
    const dir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 測試 1：setInputFiles() 直接對 input[type=file] 上傳
  test('setInputFiles() — 直接對 input[type=file] 上傳', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/file-upload`);

    // 使用 buffer 直接提供檔案內容，不需要真實檔案路徑
    await page.locator('#fileInput').setInputFiles({
      name: 'test-upload.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Playwright test file')
    });

    // 驗證頁面顯示正確的檔名
    await expect(page.locator('#fileName')).toContainText('test-upload.txt');
  });

  // 測試 2：waitForEvent(filechooser) — 等待檔案選擇器
  test('waitForEvent(filechooser) — 等待檔案選擇器', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/download-demo`);

    // 同時等待 filechooser 事件並點擊觸發區域
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('#file-chooser-zone').click()
    ]);

    // 透過 fileChooser 設定要上傳的檔案
    await fileChooser.setFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content')
    });

    // 驗證顯示已選擇的檔名
    await expect(page.locator('#chooser-result')).toContainText('test.txt');
  });

  // 測試 3：waitForEvent(download) — 等待下載事件
  test('waitForEvent(download) — 等待下載', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/download-demo`);

    // 同時等待下載事件並點擊下載按鈕
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#download-txt').click()
    ]);

    // 驗證下載檔案的建議檔名
    expect(download.suggestedFilename()).toBe('sample.txt');
  });

  // 測試 4：上傳多個檔案
  test('setInputFiles() — 上傳多個檔案', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/file-upload`);

    // 一次上傳多個檔案
    await page.locator('#fileInput').setInputFiles([
      {
        name: 'file1.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('File 1 content')
      },
      {
        name: 'file2.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('File 2 content')
      }
    ]);

    // 驗證頁面顯示已選取檔案
    await expect(page.locator('#fileName')).toBeVisible();
  });

  // 測試 5：清除已選取的檔案
  test('setInputFiles([]) — 清除已選取的檔案', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/file-upload`);

    // 先選取一個檔案
    await page.locator('#fileInput').setInputFiles({
      name: 'temp.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('temporary')
    });

    // 再清除選取（傳入空陣列）
    await page.locator('#fileInput').setInputFiles([]);

    // 驗證 input 已清除（value 為空）
    const inputValue = await page.locator('#fileInput').inputValue();
    expect(inputValue).toBe('');
  });
});
