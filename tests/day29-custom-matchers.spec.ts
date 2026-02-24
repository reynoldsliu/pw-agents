// 對應文章：Day 29 — 打造你的魔法書：自訂 Matchers

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

// =====================================================
// 擴充 expect — 自訂 Matchers
// =====================================================

/**
 * 使用 `expect.extend({})` 向 Playwright 的 expect 物件添加自訂斷言方法。
 *
 * 每個 matcher 都是一個 async function，必須回傳：
 * ```ts
 * {
 *   pass: boolean;      // true 表示「條件成立」（斷言通過）
 *   message: () => string; // 失敗時的錯誤訊息（pass=true 時用於 not. 失敗訊息）
 * }
 * ```
 *
 * Playwright 根據 `pass` 值與是否使用 `.not` 決定是否拋出錯誤：
 * - `expect(x).toFoo()` 失敗條件：`pass === false`
 * - `expect(x).not.toFoo()` 失敗條件：`pass === true`
 */
expect.extend({

  /**
   * 驗證元素的文字內容包含中文字元
   *
   * 使用 Unicode 範圍 `\u4e00-\u9fff` 比對 CJK 統一漢字（基本漢字區塊）。
   *
   * @example
   * await expect(page.locator('h1')).toContainChinese();
   */
  async toContainChinese(locator: any) {
    const text = await locator.textContent();
    const chinesePattern = /[\u4e00-\u9fff]/;
    const pass = chinesePattern.test(text ?? '');
    return {
      message: () => pass
        ? `預期文字「${text}」不包含中文`
        : `預期文字「${text}」包含中文`,
      pass,
    };
  },

  /**
   * 驗證元素的 `data-testid` 屬性等於指定值
   *
   * 常用於確認頁面元素有正確標註 testid，符合
   * specs/01-accessibility-testing-standards.md 規範。
   *
   * @param expectedId - 預期的 data-testid 值
   *
   * @example
   * await expect(page.locator('[data-testid="auth-form-login-btn"]')).toHaveTestId('auth-form-login-btn');
   */
  async toHaveTestId(locator: any, expectedId: string) {
    const testId = await locator.getAttribute('data-testid');
    const pass = testId === expectedId;
    return {
      message: () => pass
        ? `預期元素沒有 data-testid="${expectedId}"，但實際有`
        : `預期元素有 data-testid="${expectedId}"，但實際是 "${testId}"`,
      pass,
    };
  },

  /**
   * 驗證 input / textarea 的值為空字串
   *
   * 使用 `locator.inputValue()` 取得表單欄位的當前值，
   * 與 Playwright 內建的 `toHaveValue('')` 相比，此 matcher
   * 提供更語意化的錯誤訊息。
   *
   * @example
   * await expect(page.locator('#username')).toBeEmpty();
   */
  async toBeEmpty(locator: any) {
    const value = await locator.inputValue();
    const pass = value === '';
    return {
      message: () => pass
        ? `預期輸入框不為空，但它是空的`
        : `預期輸入框為空，但值為「${value}」`,
      pass,
    };
  },

  /**
   * 驗證按鈕的文字內容等於指定字串（不區分大小寫、忽略首尾空白）
   *
   * @param expectedText - 預期的按鈕文字（不區分大小寫）
   *
   * @example
   * await expect(page.locator('button[type="submit"]')).toHaveButtonText('登入');
   */
  async toHaveButtonText(locator: any, expectedText: string) {
    const text = await locator.textContent();
    const pass = (text ?? '').trim().toLowerCase() === expectedText.toLowerCase();
    return {
      message: () => pass
        ? `預期按鈕文字不是「${expectedText}」`
        : `預期按鈕文字是「${expectedText}」，但實際是「${(text ?? '').trim()}」`,
      pass,
    };
  },

});

// =====================================================
// 擴充 TypeScript 型別宣告
// =====================================================

/**
 * 將自訂 matchers 加入 Playwright 的全域型別宣告，
 * 讓 IDE 能正確提示方法名稱與參數，避免 TypeScript 型別錯誤。
 *
 * 必須放在 `expect.extend({})` 之後，型別才能正確合併。
 */
declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toContainChinese(): R;
      toHaveTestId(expectedId: string): R;
      toBeEmpty(): R;
      toHaveButtonText(text: string): R;
    }
  }
}

// =====================================================
// 使用自訂 Matchers 的測試
// =====================================================
test.describe('Day 29：打造你的魔法書 — 自訂 Matchers', () => {

  // --- 使用 toContainChinese ---

  test('toContainChinese() — 驗證頁面標題含中文', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('header h1')).toContainChinese();
  });

  test('toContainChinese() — 驗證導覽連結含中文', async ({ page }) => {
    await page.goto(BASE_URL);
    const firstLink = page.locator('nav .nav-list a').first();
    await expect(firstLink).toContainChinese();
  });

  // --- 使用 toHaveTestId ---

  test('toHaveTestId() — 驗證按鈕有正確的 testid', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/locators-demo.html`);
    const submitBtn = page.locator('[data-testid="locator-submit-btn"]');
    await expect(submitBtn).toHaveTestId('locator-submit-btn');
  });

  test('toHaveTestId() — 驗證取消按鈕的 testid', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/locators-demo.html`);
    const cancelBtn = page.locator('[data-testid="locator-cancel-btn"]');
    await expect(cancelBtn).toHaveTestId('locator-cancel-btn');
  });

  // --- 使用 toBeEmpty ---

  test('toBeEmpty() — 驗證初始輸入框為空', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await expect(page.locator('#username')).toBeEmpty();
    await expect(page.locator('#password')).toBeEmpty();
  });

  test('toBeEmpty() — 驗證 clear() 後輸入框為空', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/actions-demo.html`);
    const input = page.locator('#fill-input');
    await input.fill('有內容的文字');
    await input.clear();
    await expect(input).toBeEmpty();
  });

  // --- 使用 toHaveButtonText ---

  test('toHaveButtonText() — 驗證登入按鈕文字', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await expect(page.locator('button[type="submit"]')).toHaveButtonText('登入');
  });

  test('toHaveButtonText() — 驗證開始載入按鈕文字', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);
    await expect(page.locator('#startBtn')).toHaveButtonText('開始載入');
  });

  // --- not 反向驗證 ---

  test('not.toContainChinese() — 驗證元素不含中文', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/locators-demo.html`);
    // 示範：用 evaluate 取得屬性值再做原生斷言
    const submitBtn = page.locator('[data-testid="locator-submit-btn"]');
    const testId = await submitBtn.getAttribute('data-testid');
    const chinesePattern = /[\u4e00-\u9fff]/;
    expect(chinesePattern.test(testId ?? '')).toBe(false);
  });

  test('not.toBeEmpty() — 驗證填入後輸入框不為空', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await page.locator('#username').fill('testuser');
    await expect(page.locator('#username')).not.toBeEmpty();
  });

  // --- 內建 Matchers 回顧 ---

  test('內建 matchers 組合 — 完整表單驗證', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 使用自訂 + 內建 matchers 組合驗證
    await expect(page.locator('#username')).toBeVisible();            // 內建
    await expect(page.locator('#username')).toBeEnabled();            // 內建
    await expect(page.locator('#username')).toBeEmpty();              // 自訂
    await expect(page.locator('button[type="submit"]')).toHaveButtonText('登入'); // 自訂

    await page.locator('#username').fill('testuser');
    await expect(page.locator('#username')).not.toBeEmpty();          // 自訂 + not
    await expect(page.locator('#username')).toHaveValue('testuser');  // 內建
  });

  test('💥 [錯誤示範] 自訂 matcher toHaveButtonText 斷言錯誤的按鈕文字', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    // 錯誤：登入按鈕文字是「登入」，斷言「送出」時自訂 matcher 拋出有意義的錯誤訊息
    await expect(page.locator('button[type="submit"]')).toHaveButtonText('送出');
  });

});