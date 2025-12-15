// spec: .github/agents/seed-test/login-test.md
// plan: .github/agents/plans/login-test-plan.md

import { test, expect } from '@playwright/test';

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
    await page.fill('#username', 'testuser');

    // 5. 在「密碼」欄位輸入: Test@1234
    await page.fill('#password', 'Test@1234');

    // 6. 點擊「登入」按鈕
    await page.click('button[type="submit"]');

    // 7. 等待成功訊息出現（3 秒內）
    const successMessage = page.locator('#message.success');
    await expect(successMessage).toBeVisible({ timeout: 3000 });

    // 8. 驗證成功訊息包含文字: "登入成功！您已登入到安全區域。"
    await expect(successMessage).toContainText('登入成功！您已登入到安全區域。');

    // 9. 驗證成功訊息為綠色背景（success 樣式）
    const messageClass = await successMessage.getAttribute('class');
    expect(messageClass).toContain('success');

    // 10. 等待自動跳轉到安全頁面（約 2 秒）
    await page.waitForURL(/.*secure\.html/);

    // 11. 驗證 URL 變更為 secure.html
    expect(page.url()).toContain('secure.html');

    // 12. 驗證安全頁面顯示標題: "登入成功！"
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toContainText('登入成功！');

    // 13. 驗證安全頁面顯示歡迎訊息
    const welcomeMessage = page.locator('text=歡迎');
    await expect(welcomeMessage).toBeVisible();
  });

  // 場景 2: 使用錯誤帳號密碼登入
  test('場景 2: 使用錯誤帳號密碼顯示錯誤訊息', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 在「使用者名稱」欄位輸入: wronguser
    await page.fill('#username', 'wronguser');

    // 3. 在「密碼」欄位輸入: wrongpass
    await page.fill('#password', 'wrongpass');

    // 4. 點擊「登入」按鈕
    await page.click('button[type="submit"]');

    // 5. 驗證錯誤訊息出現
    const errorMessage = page.locator('#message.error');
    await expect(errorMessage).toBeVisible();

    // 6. 驗證錯誤訊息包含文字: "登入失敗！使用者名稱或密碼錯誤。"
    await expect(errorMessage).toContainText('登入失敗！使用者名稱或密碼錯誤。');

    // 7. 驗證錯誤訊息為紅色背景（error 樣式）
    const messageClass = await errorMessage.getAttribute('class');
    expect(messageClass).toContain('error');

    // 8. 驗證 URL 保持在登入頁面（未跳轉）
    expect(page.url()).toContain('form-auth.html');

    // 9. 驗證使用者名稱和密碼欄位仍然存在
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  // 場景 3: 空白欄位驗證
  test('場景 3: 提交空白表單顯示驗證錯誤', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 保持「使用者名稱」欄位為空
    // 3. 保持「密碼」欄位為空
    // 4. 點擊「登入」按鈕
    await page.click('button[type="submit"]');

    // 5. 驗證系統反應（顯示錯誤訊息或 HTML5 驗證提示）
    const errorMessage = page.locator('#message.error');
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);
    
    if (isErrorVisible) {
      await expect(errorMessage).toBeVisible();
    } else {
      // 檢查 HTML5 驗證提示
      const usernameInput = page.locator('#username');
      const isInvalid = await usernameInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
      expect(isInvalid).toBe(true);
    }
  });

  // 場景 4: 只輸入使用者名稱
  test('場景 4: 只輸入使用者名稱，密碼為空', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 在「使用者名稱」欄位輸入: testuser
    await page.fill('#username', 'testuser');

    // 3. 保持「密碼」欄位為空
    // 4. 點擊「登入」按鈕
    await page.click('button[type="submit"]');

    // 5. 驗證系統顯示錯誤訊息
    const errorMessage = page.locator('#message.error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('登入失敗');
  });

  // 場景 5: 只輸入密碼
  test('場景 5: 只輸入密碼，使用者名稱為空', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 保持「使用者名稱」欄位為空
    // 3. 在「密碼」欄位輸入: Test@1234
    await page.fill('#password', 'Test@1234');

    // 4. 點擊「登入」按鈕
    await page.click('button[type="submit"]');

    // 5. 驗證系統顯示錯誤訊息
    const errorMessage = page.locator('#message.error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('登入失敗');
  });

  // 場景 6: 登出功能驗證
  test('場景 6: 從安全頁面成功登出', async ({ page }) => {
    // 1. 完成成功登入流程到達安全頁面
    await page.goto(LOGIN_PAGE);
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Test@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*secure\.html/);

    // 2. 在安全頁面點擊「登出」按鈕
    const logoutButton = page.locator('button:has-text("登出")');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // 3. 驗證彈出確認對話框顯示 "已登出"
    // 處理確認對話框
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('已登出');
      await dialog.accept();
    });

    // 4. 驗證導向回到登入頁面
    await page.waitForURL(/.*form-auth\.html/);

    // 5. 驗證 URL 變更為 form-auth.html
    expect(page.url()).toContain('form-auth.html');
  });

  // 場景 7: 表單欄位屬性驗證
  test('場景 7: 驗證表單欄位的基本屬性', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 檢查使用者名稱欄位的 ID 為 username
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toHaveAttribute('id', 'username');

    // 3. 檢查密碼欄位的 ID 為 password
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('id', 'password');

    // 4. 檢查密碼欄位的 type 為 password（遮罩顯示）
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 5. 檢查登入按鈕的 type 為 submit
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveAttribute('type', 'submit');

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

    // 2. 驗證頁面標題存在: "🔐 場景 1: 表單登入驗證"
    const pageHeading = page.locator('h1');
    await expect(pageHeading).toContainText('場景 1: 表單登入驗證');

    // 3. 驗證「使用者名稱」標籤和輸入框存在
    await expect(page.locator('label[for="username"]')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();

    // 4. 驗證「密碼」標籤和輸入框存在
    await expect(page.locator('label[for="password"]')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // 5. 驗證「登入」按鈕存在
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // 6. 驗證「返回首頁」連結存在
    const backLink = page.locator('a.back-link, a:has-text("返回首頁")');
    await expect(backLink).toBeVisible();

    // 7. 驗證訊息顯示區域存在（即使初始為隱藏）
    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveCount(1);
  });

  // 場景 9: 連續多次錯誤登入
  test('場景 9: 多次錯誤登入後成功登入', async ({ page }) => {
    // 1. 訪問登入頁面
    await page.goto(LOGIN_PAGE);

    // 2. 輸入錯誤帳號密碼並提交（第 1 次）
    await page.fill('#username', 'wrong1');
    await page.fill('#password', 'wrong1');
    await page.click('button[type="submit"]');

    // 3. 驗證顯示錯誤訊息
    let errorMessage = page.locator('#message.error');
    await expect(errorMessage).toBeVisible();

    // 清除表單
    await page.fill('#username', '');
    await page.fill('#password', '');

    // 4. 再次輸入錯誤帳號密碼並提交（第 2 次）
    await page.fill('#username', 'wrong2');
    await page.fill('#password', 'wrong2');
    await page.click('button[type="submit"]');

    // 5. 驗證仍然顯示錯誤訊息
    errorMessage = page.locator('#message.error');
    await expect(errorMessage).toBeVisible();

    // 清除表單
    await page.fill('#username', '');
    await page.fill('#password', '');

    // 6. 第 3 次輸入正確帳號密碼
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Test@1234');
    await page.click('button[type="submit"]');

    // 7. 驗證成功登入
    const successMessage = page.locator('#message.success');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('登入成功');
  });

  // 場景 10: 瀏覽器導航測試
  test('場景 10: 瀏覽器前進/後退功能', async ({ page }) => {
    // 1. 完成成功登入流程到達安全頁面
    await page.goto(LOGIN_PAGE);
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Test@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*secure\.html/);

    // 2. 點擊瀏覽器「返回」按鈕
    await page.goBack();

    // 3. 驗證返回到登入頁面
    expect(page.url()).toContain('form-auth.html');

    // 4. 點擊瀏覽器「前進」按鈕
    await page.goForward();

    // 5. 驗證回到安全頁面
    expect(page.url()).toContain('secure.html');
  });
});