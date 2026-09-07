# pw-agents

Playwright 測試工程實作集：30 天系統化練習 + 一套可重用的無障礙（accessibility）測試標準。

## 內容

### `tests/` — 30 天 Playwright 實作

每天一個主題、一個 spec 檔，由淺入深涵蓋：

| 範圍 | 主題 |
|---|---|
| 基礎 | 設定檔、執行模式、locator 策略、actions、expect |
| 穩定性 | soft assertion、等待策略、動態載入 |
| 網路 | request 攔截、mock、network 斷言 |
| 認證 | 表單登入、storage state、auth state 重用 |
| 工程化 | 平行化、自訂 matcher、debug 技巧、test helpers |
| 無障礙 | axe 自動掃描 + 人工檢核 |

設定檔（`playwright.config.ts`）含完整中文註解：CI 下 forbidOnly / retries / 單 worker、
失敗自動截圖 + 錄影 + trace。

### `specs/` — 測試標準文件

- **accessibility-testing-standards** — 無障礙測試標準：哪些必須自動化（axe）、哪些必須人工
- **accessibility-review-checklist** — 可直接拿去跑 review 的檢核清單
- **cheat-sheet** — Playwright 速查表

## 執行

```sh
npm install
npx playwright install
npx playwright test                  # 全部
npx playwright test tests/day25-*    # 單一主題
npx playwright show-report           # HTML 報告
```
