// 對應文章：Day 25 — 無障礙法師：Accessibility Testing

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 25：無障礙法師 — Accessibility Testing', () => {

  // --- ARIA 與語意定位 ---

  test('getByRole() — 用 ARIA role 定位元素', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 用 role 定位按鈕（語意最強的定位方式）
    const loginBtn = page.getByRole('button', { name: '登入' });
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toBeEnabled();
  });

  test('getByRole("textbox") — 定位文字輸入框', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // textbox role 對應 input[type=text] 等
    const usernameInput = page.getByRole('textbox', { name: '使用者名稱' });
    await expect(usernameInput).toBeVisible();
  });

  test('getByLabel() — 透過 label 定位（最佳無障礙實踐）', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // getByLabel 反映了正確的 label-input 關聯
    await page.getByLabel('使用者名稱').fill('testuser');
    await page.getByLabel('密碼').fill('Test@1234');

    await expect(page.getByLabel('使用者名稱')).toHaveValue('testuser');
    await expect(page.getByLabel('密碼')).toHaveValue('Test@1234');
  });

  test('getByRole("link") — 定位所有連結', async ({ page }) => {
    await page.goto(BASE_URL);

    // 用 role=link 找到所有連結
    const links = page.getByRole('link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('getByRole("heading") — 定位標題', async ({ page }) => {
    await page.goto(BASE_URL);

    // 用 heading role 和 level 定位特定層級的標題
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Playwright 玩家攻略');
  });

  test('getByRole("navigation") — 定位導覽區域', async ({ page }) => {
    await page.goto(BASE_URL);

    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });

  // --- accessibility snapshot ---

  test('accessibility snapshot — 取得無障礙樹狀結構', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 取得整個頁面的 ARIA 快照（page.accessibility.snapshot() 已於 v1.42 移除）
    const snapshot = await page.locator('body').ariaSnapshot();

    // 確認快照不為 null 且有內容
    expect(snapshot).not.toBeNull();
    expect(snapshot.length).toBeGreaterThan(0);
  });

  test('accessibility snapshot — 確認按鈕名稱可被輔助技術識別', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 取得 ARIA 快照，確認「登入」按鈕名稱可被辨識
    const snapshot = await page.locator('body').ariaSnapshot();
    expect(snapshot).toContain('登入');

    // 同時用 role 斷言確認按鈕可被輔助技術定位
    await expect(page.getByRole('button', { name: '登入' })).toBeVisible();
  });

  test('accessibility snapshot — 確認輸入框有 label', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 用 getByLabel 確認輸入框可透過 label 定位（無障礙標準）
    const usernameInput = page.getByLabel('使用者名稱');
    const passwordInput = page.getByLabel('密碼');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // 確認 aria-label 不為空（每個輸入框都有可存取的名稱）
    expect(await usernameInput.getAttribute('aria-label')).toBeTruthy();
    expect(await passwordInput.getAttribute('aria-label')).toBeTruthy();
  });

  // --- 鍵盤可及性 ---

  test('鍵盤 Tab 鍵 — 可以 Tab 瀏覽所有互動元素', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 點擊 body 設定焦點起始點
    await page.locator('body').click();

    // Tab 到第一個可互動元素
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.id);

    // Tab 到第二個元素
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.id);

    // 確認 Tab 可以移動焦點
    expect(firstFocused).not.toBe(secondFocused);
  });

  test('鍵盤 Enter — 可以用 Enter 送出表單', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 用鍵盤填入表單並送出
    await page.getByLabel('使用者名稱').fill('testuser');
    await page.getByLabel('密碼').fill('Test@1234');
    await page.keyboard.press('Enter');

    // 驗證表單送出成功
    await expect(page.locator('#message')).toContainText('登入成功');
  });

  // --- data-testid 無障礙標準 ---

  test('data-testid — 驗證關鍵元素有測試 ID', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/locators-demo.html`);

    // 用 getByTestId 驗證元素標記符合規範
    await expect(page.getByTestId('locator-submit-btn')).toBeVisible();
    await expect(page.getByTestId('locator-cancel-btn')).toBeVisible();
  });

  test('img alt 屬性 — 圖片有替代文字', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/locators-demo.html`);

    // 所有圖片都應有 alt 屬性
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
      expect(alt).not.toBe('');
    }
  });

  // --- 焦點管理（Focus Management）---

  test('focus() / blur() — 焦點移入移出', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    const usernameInput = page.locator('#username');

    // 移入焦點
    await usernameInput.focus();
    const isFocused = await page.evaluate(() =>
      document.activeElement?.id === 'username'
    );
    expect(isFocused).toBe(true);

    // 移出焦點
    await usernameInput.blur();
    const isBlurred = await page.evaluate(() =>
      document.activeElement?.id !== 'username'
    );
    expect(isBlurred).toBe(true);
  });

  test('Tab 順序 — 驗證焦點依序流經所有互動元素', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 記錄 Tab 瀏覽的焦點順序
    const focusOrder: string[] = [];

    await page.locator('body').click();

    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      const activeId = await page.evaluate(() => document.activeElement?.id ?? '');
      if (activeId) focusOrder.push(activeId);
    }

    // 表單應有 username → password → submit 的焦點順序
    expect(focusOrder).toContain('username');
    expect(focusOrder).toContain('password');
    expect(focusOrder.indexOf('username')).toBeLessThan(focusOrder.indexOf('password'));
  });

  test('aria-describedby — 驗證輸入框有說明文字關聯', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 若元素有 aria-describedby，輔助技術會讀出關聯的說明文字
    // 此示範頁面用 aria-label；若有 aria-describedby 可用此方式驗證
    const usernameInput = page.locator('#username');

    // 驗證輸入框有可辨識的名稱（透過 aria-label 或 label 元素）
    const ariaLabel = await usernameInput.getAttribute('aria-label');
    const id = await usernameInput.getAttribute('id');

    // 有 aria-label 或者有對應的 <label for="..."> 都符合無障礙標準
    const hasAccessibleName = ariaLabel !== null ||
      await page.locator(`label[for="${id}"]`).count() > 0;

    expect(hasAccessibleName).toBe(true);
  });

  test('💥 [錯誤示範] getByRole 找不到頁面上不存在的角色', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    // 錯誤：頁面沒有 role="alertdialog" 的元素，逾時後斷言失敗
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3000 });
  });

});
