// 對應文章：Day 30 — 魔王關：綜合演練與最佳實踐

import { test as base, expect, type Page, type Locator } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:8080';

// =====================================================
// 綜合運用：POM + Fixtures + 自訂 Matchers
// =====================================================

// --- Page Object Models ---

class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navLinks: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('header h1');
    this.navLinks = page.locator('nav .nav-list a');
    this.footer = page.locator('footer');
  }

  async goto() {
    await this.page.goto(BASE_URL);
  }

  async getNavLinkCount(): Promise<number> {
    return this.navLinks.count();
  }

  async clickNavLink(text: string) {
    await this.navLinks.filter({ hasText: text }).click();
  }
}

class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly message: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.message = page.locator('#message');
  }

  async goto() {
    await this.page.goto(`${BASE_URL}/pages/form-auth.html`);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoginSuccess() {
    await expect(this.message).toContainText('登入成功');
    await expect(this.message).toHaveClass(/success/);
  }

  async expectLoginFailure() {
    await expect(this.message).toContainText('登入失敗');
    await expect(this.message).toHaveClass(/error/);
  }
}

// --- 自訂 Fixtures ---
type AppFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
};

const test = base.extend<AppFixtures>({
  homePage: async ({ page }, use) => {
    const hp = new HomePage(page);
    await hp.goto();
    await use(hp);
  },
  loginPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.goto();
    await use(lp);
  },
});

// =====================================================
// Day 30：魔王關 — 綜合演練
// =====================================================
test.describe('Day 30：魔王關 — 綜合演練與最佳實踐', () => {

  // --- 關卡 1：首頁完整驗證 ---

  test('關卡 1 — 首頁基本結構驗證', async ({ homePage }) => {
    // 使用 POM + Fixture
    await expect(homePage.heading).toContainText('Playwright 玩家攻略');
    await expect(homePage.footer).toBeVisible();

    const linkCount = await homePage.getNavLinkCount();
    expect(linkCount).toBeGreaterThanOrEqual(9);
  });

  // --- 關卡 2：登入流程完整驗證 ---

  test('關卡 2 — 完整登入登出流程', async ({ loginPage, page }) => {
    // 成功登入
    await loginPage.login('testuser', 'Test@1234');
    await loginPage.expectLoginSuccess();

    // 等待跳轉
    await page.waitForURL(/secure/, { timeout: 5000 });
    await expect(page).toHaveURL(/secure/);
    await expect(page.locator('h1')).toContainText('登入成功');

    // 登出
    page.on('dialog', dialog => dialog.accept());
    await page.locator('#logoutBtn').click();
    await page.waitForURL(/form-auth/, { timeout: 5000 });
    await expect(page).toHaveURL(/form-auth/);
  });

  test('關卡 2 — 多帳號登入驗證', async ({ loginPage }) => {
    // testuser
    await loginPage.login('testuser', 'Test@1234');
    await loginPage.expectLoginSuccess();

    await loginPage.goto();
    await loginPage.login('admin', 'Admin@1234');
    await loginPage.expectLoginSuccess();

    await loginPage.goto();
    await loginPage.login('wronguser', 'wrong');
    await loginPage.expectLoginFailure();
  });

  // --- 關卡 3：動態內容處理 ---

  test('關卡 3 — 動態載入完整流程', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);

    // soft assert 批次驗證初始狀態
    await expect.soft(page.locator('#startBtn')).toBeVisible();
    await expect.soft(page.locator('#content')).toBeHidden();
    await expect.soft(page.locator('#loading')).toBeHidden();

    // 觸發載入
    await page.locator('#startBtn').click();

    // 等待完成
    await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#content h2')).toHaveText('🎉 Hello World!');
  });

  // --- 關卡 4：表格操作 ---

  test('關卡 4 — 表格篩選與操作', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/table-demo.html`);

    // 驗證表格資料
    await expect(page.locator('#table-body tr')).toHaveCount(5);
    await expect(page.locator('#total-count')).toHaveText('5');

    // 找到停用使用者
    const inactiveRow = page.locator('#table-body tr').filter({
      has: page.locator('.inactive-status')
    });
    await expect(inactiveRow).toHaveCount(1);
    await expect(inactiveRow.locator('.user-name')).toHaveText('李阿德');

    // 點擊編輯
    await inactiveRow.locator('.edit-btn').click();
    await expect(page.locator('#status-bar')).toContainText('李阿德');
  });

  // --- 關卡 5：網路攔截 ---

  test('關卡 5 — 網路攔截與模擬', async ({ page }) => {
    let requestCount = 0;

    // 監聽所有 HTML 請求（需使用帶 .html 的 URL 才能觸發 route pattern）
    await page.route('**/*.html', route => {
      requestCount++;
      route.continue();
    });

    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    expect(requestCount).toBeGreaterThan(0);

    // 模擬 API 回應
    await page.route('**/api/config', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ version: '1.0.0', env: 'test' })
      });
    });

    const config = await page.evaluate(async () => {
      const res = await fetch('/api/config');
      return res.json();
    });

    expect(config.env).toBe('test');
  });

  // --- 關卡 6：截圖與視覺 ---

  test('關卡 6 — 截圖保存重要頁面', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/complex-dom.html`);

    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot.length).toBeGreaterThan(0);

    // 驗證元素截圖
    const gridShot = await page.locator('.product-grid').screenshot();
    expect(gridShot).toBeInstanceOf(Buffer);
  });

  // --- 關卡 7：最佳實踐總整理 ---

  test('關卡 7 — 最佳實踐：語意定位優先', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // ✅ 優先使用語意定位
    const username = page.getByLabel('使用者名稱');        // getByLabel
    const password = page.getByLabel('密碼');               // getByLabel
    const loginBtn = page.getByRole('button', { name: '登入' }); // getByRole

    await expect(username).toBeVisible();
    await expect(password).toBeVisible();
    await expect(loginBtn).toBeEnabled();

    // ✅ 填入與驗證
    await username.fill('testuser');
    await password.fill('Test@1234');
    await expect(username).toHaveValue('testuser');

    await loginBtn.click();
    await expect(page.locator('#message')).toContainText('登入成功');
  });

  test('關卡 7 — 最佳實踐：avoid hard waits', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);

    await page.locator('#startBtn').click();

    // ✅ 使用 expect() 等待（內建 auto-retry）
    // ❌ 不要用 page.waitForTimeout(3000)
    await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#loading')).toBeHidden({ timeout: 10000 });
  });

  test('關卡 7 — 最佳實踐：Soft Assert 批次驗證', async ({ page }) => {
    await page.goto(BASE_URL);

    // ✅ 用 soft assert 一次驗證多個非關鍵斷言
    await expect.soft(page.locator('header')).toBeVisible();
    await expect.soft(page.locator('nav')).toBeVisible();
    await expect.soft(page.locator('footer')).toBeVisible();
    await expect.soft(page.locator('footer')).toContainText('Playwright');

    // ✅ 關鍵斷言用一般 expect（失敗立刻中斷）
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
  });

});
