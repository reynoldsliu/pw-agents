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

  // 測試 6：download.path() — 取得下載檔案的本地路徑
  test('download.path() — 等待完成後取得本地路徑', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/download-demo`);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#download-txt').click()
    ]);

    // download.path() 等待下載完成，回傳本地暫存路徑
    const filePath = await download.path();

    expect(filePath).not.toBeNull();
    expect(fs.existsSync(filePath!)).toBe(true);

    // 驗證下載的檔案有內容
    const content = fs.readFileSync(filePath!, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
    console.log(`下載暫存路徑：${filePath}`);
  });

  // 測試 7：download.saveAs() — 另存到自訂路徑
  test('download.saveAs() — 將下載檔案另存到指定路徑', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/download-demo`);

    const savePath = path.join(process.cwd(), 'test-results', 'downloaded-sample.txt');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#download-txt').click()
    ]);

    // 另存到指定路徑（覆蓋 Playwright 預設的暫存位置）
    await download.saveAs(savePath);

    expect(fs.existsSync(savePath)).toBe(true);
    const content = fs.readFileSync(savePath, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
    console.log(`已另存至：${savePath}`);

    // 清理測試產生的檔案
    fs.unlinkSync(savePath);
  });

  // 測試 8：suggestedFilename + 多種格式下載
  test('download.suggestedFilename() — 驗證不同格式的建議檔名', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/download-demo`);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#download-csv').click()
    ]);

    // suggestedFilename 由 Content-Disposition 標頭或 href 屬性決定
    const filename = download.suggestedFilename();
    expect(filename).toBeTruthy();
    expect(filename).toMatch(/\.(csv|txt|json)$/);
    console.log(`建議儲存檔名：${filename}`);
  });

  test('💥 [錯誤示範] setInputFiles 指定不存在的檔案路徑', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/file-upload.html`);
    // 錯誤：路徑不存在，setInputFiles 會拋出例外
    await page.locator('#fileInput').setInputFiles('/nonexistent/path/test-file.txt');
  });
});
