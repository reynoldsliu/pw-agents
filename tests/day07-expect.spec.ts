// 對應文章：Day 07 — expect() 斷言的瞄準與射擊

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const PAGE_URL = `${BASE_URL}/pages/assertions-demo`;

test.describe('Day 07：expect() 斷言大全 — 逐一展示每種斷言方式', () => {

  test.beforeEach(async ({ page }) => {
    // 每個測試前訪問斷言示範頁
    await page.goto(PAGE_URL);
  });

  // --- toBeVisible / toBeHidden ---

  test('toBeVisible() — 可見元素斷言', async ({ page }) => {
    // 驗證頁面上可見的元素
    await expect(page.locator('#visible-item')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#enabled-btn')).toBeVisible();
  });

  test('toBeHidden() — 隱藏元素斷言', async ({ page }) => {
    // 驗證 display:none 的隱藏元素
    await expect(page.locator('#hidden-item')).toBeHidden();

    // soft-b 也是隱藏的
    await expect(page.locator('#soft-b')).toBeHidden();
  });

  // --- toBeEnabled / toBeDisabled ---

  test('toBeEnabled() — 啟用按鈕斷言', async ({ page }) => {
    // 驗證按鈕處於可點擊狀態
    await expect(page.locator('#enabled-btn')).toBeEnabled();
    await expect(page.locator('#toggle-disabled-btn')).toBeEnabled();
  });

  test('toBeDisabled() — 停用按鈕斷言', async ({ page }) => {
    // 驗證按鈕處於停用（disabled）狀態
    await expect(page.locator('#disabled-btn')).toBeDisabled();
  });

  // --- toBeChecked ---

  test('toBeChecked() — 已勾選 checkbox 斷言', async ({ page }) => {
    // 驗證 checkbox 的勾選狀態
    await expect(page.locator('#checked-box')).toBeChecked();
  });

  test('not.toBeChecked() — 未勾選 checkbox 斷言', async ({ page }) => {
    // 驗證 checkbox 的未勾選狀態
    await expect(page.locator('#unchecked-box')).not.toBeChecked();
  });

  // --- toHaveText / toContainText ---

  test('toHaveText() — 完整文字比對斷言', async ({ page }) => {
    // toHaveText 要求文字完全符合（預設去頭尾空白）
    await expect(page.locator('#exact-text')).toHaveText('Playwright 測試框架');
  });

  test('toContainText() — 部分文字包含斷言', async ({ page }) => {
    // toContainText 只需包含指定文字即可
    await expect(page.locator('#partial-text')).toContainText('Playwright');
    await expect(page.locator('#partial-text')).toContainText('自動化測試工具');
  });

  // --- toHaveValue ---

  test('toHaveValue() — 輸入框數值斷言（文字）', async ({ page }) => {
    // 驗證 input 的 value 屬性
    await expect(page.locator('#value-input')).toHaveValue('預設文字內容');
  });

  test('toHaveValue() — 輸入框數值斷言（數字）', async ({ page }) => {
    // 驗證 number input 的值
    await expect(page.locator('#number-input')).toHaveValue('42');
  });

  // --- toHaveAttribute ---

  test('toHaveAttribute() — 連結 href 屬性斷言', async ({ page }) => {
    // 驗證元素的特定 HTML 屬性值
    await expect(page.locator('#link-with-href')).toHaveAttribute('href', 'https://playwright.dev');
  });

  test('toHaveAttribute() — 連結 target 屬性斷言', async ({ page }) => {
    await expect(page.locator('#link-with-href')).toHaveAttribute('target', '_blank');
  });

  test('toHaveAttribute() — 圖片 alt 屬性斷言', async ({ page }) => {
    await expect(page.locator('#img-with-alt')).toHaveAttribute('alt', '示範圖片');
  });

  // --- toHaveClass ---

  test('toHaveClass() — 元素 class 斷言（active）', async ({ page }) => {
    // 驗證元素包含指定 class（支援正規式）
    await expect(page.locator('#class-item')).toHaveClass(/active/);
    await expect(page.locator('#class-item')).toHaveClass(/badge/);
  });

  test('toHaveClass() — 元素 class 斷言（warning）', async ({ page }) => {
    await expect(page.locator('#warning-item')).toHaveClass(/warning/);
  });

  // --- toHaveCount ---

  test('toHaveCount() — 元素數量斷言', async ({ page }) => {
    // 驗證符合選擇器的元素數量
    await expect(page.locator('.list-item')).toHaveCount(3);
  });

  test('toHaveCount() — 點擊新增後數量斷言', async ({ page }) => {
    // 點擊新增按鈕後，數量應增加
    await page.locator('#add-item-btn').click();
    await expect(page.locator('.list-item')).toHaveCount(4);
  });

  // --- toHaveURL / toHaveTitle ---

  test('toHaveURL() — 頁面 URL 斷言', async ({ page }) => {
    // 驗證目前頁面的 URL
    await expect(page).toHaveURL(/assertions-demo/);
    await expect(page).toHaveURL(`${PAGE_URL}`);
  });

  test('toHaveTitle() — 頁面標題斷言', async ({ page }) => {
    // 驗證瀏覽器分頁標題
    await expect(page).toHaveTitle('Day 07: 斷言示範');
  });

  // --- 正規式（Regex）模式 ---

  test('toHaveText() — 使用正規式比對（部分匹配）', async ({ page }) => {
    // toHaveText 支援正規式，方便比對動態或部分內容
    await expect(page.locator('#exact-text')).toHaveText(/Playwright/);
    await expect(page.locator('#exact-text')).toHaveText(/測試框架$/);
  });

  test('toHaveAttribute() — 使用正規式比對屬性值', async ({ page }) => {
    // toHaveAttribute 也支援正規式
    await expect(page.locator('#link-with-href')).toHaveAttribute('href', /playwright\.dev/);
    await expect(page.locator('#img-with-alt')).toHaveAttribute('alt', /示範/);
  });

  test('toContainText() — 使用正規式比對部分內容', async ({ page }) => {
    // toContainText 也可接受正規式
    await expect(page.locator('#partial-text')).toContainText(/自動化/);
    await expect(page.locator('#partial-text')).toContainText(/Playwright\s.*工具/);
  });

  // --- timeout / message 選項 ---

  test('expect() — 自訂 timeout 與 message 選項', async ({ page }) => {
    // 可設定最長等待時間（ms）與自訂錯誤訊息
    await expect(page.locator('#visible-item'), {
      message: '可見元素在 5 秒內應出現',
      timeout: 5000,
    }).toBeVisible();

    await expect(page.locator('#exact-text'), {
      message: '#exact-text 應包含「Playwright」文字',
    }).toContainText('Playwright');
  });

  test('💥 [錯誤示範] toHaveText 值與實際不符 — 斷言錯誤的框架名稱', async ({ page }) => {
    await page.goto(PAGE_URL);
    // 錯誤：#exact-text 實際內容為「Playwright 測試框架」，不是「Selenium 測試框架」
    await expect(page.locator('#exact-text')).toHaveText('Selenium 測試框架');
  });

});
