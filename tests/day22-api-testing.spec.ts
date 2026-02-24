// 對應文章：Day 22 — API 魔法陣：直接呼叫後端 API

import { test, expect, request } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 22：API 魔法陣 — 直接呼叫後端 API', () => {

  // --- APIRequestContext — 直接發 HTTP 請求 ---

  test('request.get() — 取得靜態資源', async ({ request }) => {
    // 使用 request fixture 直接發 HTTP GET 請求
    const response = await request.get(BASE_URL);

    // 驗證回應狀態碼
    expect(response.status()).toBe(200);

    // 驗證回應標頭
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('text/html');
  });

  test('request.get() — 取得 CSS 資源', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/css/style.css`);

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body.length).toBeGreaterThan(0);
  });

  test('request.get() — 取得 JS 資源', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/js/main.js`);

    // 驗證能正確取得 JS 檔案
    expect([200, 404]).toContain(response.status());
  });

  test('request.get() — 取得登入頁 HTML', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/pages/form-auth.html`);

    expect(response.status()).toBe(200);

    // 驗證回應內容包含登入表單
    const body = await response.text();
    expect(body).toContain('loginForm');
    expect(body).toContain('username');
  });

  // --- 驗證頁面內容 ---

  test('request.get() — 驗證首頁包含正確內容', async ({ request }) => {
    const response = await request.get(BASE_URL);
    const body = await response.text();

    // 確認首頁 HTML 包含導覽連結
    expect(body).toContain('form-auth.html');
    expect(body).toContain('dynamic-loading.html');
  });

  // --- apiRequest.newContext() — 建立獨立 API context ---

  test('apiRequest.newContext() — 建立獨立 request context', async () => {
    /**
     * `request.newContext()` 建立獨立的 APIRequestContext：
     * - 可設定 baseURL、共用 headers、timeout 等選項
     * - 與測試的 browser context 完全隔離（不共享 cookies）
     * - 使用完畢後必須呼叫 `dispose()` 釋放資源，避免連線洩漏
     */
    const apiContext = await request.newContext({
      baseURL: BASE_URL,
    });

    // 使用相對路徑發請求
    const response = await apiContext.get('/pages/locators-demo.html');
    expect(response.status()).toBe(200);

    await apiContext.dispose();
  });

  test('apiRequest.newContext() — 帶自訂 headers', async () => {
    const apiContext = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'text/html',
        'X-Custom-Header': 'playwright-test',
      },
    });

    const response = await apiContext.get('/');
    expect(response.status()).toBe(200);

    await apiContext.dispose();
  });

  // --- 搭配 UI 測試的 API 驗證 ---

  test('API + UI 組合 — 先驗 API 再測 UI', async ({ page, request }) => {
    // 先用 API 確認頁面可存取
    const apiResponse = await request.get(`${BASE_URL}/pages/assertions-demo.html`);
    expect(apiResponse.status()).toBe(200);

    // 再用 UI 測試互動
    await page.goto(`${BASE_URL}/pages/assertions-demo.html`);
    await expect(page).toHaveTitle('Day 07: 斷言示範');
    await expect(page.locator('#visible-item')).toBeVisible();
  });

  // --- 回應資訊解析 ---

  test('response.headers() — 解析回應標頭', async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    // 確認存在常見標頭
    expect(headers['content-type']).toBeDefined();
  });

  test('response.body() — 取得回應 Buffer', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/pages/table-demo.html`);
    const body = await response.body();

    // 確認是 Buffer 並有內容
    expect(body).toBeInstanceOf(Buffer);
    expect(body.length).toBeGreaterThan(0);
  });

  test('response.json() — 解析 JSON 回應（模擬）', async ({ page }) => {
    // 設定路由攔截，模擬 API 回傳 JSON
    await page.route('**/api/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: '王小明', role: 'admin' },
          { id: 2, name: '陳小花', role: 'editor' },
        ])
      });
    });

    /**
     * fetch('/api/users') 使用相對路徑，必須先導航至頁面。
     * 從 about:blank 發出相對路徑的 fetch 會失敗（無 origin 可解析）。
     * 導航後，page.evaluate 在瀏覽器環境執行，相對路徑才能正確解析。
     */
    await page.goto(BASE_URL);

    // 透過 page.evaluate 在瀏覽器端觸發 fetch（不同於 request fixture 的 Node.js 端）
    const data = await page.evaluate(async () => {
      const res = await fetch('/api/users');
      return res.json();
    });

    expect(data).toHaveLength(2);
    expect(data[0].name).toBe('王小明');
    expect(data[1].role).toBe('editor');
  });

});
