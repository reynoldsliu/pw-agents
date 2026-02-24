// spec: .github/agents/seed-test/login-test.md
// plan: .github/agents/plans/login-test-plan.md

import { test, expect } from '@playwright/test';
import { byTestId } from './test-helpers';

const BASE_URL = 'http://localhost:8080';
const LOGIN_PAGE = `${BASE_URL}/pages/form-auth.html`;
const SECURE_PAGE = `${BASE_URL}/pages/secure.html`;

test.describe('表單登入驗證測試', () => {
  // 場景 1: 成功登入流程
  test('場景 1: 使用正確帳號密碼成功登入', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 等待頁面完全載入
    await page.waitForLoadState('domcontentloaded');

    // 3. 驗證頁面標題為「場景 1: 表單登入驗證」
    await expect(page).toHaveTitle('場景 1: 表單登入驗證');

    // 4. 在「使用者名稱」欄位輸入: testuser
    await byTestId(page, 'auth-form-username-input').fill('testuser');

    // 5. 在「密碼」欄位輸入: Test@1234
    await byTestId(page, 'auth-form-password-input').fill('Test@1234');

    // 6. 點擊「登入」按鈕
    await byTestId(page, 'auth-form-login-btn').click();

    // 7. 等待成功訊息出現（3 秒內）
    const successMessage = byTestId(page, 'auth-form-message');
    await expect(successMessage).toBeVisible({ timeout: 3000 });

    // 8. 驗證成功訊息包含文字
    await expect(successMessage).toContainText('登入成功！您已登入到安全區域。');

    // 9. 驗證成功訊息有 success 樣式
    await expect(successMessage).toHaveClass(/success/);

    // 10. 等待自動跳轉到安全頁面（約 2 秒）
    await page.waitForURL(/.*secure/);

    // 11. 驗證 URL 變更為 secure.html
    expect(page.url()).toContain('secure');

    // 12. 驗證安全頁面顯示標題
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toContainText('登入成功！');

    // 13. 驗證安全頁面顯示歡迎訊息
    await expect(byTestId(page, 'auth-secure-welcome-text')).toBeVisible();
  });

  // 場景 2: 使用錯誤帳號密碼登入
  test('場景 2: 使用錯誤帳號密碼顯示錯誤訊息', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 在「使用者名稱」欄位輸入: wronguser
    await byTestId(page, 'auth-form-username-input').fill('wronguser');

    // 3. 在「密碼」欄位輸入: wrongpass
    await byTestId(page, 'auth-form-password-input').fill('wrongpass');

    // 4. 點擊「登入」按鈕
    await byTestId(page, 'auth-form-login-btn').click();

    // 5. 驗證錯誤訊息出現
    const errorMessage = byTestId(page, 'auth-form-message');
    await expect(errorMessage).toBeVisible();

    // 6. 驗證錯誤訊息包含文字
    await expect(errorMessage).toContainText('登入失敗！使用者名稱或密碼錯誤。');

    // 7. 驗證錯誤訊息有 error 樣式
    await expect(errorMessage).toHaveClass(/error/);

    // 8. 驗證 URL 保持在登入頁面（未跳轉）
    expect(page.url()).toContain('form-auth');

    // 9. 驗證使用者名稱和密碼欄位仍然存在
    await expect(byTestId(page, 'auth-form-username-input')).toBeVisible();
    await expect(byTestId(page, 'auth-form-password-input')).toBeVisible();
  });

  // 場景 3: 空白欄位驗證
  test('場景 3: 提交空白表單顯示驗證錯誤', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 點擊「登入」按鈕（欄位保持空白）
    await byTestId(page, 'auth-form-login-btn').click();

    // 3. 驗證系統反應（顯示錯誤訊息或 HTML5 驗證提示）
    const errorMessage = byTestId(page, 'auth-form-message');
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);

    if (isErrorVisible) {
      await expect(errorMessage).toBeVisible();
    } else {
      // 檢查 HTML5 驗證提示
      const usernameInput = byTestId(page, 'auth-form-username-input');
      const isInvalid = await usernameInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
      expect(isInvalid).toBe(true);
    }
  });

  // 場景 4: 只輸入使用者名稱
  test('場景 4: 只輸入使用者名稱，密碼為空', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 在「使用者名稱」欄位輸入: testuser
    await byTestId(page, 'auth-form-username-input').fill('testuser');

    // 3. 點擊「登入」按鈕（密碼保持空白）
    await byTestId(page, 'auth-form-login-btn').click();

    // 4. 驗證系統顯示錯誤訊息
    const errorMessage = byTestId(page, 'auth-form-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('登入失敗');
  });

  // 場景 5: 只輸入密碼
  test('場景 5: 只輸入密碼，使用者名稱為空', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 在「密碼」欄位輸入: Test@1234
    await byTestId(page, 'auth-form-password-input').fill('Test@1234');

    // 3. 點擊「登入」按鈕（使用者名稱保持空白）
    await byTestId(page, 'auth-form-login-btn').click();

    // 4. 驗證系統顯示錯誤訊息
    const errorMessage = byTestId(page, 'auth-form-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('登入失敗');
  });

  // 場景 6: 登出功能驗證
  test('場景 6: 從安全頁面成功登出', async ({ page }) => {
    // 1. 完成成功登入流程到達安全頁面
    await page.goto(LOGIN_PAGE);
    await byTestId(page, 'auth-form-username-input').fill('testuser');
    await byTestId(page, 'auth-form-password-input').fill('Test@1234');
    await byTestId(page, 'auth-form-login-btn').click();
    await page.waitForURL(/.*secure/);

    // 2. 在安全頁面點擊「登出」按鈕
    const logoutButton = byTestId(page, 'auth-secure-logout-btn');
    await expect(logoutButton).toBeVisible();

    // 3. 處理確認對話框
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('已登出');
      await dialog.accept();
    });

    await logoutButton.click();

    // 4. 驗證導向回到登入頁面
    await page.waitForURL(/.*form-auth/);

    // 5. 驗證 URL 變更為 form-auth.html
    expect(page.url()).toContain('form-auth');
  });

  // 場景 7: 表單欄位屬性驗證
  test('場景 7: 驗證表單欄位的基本屬性', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 驗證使用者名稱欄位有 data-testid
    const usernameInput = byTestId(page, 'auth-form-username-input');
    await expect(usernameInput).toHaveAttribute('id', 'username');

    // 3. 驗證密碼欄位有 data-testid
    const passwordInput = byTestId(page, 'auth-form-password-input');
    await expect(passwordInput).toHaveAttribute('id', 'password');

    // 4. 檢查密碼欄位的 type 為 password（遮罩顯示）
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 5. 驗證登入按鈕的 type 為 submit
    await expect(byTestId(page, 'auth-form-login-btn')).toHaveAttribute('type', 'submit');

    // 6. 驗證所有必要標籤（label）都存在
    const usernameLabel = page.locator('label[for="username"]');
    const passwordLabel = page.locator('label[for="password"]');
    await expect(usernameLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  // 場景 8: 頁面元素完整性檢查
  test('場景 8: 驗證登入頁面所有必要元素都存在', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 驗證頁面標題存在
    const pageHeading = page.locator('h1');
    await expect(pageHeading).toContainText('場景 1: 表單登入驗證');

    // 3. 驗證使用者名稱輸入框存在（有 data-testid）
    await expect(byTestId(page, 'auth-form-username-input')).toBeVisible();

    // 4. 驗證密碼輸入框存在（有 data-testid）
    await expect(byTestId(page, 'auth-form-password-input')).toBeVisible();

    // 5. 驗證「登入」按鈕存在（有 data-testid）
    await expect(byTestId(page, 'auth-form-login-btn')).toBeVisible();

    // 6. 驗證「返回首頁」連結存在（有 data-testid）
    await expect(byTestId(page, 'auth-form-back-link')).toBeVisible();

    // 7. 驗證訊息顯示區域存在（有 data-testid）
    await expect(byTestId(page, 'auth-form-message')).toHaveCount(1);
  });

  // 場景 9: 連續多次錯誤登入
  test('場景 9: 多次錯誤登入後成功登入', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 輸入錯誤帳號密碼並提交（第 1 次）
    await byTestId(page, 'auth-form-username-input').fill('wrong1');
    await byTestId(page, 'auth-form-password-input').fill('wrong1');
    await byTestId(page, 'auth-form-login-btn').click();

    // 3. 驗證顯示錯誤訊息
    await expect(byTestId(page, 'auth-form-message')).toBeVisible();

    // 4. 再次輸入錯誤帳號密碼並提交（第 2 次）
    await byTestId(page, 'auth-form-username-input').fill('wrong2');
    await byTestId(page, 'auth-form-password-input').fill('wrong2');
    await byTestId(page, 'auth-form-login-btn').click();

    // 5. 驗證仍然顯示錯誤訊息
    await expect(byTestId(page, 'auth-form-message')).toBeVisible();

    // 6. 第 3 次輸入正確帳號密碼
    await byTestId(page, 'auth-form-username-input').fill('testuser');
    await byTestId(page, 'auth-form-password-input').fill('Test@1234');
    await byTestId(page, 'auth-form-login-btn').click();

    // 7. 驗證成功登入
    const successMessage = byTestId(page, 'auth-form-message');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('登入成功');
  });

  // 場景 10: 瀏覽器導航測試
  test('場景 10: 瀏覽器前進/後退功能', async ({ page }) => {
    // 1. 完成成功登入流程到達安全頁面
    await page.goto(LOGIN_PAGE);
    await byTestId(page, 'auth-form-username-input').fill('testuser');
    await byTestId(page, 'auth-form-password-input').fill('Test@1234');
    await byTestId(page, 'auth-form-login-btn').click();
    await page.waitForURL(/.*secure/);

    // 2. 點擊瀏覽器「返回」按鈕
    await page.goBack();

    // 3. 驗證返回到登入頁面
    expect(page.url()).toContain('form-auth');

    // 4. 點擊瀏覽器「前進」按鈕
    await page.goForward();

    // 5. 驗證回到安全頁面
    expect(page.url()).toContain('secure');
  });

  test('💥 [錯誤示範] 密碼錯誤後仍斷言登入成功訊息', async ({ page }) => {
    await page.goto(LOGIN_PAGE);
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('WrongPassword!');
    await page.locator('button[type="submit"]').click();
    // 錯誤：密碼錯誤，應顯示錯誤訊息，但斷言登入成功
    await expect(page.locator('#message')).toContainText('登入成功');
  });
});
