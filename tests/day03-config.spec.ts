// 對應文章：Day 03 — 初始化專案與 config 神器

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 03：config 神器 — 驗證 Playwright 設定的實際效果', () => {

  test('baseURL 設定正確 — 能訪問首頁', async ({ page }) => {
    // 使用完整 URL 訪問（示範 baseURL 概念）
    await page.goto(BASE_URL);

    // 驗證頁面已成功載入
    await expect(page).toHaveURL(BASE_URL + '/');
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');

    // 輸出目前 URL 供參考
    console.log('目前 baseURL：', page.url());
    test.info().annotations.push({
      type: 'baseURL',
      description: `測試網站位址：${page.url()}`,
    });
  });

  test('testDir 設定 — 所有測試檔案都在 tests/ 目錄', async ({ page }) => {
    // 說明：playwright.config.ts 中 testDir: './tests'
    // 這個測試本身就在 tests/ 目錄，能夠執行即代表 testDir 設定正確
    test.info().annotations.push({
      type: 'testDir',
      description: '測試檔案目錄：./tests — 設定正確，此測試能執行即為佐證',
    });

    await page.goto(BASE_URL);
    await expect(page.locator('h1')).toContainText('Playwright 玩家攻略');
  });

  test('reporter 設定 — html reporter 產出報告', async ({ page }) => {
    // 說明：playwright.config.ts 中 reporter: 'html'
    // 每次 npx playwright test 後會在 playwright-report/ 產出 HTML 報告
    test.info().annotations.push({
      type: 'reporter',
      description: '使用 HTML Reporter — 執行後可在 playwright-report/index.html 查看報告',
    });
    console.log('Reporter: html — 測試報告將輸出至 playwright-report/');

    await page.goto(BASE_URL);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('fullyParallel 設定 — 檔案間並行執行', async ({ page }) => {
    // 說明：playwright.config.ts 中 fullyParallel: true
    // 所有 spec 檔案會同時並行執行，加快測試速度
    test.info().annotations.push({
      type: 'fullyParallel',
      description: 'fullyParallel: true — 所有 spec 檔案並行執行，提升效率',
    });
    console.log('fullyParallel: true — 測試並行執行中');

    await page.goto(`${BASE_URL}/pages/form-auth.html`);
    await expect(page.locator('#username')).toBeVisible();
  });

  test('retries 設定 — CI 環境自動重試', async ({ page }) => {
    // 說明：playwright.config.ts 中 retries: process.env.CI ? 2 : 0
    // 在 CI 環境失敗時自動重試 2 次；本地開發不重試
    const retries = process.env.CI ? 2 : 0;
    test.info().annotations.push({
      type: 'retries',
      description: `retries: ${retries} — 目前環境：${process.env.CI ? 'CI' : '本地開發'}`,
    });
    console.log(`retries 設定：${retries}（環境：${process.env.CI ? 'CI' : '本地'}）`);

    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`);
    await expect(page.locator('#startBtn')).toBeVisible();
  });

  test('projects 設定 — 多瀏覽器專案', async ({ page, browserName }) => {
    // 說明：playwright.config.ts 的 projects 設定了 chromium 與 webkit
    // 每個測試會在各個 project 中分別執行
    test.info().annotations.push({
      type: 'project',
      description: `目前 project 瀏覽器：${browserName}`,
    });
    console.log(`目前執行於 project：${browserName}`);

    await page.goto(BASE_URL);
    await expect(page).toHaveTitle('Playwright 玩家攻略 — 測試網站');
  });

  test('trace 設定 — 失敗時收集 trace', async ({ page }) => {
    // 說明：playwright.config.ts 中 trace: 'on-first-retry'
    // 第一次重試時自動收集 trace，可用 npx playwright show-trace 查看
    test.info().annotations.push({
      type: 'trace',
      description: "trace: 'on-first-retry' — 失敗重試時自動收集執行軌跡",
    });
    console.log("trace: 'on-first-retry' — 失敗重試時會收集 trace 檔案");

    await page.goto(`${BASE_URL}/pages/locators-demo.html`);
    await expect(page.locator('h1')).toContainText('元素定位術示範');
  });

  test('timeout 設定 — test.setTimeout() 覆蓋全域逾時', async ({ page }) => {
    // playwright.config.ts 可設定全域 timeout（預設 30000ms）
    // 用 test.setTimeout() 可針對單一測試覆蓋（例如需等待慢速資源）
    test.setTimeout(10000); // 此測試最多等 10 秒

    test.info().annotations.push({
      type: 'timeout',
      description: 'test.setTimeout(10000) — 覆蓋全域 timeout，此測試最多 10 秒',
    });

    await page.goto(`${BASE_URL}/pages/dynamic-loading.html`, { timeout: 8000 });
    await expect(page.locator('#startBtn')).toBeVisible();
  });

  test('forbidOnly 設定 — 防止 test.only 進入 CI', async ({ page }) => {
    // playwright.config.ts：forbidOnly: !!process.env.CI
    // CI 環境下若有 test.only 殘留，整個 build 視為失敗
    // 本地開發 forbidOnly 為 false，允許 test.only 用於快速除錯
    const isCI = !!process.env.CI;

    test.info().annotations.push({
      type: 'forbidOnly',
      description: `forbidOnly: ${isCI} — 目前環境：${isCI ? 'CI（有 .only 會失敗）' : '本地（允許 .only）'}`,
    });
    console.log(`forbidOnly: ${isCI}（CI: ${isCI}）`);

    await page.goto(BASE_URL);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('workers 設定 — 並行 worker 數量', async ({}, testInfo) => {
    // playwright.config.ts：workers: process.env.CI ? 1 : undefined
    // CI 環境限制單一 worker 避免資源競爭；本地由系統自動決定（通常等於 CPU 核數）
    const isCI = !!process.env.CI;

    test.info().annotations.push({
      type: 'workers',
      description: `workers: ${isCI ? '1（CI 單一 worker）' : 'auto（本地多核心）'}，目前 workerIndex: ${testInfo.workerIndex}`,
    });
    console.log(`此測試在 worker #${testInfo.workerIndex} 執行`);

    // workerIndex 是 0-based，型別應為 number
    expect(typeof testInfo.workerIndex).toBe('number');
    expect(testInfo.workerIndex).toBeGreaterThanOrEqual(0);
  });

  test('💥 [錯誤示範] URL 斷言錯誤 — 首頁 URL 不含 /admin', async ({ page }) => {
    await page.goto(BASE_URL);
    // 錯誤：首頁 URL 不含 /admin 路徑，toHaveURL 正則不符
    await expect(page).toHaveURL(/\/admin/);
  });

});
