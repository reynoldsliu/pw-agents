# pw-agents

> A 30-day Playwright practice set (following an iThome Ironman series) plus my own accessibility testing standards and review checklists.

**學 Playwright 自動化測試的 30 天練習，加上一套我自己寫的無障礙測試規範。**

> **出處聲明**
> `tests/` 的 30 天實作是跟隨 [iThome 鐵人賽系列文章](https://ithelp.ithome.com.tw/users/20168913/ironman/8506)
> 的練習，著作權歸原作者，這裡只是我的學習紀錄。
> `specs/` 的無障礙測試標準、review checklist 與速查表是**我自己寫的**。

---

## `specs/` — 無障礙測試規範（原創）

「這個網站身障者能不能用」不是靠感覺判斷的。這份規範把它拆成可執行的規則，
用在 Angular + PrimeNG 的專案上：

- **[測試標準](specs/accessibility-testing-standards-20260224v1.1.md)** —
  哪些可以自動掃（axe）、哪些一定要人工看；`data-testid` 為主要定位屬性、
  `aria-*` 為輔的策略與命名規範；PrimeNG 元件、動態與巢狀結構怎麼標
- **[Review checklist](specs/accessibility-review-checklist-20260224v1.1.md)** —
  可以直接拿去跑 code review 的檢查清單
- **[速查表](specs/cheat-sheet-20260224v1.1.md)** — Playwright 常用語法

## `tests/` — 30 天 Playwright 練習

每天一個主題、一支測試檔，從基礎到工程化：

| 範圍 | 學到什麼 |
|---|---|
| 基礎 | 設定檔、執行模式、怎麼精準抓到元素（locator）、操作與斷言 |
| 穩定性 | soft assertion、等待策略、動態載入的頁面怎麼測 |
| 網路 | 攔截 request、mock 回應、驗證網路行為 |
| 認證 | 表單登入、儲存登入狀態並重複使用（不用每個測試都登入一次） |
| 工程化 | 平行執行、自訂斷言、debug 技巧、共用 helper |
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

設定檔（`playwright.config.ts`）含完整中文註解：CI 環境下禁止 `test.only`、
失敗自動重試、單 worker 避免資源競爭；測試失敗時自動留下截圖、錄影與執行軌跡（trace）。

## 執行

```sh
npm install
npx playwright install     # 下載瀏覽器
npx playwright test        # 全部跑一遍
npx playwright test tests/day25-*   # 只跑某一天
npx playwright show-report          # 開啟 HTML 報告
```

MIT License（`specs/` 為原創內容；`tests/` 為跟隨教學的練習）
