// 對應文章：Day 28 — 偵探模式：偵錯技巧大全

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 28：偵探模式 — 偵錯技巧大全', () => {

  // --- console 訊息監聽 ---

  test('監聽 console.log — 捕捉頁面日誌', async ({ page }) => {
    const consoleLogs: string[] = [];

    // 監聽所有 console 事件
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await page.goto(BASE_URL);

    // 手動觸發 console.log
    await page.evaluate(() => console.log('偵錯訊息：頁面已載入'));

    // 驗證 console 訊息被捕捉
    expect(consoleLogs.some(log => log.includes('偵錯訊息'))).toBe(true);
  });

  test('監聽 console.error — 捕捉頁面錯誤', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(BASE_URL);

    // 觸發 console.error
    await page.evaluate(() => console.error('模擬錯誤訊息'));

    expect(errors.some(e => e.includes('模擬錯誤'))).toBe(true);
  });

  // --- page error 監聽 ---

  test('監聽 pageerror — 捕捉 JavaScript 例外', async ({ page }) => {
    const pageErrors: Error[] = [];

    // 監聽未捕捉的 JS 例外
    page.on('pageerror', error => pageErrors.push(error));

    await page.goto(BASE_URL);

    // 正常頁面不應有 JS 錯誤
    expect(pageErrors.length).toBe(0);
  });

  // --- evaluate 偵錯 ---

  test('evaluate() — 在瀏覽器端執行偵錯程式碼', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/table-demo.html`);

    // 使用 evaluate 直接查詢 DOM 狀態
    const tableInfo = await page.evaluate(() => {
      const table = document.getElementById('user-table');
      const rows = table?.querySelectorAll('tbody tr');
      return {
        exists: !!table,
        rowCount: rows?.length ?? 0,
        firstUserName: rows?.[0]?.querySelector('.user-name')?.textContent ?? '',
      };
    });

    expect(tableInfo.exists).toBe(true);
    expect(tableInfo.rowCount).toBe(5);
    expect(tableInfo.firstUserName).toBe('王小明');
  });

  test('evaluate() — 讀取 CSS 計算樣式', async ({ page }) => {
    await page.goto(BASE_URL);

    // 讀取元素的計算樣式
    const headerStyle = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return null;
      const style = getComputedStyle(header);
      return {
        display: style.display,
        position: style.position,
      };
    });

    expect(headerStyle).not.toBeNull();
    expect(headerStyle?.display).not.toBe('none');
  });

  // --- locator.boundingBox() ---

  test('boundingBox() — 取得元素的位置與大小', async ({ page }) => {
    await page.goto(BASE_URL);

    // 取得 header 的邊界框
    const bounds = await page.locator('header').boundingBox();

    expect(bounds).not.toBeNull();
    expect(bounds?.width).toBeGreaterThan(0);
    expect(bounds?.height).toBeGreaterThan(0);
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect(bounds?.y).toBeGreaterThanOrEqual(0);
  });

  test('boundingBox() — 確認元素在視窗內', async ({ page }) => {
    await page.goto(BASE_URL);

    const viewportSize = page.viewportSize();
    const navBounds = await page.locator('nav').boundingBox();

    if (navBounds && viewportSize) {
      // 元素左側不應超出視窗
      expect(navBounds.x).toBeGreaterThanOrEqual(0);
      // 元素頂部不應超出視窗
      expect(navBounds.y).toBeGreaterThanOrEqual(0);
    }
  });

  // --- waitForSelector 超時偵錯 ---

  test('waitForSelector() — 用較長 timeout 偵錯載入問題', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);
    await page.locator('#startBtn').click();

    // 若元素遲遲未出現，增加 timeout 以觀察載入行為
    await page.waitForSelector('#content.show', {
      state: 'visible',
      timeout: 10000  // 設定較長 timeout
    });

    await expect(page.locator('#content')).toBeVisible();
  });

  // --- page.pause() 注意事項（僅展示，不實際呼叫）---

  test('page.pause() 說明 — 互動式偵錯（僅在 headed 模式使用）', async ({ page }) => {
    await page.goto(BASE_URL);

    // page.pause() 會暫停測試執行，開啟 Playwright Inspector
    // 僅在 PWDEBUG=1 或 --headed 模式下使用，CI 中不呼叫
    // await page.pause(); // ← 實際偵錯時取消註解

    // 這裡用斷言代替暫停
    await expect(page.locator('header')).toBeVisible();
  });

  // --- Trace Viewer ---

  test('Trace 說明 — 設定 trace: "on" 蒐集追蹤記錄', async ({ page }) => {
    // Trace 設定在 playwright.config.ts 的 use.trace 選項
    // - 'off': 不蒐集
    // - 'on': 永遠蒐集
    // - 'retain-on-failure': 失敗時保留
    // - 'on-first-retry': 第一次重試時蒐集

    await page.goto(BASE_URL);

    // 此測試示範 trace 設定的用途
    // 執行 `npx playwright show-trace trace.zip` 可查看追蹤記錄
    await expect(page.locator('nav')).toBeVisible();
  });

  // --- 截圖輔助偵錯 ---

  test('screenshot() — 測試失敗前截圖保存現場', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/complex-dom.html`);

    try {
      // 嘗試找一個不存在的元素（模擬測試失敗場景）
      await expect(page.locator('#non-existent')).toBeVisible({ timeout: 1000 });
    } catch (e) {
      // 失敗時截圖保存現場
      await page.screenshot({ path: 'test-results/debug-screenshot.png' });
      // 繼續（因為這只是示範）
    }

    // 正常的斷言
    await expect(page.locator('.product-card')).toHaveCount(3);
  });

  // --- 元素狀態偵查 ---

  test('isVisible() / isEnabled() — 即時查詢元素狀態', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/assertions-demo.html`);

    // 即時查詢（不等待，立刻回傳目前狀態）
    const visibleResult = await page.locator('#visible-item').isVisible();
    const hiddenResult = await page.locator('#hidden-item').isVisible();
    const enabledResult = await page.locator('#enabled-btn').isEnabled();
    const disabledResult = await page.locator('#disabled-btn').isEnabled();

    expect(visibleResult).toBe(true);
    expect(hiddenResult).toBe(false);
    expect(enabledResult).toBe(true);
    expect(disabledResult).toBe(false);
  });

});
