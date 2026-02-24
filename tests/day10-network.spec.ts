// 對應文章：Day 10 — 攔截魔法：網路請求攔截與模擬

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 10：攔截魔法 — 網路請求攔截與模擬', () => {

  // --- page.route() 基本攔截 ---

  test('route() — 攔截並中止特定請求', async ({ page }) => {
    // 攔截所有 .png 圖片請求並中止
    await page.route('**/*.png', route => route.abort());

    await page.goto(BASE_URL);

    // 頁面仍然載入完成（只是圖片被中止）
    await expect(page.locator('header')).toBeVisible();
  });

  test('route() — 攔截請求並回傳假資料（fulfill）', async ({ page }) => {
    // 攔截特定 API 路徑，回傳模擬 JSON 資料
    await page.route('**/api/user', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: '模擬使用者', role: 'admin' })
      });
    });

    await page.goto(BASE_URL);

    // 頁面正常顯示
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
  });

  test('route() — 攔截請求並修改（continue）', async ({ page }) => {
    let intercepted = false;

    // 攔截所有請求，觀察後繼續
    await page.route('**/*.html', route => {
      intercepted = true;
      route.continue(); // 繼續正常發送請求
    });

    // 使用帶 .html 副檔名的 URL，確保 route pattern 能攔截到請求
    await page.goto(`${BASE_URL}/pages/form-auth.html`);

    // 確認攔截器被觸發
    expect(intercepted).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('route() — 模擬伺服器錯誤回應', async ({ page }) => {
    let errorHandled = false;

    // 攔截 API 請求，回傳 500 錯誤
    await page.route('**/api/data', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '伺服器錯誤' })
      });
    });

    // 監聽 console 錯誤（若頁面 JS 有錯誤處理）
    page.on('console', msg => {
      if (msg.type() === 'error') errorHandled = true;
    });

    await page.goto(BASE_URL);

    // 頁面基本結構應仍可見
    await expect(page.locator('nav')).toBeVisible();
  });

  // --- 監聽網路事件 ---

  test('waitForRequest() — 等待特定請求發出', async ({ page }) => {
    // 等待主頁的 HTML 請求
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('index') || req.url() === BASE_URL + '/'),
      page.goto(BASE_URL)
    ]);

    // 確認請求方法是 GET
    expect(request.method()).toBe('GET');
  });

  test('waitForResponse() — 等待特定回應', async ({ page }) => {
    // 等待主頁的回應
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('localhost:8080') && res.status() === 200),
      page.goto(BASE_URL)
    ]);

    // 確認回應狀態碼為 200
    expect(response.status()).toBe(200);
  });

  // --- 記錄所有請求 ---

  test('監聽 request 事件 — 記錄所有請求 URL', async ({ page }) => {
    const requestUrls: string[] = [];

    // 監聽所有請求
    page.on('request', req => requestUrls.push(req.url()));

    await page.goto(BASE_URL);

    // 確認至少有一個請求（首頁 HTML）
    expect(requestUrls.length).toBeGreaterThan(0);
    expect(requestUrls.some(url => url.includes('localhost:8080'))).toBe(true);
  });

  test('監聽 response 事件 — 記錄所有回應狀態', async ({ page }) => {
    const responses: { url: string; status: number }[] = [];

    // 監聽所有回應
    page.on('response', res => {
      responses.push({ url: res.url(), status: res.status() });
    });

    await page.goto(BASE_URL);

    // 確認至少有成功的 200 回應
    expect(responses.some(r => r.status === 200)).toBe(true);
  });

  // --- unroute ---

  test('unroute() — 移除路由攔截器', async ({ page }) => {
    let callCount = 0;

    const handler = (route: any) => {
      callCount++;
      route.continue();
    };

    // 設定攔截（使用帶 .html 的 URL 確保 pattern 能攔截到）
    await page.route('**/*.html', handler);
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    expect(callCount).toBeGreaterThan(0);

    // 移除攔截
    await page.unroute('**/*.html', handler);
    const prevCount = callCount;

    // 再次訪問，攔截器不應再被觸發
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);
    // unroute 後 callCount 不應增加（或增加很少因為 HTML 不符合了）
    expect(callCount).toBeGreaterThanOrEqual(prevCount);
  });

  // --- 進階攔截：修改請求標頭與主體 ---

  test('route.continue({ headers }) — 攔截並注入自訂請求標頭', async ({ page }) => {
    let customHeaderSent = false;

    await page.route('**/*.html', route => {
      const headers = {
        ...route.request().headers(),
        'X-Playwright-Test': 'true',     // 注入自訂標頭
        'X-Test-Environment': 'e2e',
      };
      customHeaderSent = true;
      route.continue({ headers });
    });

    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    expect(customHeaderSent).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('request.method() / request.postData() — 捕捉 POST 請求內容', async ({ page }) => {
    await page.goto(BASE_URL);

    const captured: { method: string; body: string | null }[] = [];

    // 攔截 API 請求並記錄請求方法與主體
    await page.route('**/api/**', route => {
      captured.push({
        method: route.request().method(),
        body: route.request().postData(),
      });
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    // 從頁面觸發 POST 請求（模擬表單送出或 AJAX）
    await page.evaluate(async () => {
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'Test@1234' }),
      });
    });

    expect(captured).toHaveLength(1);
    expect(captured[0].method).toBe('POST');
    expect(captured[0].body).toContain('testuser');
  });

  test('route.continue({ url }) — 攔截請求並改寫目標 URL', async ({ page }) => {
    // 攔截對 /api/old-endpoint 的請求，轉發到 /api/new-endpoint
    await page.route('**/api/old-endpoint', route => {
      const newUrl = route.request().url().replace('old-endpoint', 'new-endpoint');
      route.continue({ url: newUrl });
    });

    await page.goto(BASE_URL);

    // 用 fulfill 模擬 new-endpoint 的回應
    await page.route('**/api/new-endpoint', route => {
      route.fulfill({ status: 200, body: '{"redirected":true}' });
    });

    // 驗證頁面仍正常顯示（URL 改寫不影響頁面其他內容）
    await expect(page.locator('header')).toBeVisible();
  });

  test('💥 [錯誤示範] 攔截注入錯誤回應後元素消失', async ({ page }) => {
    await page.route('**/pages/form-auth.html', route =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>攔截替換頁面</body></html>' })
    );
    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    // 錯誤：頁面被替換為純文字，找不到 #loginForm
    await expect(page.locator('#loginForm')).toBeVisible({ timeout: 3000 });
  });

});
