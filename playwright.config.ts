/**
 * Playwright 測試設定檔
 *
 * 說明：
 * - testDir     測試檔案目錄
 * - fullyParallel 所有 spec 檔案之間完全並行執行
 * - forbidOnly  CI 環境下禁止 test.only（避免意外留在 CI）
 * - retries     CI 環境失敗自動重試 2 次；本地開發不重試
 * - workers     CI 環境限制為單一 worker 避免資源競爭
 * - reporter    測試報告輸出格式（html → playwright-report/）
 * - baseURL     測試網站基底 URL（使用 `page.goto('/')` 即可）
 * - screenshot  測試失敗時截圖，保存於 test-results/
 * - video       測試失敗時保留錄影，通過則自動刪除
 * - trace       測試失敗時保留執行軌跡（可用 npx playwright show-trace 查看）
 *
 * 詳細文件：https://playwright.dev/docs/test-configuration
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* 所有 spec 檔案之間完全並行執行，加速整體測試時間 */
  fullyParallel: true,

  /* CI 環境下若有 test.only 殘留則視為建置失敗 */
  forbidOnly: !!process.env.CI,

  /* CI 失敗自動重試 2 次；本地開發不重試 */
  retries: process.env.CI ? 2 : 0,

  /* CI 環境限制單一 worker 避免資源競爭；本地則自動決定 */
  workers: process.env.CI ? 1 : undefined,

  /* 輸出 HTML 報告至 playwright-report/ 目錄 */
  reporter: 'html',

  use: {
    /* 測試網站基底 URL，使用 page.goto('/') 即可導航至首頁 */
    baseURL: 'http://localhost:8080',

    /* 測試失敗時自動截圖，保存於 test-results/ 目錄 */
    screenshot: 'only-on-failure',

    /* 測試失敗時保留錄影，通過則自動刪除 */
    video: 'retain-on-failure',

    /* 測試失敗時保留 trace，可用 `npx playwright show-trace` 查看完整執行軌跡 */
    trace: 'retain-on-failure',
  },

  /* 設定執行的瀏覽器 projects */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // 使用系統安裝的 Google Chrome（封閉網路環境適用）
      },
    },
    // webkit 停用 — 需下載額外 binary，封閉網路環境請預裝後再啟用
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
