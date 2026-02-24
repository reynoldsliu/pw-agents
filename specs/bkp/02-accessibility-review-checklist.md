# 前端無障礙程式碼 Code Review 檢查表

> **搭配文件**：`accessibility-testing-standards.md`  
> **使用時機**：每次 Code Review 時，依本表逐項檢核  
> **版本**：v1.0

---

## 使用說明

- 每個 PR/MR 提交前，開發者先自行檢核
- Code Reviewer 依本表確認是否符合規範
- 標示說明：`[ ]` 待檢核、`[x]` 通過、`[N/A]` 不適用

---

## 一、data-testid 基本檢核

- [ ] **1.1** 所有按鈕（`<button>`、`pButton`）是否都有 `data-testid`？
- [ ] **1.2** 所有輸入框（`<input>`、`pInputText`、`<textarea>`）是否都有 `data-testid`？
- [ ] **1.3** 所有下拉選單（`<select>`、`p-dropdown`、`p-multiSelect`）是否都有 `data-testid`？
- [ ] **1.4** 所有核取方塊、單選按鈕（`p-checkbox`、`p-radioButton`）是否都有 `data-testid`？
- [ ] **1.5** 所有切換元件（`p-inputSwitch`、`p-toggleButton`）是否都有 `data-testid`？
- [ ] **1.6** 所有具導航功能的連結（`<a>`）是否都有 `data-testid`？
- [ ] **1.7** 純裝飾性元素（無互動功能的 icon、排版 div）是否**未加** `data-testid`？

---

## 二、data-testid 命名規範

- [ ] **2.1** 命名格式是否為 `[模組]-[元件/區塊]-[用途]-[鍵/索引]`？
- [ ] **2.2** 是否全部使用 kebab-case（小寫 + 連字號）？
- [ ] **2.3** 是否**未使用中文**？
- [ ] **2.4** 是否**未包含**樣式相關字詞（如 `red`、`large`、`primary`）？
- [ ] **2.5** 元素類型後綴是否正確？（`-btn`、`-input`、`-select`、`-checkbox`、`-radio`、`-table`、`-row`、`-dialog`、`-tab`、`-section`、`-text`、`-link`、`-switch`）
- [ ] **2.6** 模組縮寫是否使用已登記的統一縮寫？（參見 `testid-prefix.constants.ts`）
- [ ] **2.7** 同一頁面內的 `data-testid` 值是否**無重複**？

---

## 三、ARIA 屬性（輔助）

- [ ] **3.1** 所有表單 `<input>` 是否有 `<label for="...">` 或 `aria-label`？
- [ ] **3.2** 純 icon 按鈕（無可見文字）是否有 `aria-label` 說明用途？
- [ ] **3.3** 有錯誤訊息的欄位是否使用 `aria-describedby` 關聯？
- [ ] **3.4** 無法使用語意化 HTML 標籤的元素是否有適當的 `role` 屬性？
- [ ] **3.5** `aria-label` 的值是否使用有意義的描述（而非重複 `data-testid`）？

---

## 四、狀態標示

- [ ] **4.1** 可展開/收合的區塊是否有 `[attr.aria-expanded]` 綁定？
- [ ] **4.2** 可選取的列表項/表格列是否有 `[attr.aria-selected]` 綁定？
- [ ] **4.3** 表單必填欄位是否有 `[attr.aria-required]="true"`？
- [ ] **4.4** 表單驗證失敗的欄位是否有 `[attr.aria-invalid]` 動態綁定？
- [ ] **4.5** 可停用的元素是否有 `[attr.aria-disabled]` 綁定（除了原生 `disabled`）？
- [ ] **4.6** 樹狀結構的節點是否有 `[attr.aria-level]` 標示層級？

---

## 五、PrimeNG 元件

- [ ] **5.1** PrimeNG 元件是否在**元件標籤**上加了 `data-testid`？（而非嘗試加在內部 DOM）
- [ ] **5.2** `p-table` 的欄位標頭 `<th>` 是否各有 `data-testid`？
- [ ] **5.3** `p-table` / `p-treeTable` 的 body template 中，`<tr>` 是否有動態 `data-testid`？
- [ ] **5.4** `p-dialog` 內部的表單元素和按鈕是否各自有獨立 `data-testid`？
- [ ] **5.5** `p-dropdown` 是否**未依賴** `aria-label` 穿透，而是以 `data-testid` 為主要定位？
- [ ] **5.6** `p-confirmDialog` 是否有 `data-testid`？

---

## 六、動態與巢狀結構

- [ ] **6.1** `*ngFor` 迴圈內的元素是否使用 `[attr.data-testid]` 動態綁定？（而非靜態 `data-testid`）
- [ ] **6.2** 動態 `data-testid` 是否包含索引（`i`）或業務唯一鍵？
- [ ] **6.3** 當資料有穩定業務鍵時，是否優先使用業務鍵而非索引？
- [ ] **6.4** FormArray 中的每個控制項是否都有包含索引的 `data-testid`？
- [ ] **6.5** 多層巢狀（如 FormArray 內的 FormArray）是否每層都有清楚的層級標示？
- [ ] **6.6** `p-treeTable` 的列是否同時有 `data-testid`、`aria-level`、`aria-expanded`？

---

## 七、自訂元件

- [ ] **7.1** 自訂元件是否提供 `@Input() dataTestId` 接口？
- [ ] **7.2** `data-testid` 是否綁定到元件內部的**實際互動元素**上？
- [ ] **7.3** 若元件有多個互動元素，是否用後綴區分？（如 `-input`、`-btn`）
- [ ] **7.4** 若元件包含表單控制項，是否提供 `@Input() ariaLabel` 接口？
- [ ] **7.5** 元件文件（或 JSDoc）是否說明支援哪些無障礙相關 Input？

---

## 八、Playwright 測試對應檢核

> 適用於撰寫或 review 測試程式碼時

- [ ] **8.1** 測試是否優先使用 `[data-testid="..."]` 定位元素？
- [ ] **8.2** 測試是否**未使用** XPath 定位？
- [ ] **8.3** 測試是否**未依賴** CSS class 或 DOM 層級結構定位？
- [ ] **8.4** PrimeNG 元件的操作是否從 `data-testid` 元素開始，再往內部定位？
- [ ] **8.5** 測試是否有驗證 ARIA 狀態屬性（`aria-expanded`、`aria-selected` 等）？
- [ ] **8.6** 動態列表的測試是否使用正確的索引或業務鍵定位？

---

## 快速 Review 流程建議

```
1. 開啟 PR 變更的 HTML template 檔案
2. 搜尋所有 (click)、formControlName、pButton → 確認是否有 data-testid
3. 搜尋所有 data-testid → 確認命名格式正確、無重複
4. 搜尋所有 *ngFor → 確認內部元素使用 [attr.data-testid] 動態綁定
5. 搜尋所有 icon= 且無 label= → 確認是否有 aria-label
6. 若有 PrimeNG 元件 → 對照附錄 A 確認標註方式
7. 若有自訂元件 → 確認 @Input dataTestId 接口
```

---

## 統計追蹤（選填）

| 項目 | 本次 PR |
|------|--------|
| 新增互動元素數 | ____ |
| 已加 data-testid 數 | ____ |
| 覆蓋率 | ____% |
| 缺漏項目說明 | |
| Reviewer | |
| Review 日期 | |

---

> **備註**：此檢查表應與 `accessibility-testing-standards.md` 一同維護。當規範新增規則時，同步更新本表。
