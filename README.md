# pw-agents

> A 30-day Playwright practice set (following an iThome Ironman series) plus my own accessibility testing standards and review checklists.

> **出處聲明**：`tests/` 的 30 天實作是跟隨 iThome 鐵人賽系列文章的練習（[原系列文章](https://ithelp.ithome.com.tw/users/20168913/ironman/8506)，著作權歸原作者），僅供學習紀錄；
> `specs/` 的無障礙測試標準、review checklist 與速查表為本人原創。

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

### 逐日索引

| Day | Spec | 主題 |
|---|---|---|
| 01 | [intro](tests/day01-intro.spec.ts) | Playwright 初探 |
| 02 | [comparison](tests/day02-comparison.spec.ts) | 與其他框架比較 |
| 03 | [config](tests/day03-config.spec.ts) | 設定檔詳解 |
| 04 | [run-modes](tests/day04-run-modes.spec.ts) | 執行模式 |
| 05 | [locators](tests/day05-locators.spec.ts) | Locator 策略 |
| 06 | [actions](tests/day06-actions.spec.ts) | 操作 Actions |
| 07 | [expect](tests/day07-expect.spec.ts) | 斷言 expect |
| 08 | [soft-assert](tests/day08-soft-assert.spec.ts) | Soft assertion |
| 09 | [wait-strategies](tests/day09-wait-strategies.spec.ts) | 等待策略 |
| 10 | [network](tests/day10-network.spec.ts) | 網路攔截與 mock |
| 11 | [dynamic-loading](tests/day11-dynamic-loading.spec.ts) | 動態載入 |
| 12 | [form-auth](tests/day12-form-auth.spec.ts) | 表單登入 |
| 13 | [keyboard-mouse](tests/day13-keyboard-mouse.spec.ts) | 鍵盤與滑鼠 |
| 14 | [table](tests/day14-table.spec.ts) | table |
| 15 | [complex-dom](tests/day15-complex-dom.spec.ts) | complex dom |
| 16 | [file-upload-download](tests/day16-file-upload-download.spec.ts) | file upload download |
| 17 | [dialogs](tests/day17-dialogs.spec.ts) | dialogs |
| 18 | [expect-poll](tests/day18-expect-poll.spec.ts) | expect poll |
| 19 | [multi-tab](tests/day19-multi-tab.spec.ts) | multi tab |
| 20 | [pom](tests/day20-pom.spec.ts) | pom |
| 21 | [fixtures](tests/day21-fixtures.spec.ts) | Fixtures |
| 22 | [api-testing](tests/day22-api-testing.spec.ts) | API 測試 |
| 23 | [screenshots](tests/day23-screenshots.spec.ts) | 截圖比對 |
| 24 | [storage-state](tests/day24-storage-state.spec.ts) | Storage state |
| 25 | [accessibility](tests/day25-accessibility.spec.ts) | 無障礙掃描 |
| 26 | [parallel](tests/day26-parallel.spec.ts) | 平行化 |
| 27 | [auth-state](tests/day27-auth-state.spec.ts) | Auth state 重用 |
| 28 | [debug](tests/day28-debug.spec.ts) | Debug 技巧 |
| 29 | [custom-matchers](tests/day29-custom-matchers.spec.ts) | 自訂 matcher |
| 30 | [review](tests/day30-review.spec.ts) | 總複習 |

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
