// 對應文章：Day 20 — 撰寫你自己的魔導書：Page Object Models

import { test, expect, type Page, type Locator } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

// =====================================================
// HomePage — 首頁的 Page Object Model
// =====================================================

/**
 * 首頁的 Page Object Model
 *
 * 示範多個 POM 協同運作：HomePage → LoginPage → SecurePage
 * 各自封裝自己的定位器與操作，彼此透過 page 物件串聯
 */
class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('header h1');
    this.loginLink = page.locator('nav a[href="pages/form-auth.html"]');
  }

  async goto() {
    await this.page.goto(BASE_URL);
  }

  /** 點擊導覽列的「登入」連結，導向登入頁 */
  async navigateToLogin() {
    await this.loginLink.click();
    await this.page.waitForURL(/form-auth/);
  }
}

// =====================================================
// LoginPage — 登入頁面的 Page Object Model
// =====================================================

/**
 * 登入頁面的 Page Object Model
 *
 * POM 模式的核心概念：將「頁面定位器」與「操作方法」封裝在同一個類別中，
 * 讓測試程式碼只需描述「做什麼」，不需關心「怎麼定位元素」。
 *
 * 優點：
 * - 定位器集中管理，HTML 改版只需修改 POM，不必逐一修改測試
 * - 組合方法（如 `login()`）消除測試間的重複程式碼
 * - 測試可讀性大幅提升
 */
class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  /** 失敗訊息（帶有 .error class 的 #message） */
  readonly errorMessage: Locator;
  /** 成功訊息（帶有 .success class 的 #message） */
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('#message.error');
    this.successMessage = page.locator('#message.success');
  }

  /** 導航到登入頁面 */
  async goto() {
    await this.page.goto(`${BASE_URL}/pages/form-auth`);
  }

  /**
   * 填入使用者名稱
   * @param username - 使用者名稱
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * 填入密碼
   * @param password - 密碼
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /** 點擊送出按鈕 */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * 組合方法：一次完成整個登入流程（填帳號 → 填密碼 → 送出）
   * @param username - 使用者名稱
   * @param password - 密碼
   */
  async login(username: string, password: string) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }

  /** 取得成功訊息的 Locator */
  getSuccessMessage(): Locator {
    return this.successMessage;
  }

  /** 取得錯誤訊息的 Locator */
  getErrorMessage(): Locator {
    return this.errorMessage;
  }

  /** 等待頁面跳轉到 secure 頁面（登入成功後約 2 秒跳轉） */
  async waitForSecurePage() {
    await this.page.waitForURL(/.*secure.*/);
  }
}

// =====================================================
// SecurePage — 安全頁面（登入後）的 Page Object Model
// =====================================================

/**
 * 登入後安全頁面（secure.html）的 Page Object Model
 *
 * 注意：登出按鈕點擊後會彈出原生 alert，
 * `logout()` 方法已使用 `page.once('dialog', ...)` 自動接受。
 */
class SecurePage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('h1');
    this.logoutButton = page.locator('#logoutBtn');
  }

  /** 取得歡迎訊息的 Locator */
  getWelcomeMessage(): Locator {
    return this.welcomeMessage;
  }

  /**
   * 執行登出並等待跳回登入頁面
   *
   * 登出按鈕點擊後會觸發原生 `alert('已登出')`，
   * 使用 `page.once('dialog', ...)` 預先註冊一次性處理器來自動接受。
   * `once` 只處理下一個 dialog 事件，不影響後續測試的 dialog 行為。
   */
  async logout() {
    this.page.once('dialog', dialog => dialog.accept());
    await this.logoutButton.click();
    await this.page.waitForURL(/.*form-auth.*/);
  }

  /** 斷言目前頁面 URL 包含 'secure' */
  async verifyOnSecurePage() {
    await expect(this.page).toHaveURL(/.*secure.*/);
  }
}

// =====================================================
// 測試套件：使用 POM 撰寫測試
// =====================================================
test.describe('Day 20：撰寫你自己的魔導書 — Page Object Models', () => {

  // 測試 1：成功登入
  test('使用 POM — 成功登入流程', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const securePage = new SecurePage(page);

    await loginPage.goto();
    await loginPage.login('testuser', 'Test@1234');
    await loginPage.waitForSecurePage();

    await expect(securePage.getWelcomeMessage()).toContainText('登入成功');
  });

  // 測試 2：失敗登入
  test('使用 POM — 錯誤密碼登入失敗', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('testuser', 'wrongpassword');

    await expect(loginPage.getErrorMessage()).toBeVisible();
    await expect(loginPage.getErrorMessage()).toContainText('錯誤');
  });

  // 測試 3：帳號不存在
  test('使用 POM — 帳號不存在登入失敗', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.fillUsername('nonexistent');
    await loginPage.fillPassword('Test@1234');
    await loginPage.submit();

    await expect(loginPage.getErrorMessage()).toBeVisible();
  });

  // 測試 4：成功登入後執行登出
  test('使用 POM — 成功登入後登出', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const securePage = new SecurePage(page);

    await loginPage.goto();
    await loginPage.login('testuser', 'Test@1234');
    await loginPage.waitForSecurePage();

    await securePage.verifyOnSecurePage();
    await securePage.logout();

    await expect(page).toHaveURL(/.*form-auth.*/);
  });

  // 測試 5：分步填入並驗證欄位
  test('使用 POM — 分步填入欄位', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // 分步填入（展示 POM 各方法的獨立使用）
    await loginPage.fillUsername('testuser');
    await expect(loginPage.usernameInput).toHaveValue('testuser');

    await loginPage.fillPassword('Test@1234');
    await expect(loginPage.passwordInput).toHaveValue('Test@1234');

    await loginPage.submit();
    await loginPage.waitForSecurePage();
    await expect(page).toHaveURL(/.*secure.*/);
  });

  // 測試 6：多 POM 協同 — HomePage → LoginPage → SecurePage
  test('多 POM 協同 — 從首頁導航到安全頁面完整流程', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const securePage = new SecurePage(page);

    // 1. 首頁 POM：導航並驗證
    await homePage.goto();
    await expect(homePage.heading).toContainText('Playwright 玩家攻略');

    // 2. 透過首頁導覽到登入頁
    await homePage.navigateToLogin();

    // 3. 登入頁 POM：執行登入
    await loginPage.login('admin', 'Admin@1234');
    await loginPage.waitForSecurePage();

    // 4. 安全頁 POM：驗證狀態並登出
    await securePage.verifyOnSecurePage();
    await expect(securePage.getWelcomeMessage()).toContainText('登入成功');
    await securePage.logout();

    // 驗證回到登入頁
    await expect(page).toHaveURL(/form-auth/);
  });

  test('💥 [錯誤示範] POM — 錯誤密碼後斷言跳轉到安全頁面', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('testuser', 'WrongPassword!');
    // 錯誤：密碼錯誤不會跳轉，但斷言已到達 secure 頁面
    await expect(page).toHaveURL(/secure/, { timeout: 3000 });
  });
});