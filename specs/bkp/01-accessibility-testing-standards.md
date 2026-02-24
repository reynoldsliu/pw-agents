# 前端無障礙程式碼與自動化測試開發規範

> **版本**：v1.0  
> **適用範圍**：Angular 8 + PrimeNG 8.1.1 + TypeScript + Playwright 1.39  
> **策略**：`data-testid` 為主要測試定位屬性，`aria-*` 為輔助（表單語意與狀態標示）  
> **最後更新**：2025/02

---

## 目錄

1. [總則與策略說明](#1-總則與策略說明)
2. [規則 1：所有互動元素必須有 data-testid](#2-規則-1所有互動元素必須有-data-testid)
3. [規則 2：data-testid 命名規範](#3-規則-2data-testid-命名規範)
4. [規則 3：語義化 HTML + ARIA 屬性（輔助）](#4-規則-3語義化-html--aria-屬性輔助)
5. [規則 4：所有表單元素必須有 label 或 aria-label](#5-規則-4所有表單元素必須有-label-或-aria-label)
6. [規則 5：互動元素必須有明確的狀態標示](#6-規則-5互動元素必須有明確的狀態標示)
7. [規則 6：為 PrimeNG 元件加上 data-testid](#7-規則-6為-primeng-元件加上-data-testid)
8. [規則 7：自訂元件必須支援無障礙屬性](#8-規則-7自訂元件必須支援無障礙屬性)
9. [規則 8：動態與巢狀結構的標註策略](#9-規則-8動態與巢狀結構的標註策略)
10. [規則 9：Playwright 定位優先順序](#10-規則-9playwright-定位優先順序)
11. [附錄 A：PrimeNG 8.1.1 元件對照表](#11-附錄-aprimeng-811-元件對照表)
12. [附錄 B：常見反模式](#12-附錄-b常見反模式)

---

## 1. 總則與策略說明

### 1.1 為什麼需要這份規範

本規範的核心目標是讓前端程式碼同時服務兩個需求：

- **自動化測試（Playwright）**：提供穩定、不隨 UI 重構而失效的元素定位錨點
- **AI Agent 操作**：讓 AI 能透過結構化屬性精準識別並操作畫面元素

### 1.2 雙軌策略：data-testid 為主、aria 為輔

| 屬性 | 角色 | 適用場景 |
|------|------|---------|
| `data-testid` | **主要定位屬性** | 所有互動元素、容器、列表項目、表格列 |
| `aria-label` | **輔助語意屬性** | 表單 input/select、純 icon 按鈕的可讀性補充 |
| `aria-expanded` / `aria-selected` 等 | **狀態標示** | 展開收合、選取狀態、啟用停用 |
| `role` | **語意補充** | 僅在無法使用語意化 HTML 標籤時使用 |

**選擇此策略的理由**：

1. PrimeNG 8.1.1 對 `aria-*` 屬性的穿透不穩定，部分元件會忽略或覆蓋外部傳入的 aria 值
2. 本專案有開發限制，無法使用部分語意化 HTML 標籤
3. `data-testid` 為標準 HTML `data-*` 屬性，100% 穿透所有元件，不受框架影響
4. 團隊學習成本最低，規則單一明確

### 1.3 基本原則

- **每個可互動元素都必須可被唯一定位**：使用者能點擊、輸入、選擇的元素都需要 `data-testid`
- **命名即文件**：看到 `data-testid` 的值就能知道這是什麼元素、屬於哪個模組
- **穩定性優先**：`data-testid` 不應因為 CSS class 改名、DOM 結構調整而改變
- **動態元素用組合鍵**：迴圈或巢狀結構中的元素，用業務鍵或索引組合出唯一值

---

## 2. 規則 1：所有互動元素必須有 data-testid

### 2.1 必須標註的元素類型

| 元素類型 | 說明 | 範例 |
|---------|------|------|
| 按鈕 | 所有 `<button>`、`pButton` | 查詢、新增、刪除、展開 |
| 輸入框 | 所有 `<input>`、`pInputText`、`textarea` | 客戶編號、姓名、備註 |
| 下拉選單 | `<select>`、`p-dropdown`、`p-multiSelect` | 分行、幣別、狀態 |
| 核取方塊 / 單選 | `<input type="checkbox/radio">`、`p-checkbox`、`p-radioButton` | 同意條款、性別 |
| 連結 | 所有具導航功能的 `<a>` | 查看明細、回上頁 |
| 切換元件 | `p-inputSwitch`、`p-toggleButton` | 啟用/停用 |
| 表格列 | `<tr>` 或 PrimeNG 表格的列模板 | 資料列 |
| 對話框 | `p-dialog`、`p-confirmDialog` | 確認刪除、編輯視窗 |
| 頁籤 | `p-tabView` 的各個頁籤 | 基本資料、交易明細 |
| 選單項目 | `p-menu`、`p-menubar` 的各項目 | 功能選單 |

### 2.2 不需標註的元素

- 純裝飾性圖示（`<i class="pi pi-info">` 且無互動功能）
- 純樣式容器（僅用於排版的 `<div>`）
- 靜態文字段落

### 2.3 範例

```html
<!-- ✅ 正確：所有互動元素都有 data-testid -->
<button pButton
        data-testid="customer-query-btn"
        label="查詢"
        (click)="onQuery()">
</button>

<input pInputText
       data-testid="customer-id-input"
       formControlName="custId" />

<p-dropdown data-testid="branch-select"
            formControlName="branch"
            [options]="branches">
</p-dropdown>

<!-- ❌ 錯誤：互動元素缺少 data-testid -->
<button pButton label="查詢" (click)="onQuery()"></button>
<input pInputText formControlName="custId" />
```

---

## 3. 規則 2：data-testid 命名規範

### 3.1 命名格式

```
[模組]-[元件/區塊]-[用途]-[業務鍵或索引(可選)]
```

各段說明：

| 段落 | 說明 | 範例 |
|------|------|------|
| 模組 | 功能模組或頁面縮寫 | `cust`（客戶）、`loan`（放款）、`txn`（交易） |
| 元件/區塊 | 所屬區塊或元件 | `search`、`form`、`table`、`dialog` |
| 用途 | 元素的具體功能 | `id-input`、`query-btn`、`name-col` |
| 業務鍵/索引 | 動態元素的唯一識別（可選） | `row-A123456`、`contact-0` |

### 3.2 命名規則

1. **一律使用 kebab-case**（小寫 + 連字號）
2. **禁止使用中文**
3. **禁止使用 CSS class 名稱或樣式相關字詞**（如 `red-btn`、`large-input`）
4. **元素類型後綴統一**：

| 元素類型 | 後綴 | 範例 |
|---------|------|------|
| 按鈕 | `-btn` | `cust-search-query-btn` |
| 輸入框 | `-input` | `cust-search-id-input` |
| 下拉選單 | `-select` | `cust-form-branch-select` |
| 核取方塊 | `-checkbox` | `cust-form-agree-checkbox` |
| 單選按鈕 | `-radio` | `cust-form-gender-radio` |
| 表格 | `-table` | `cust-list-table` |
| 表格列 | `-row` | `cust-list-row-A123` |
| 對話框 | `-dialog` | `cust-edit-dialog` |
| 頁籤 | `-tab` | `cust-detail-basic-tab` |
| 容器/區塊 | `-section` | `cust-search-section` |
| 文字顯示 | `-text` | `cust-detail-name-text` |
| 連結 | `-link` | `cust-detail-link` |
| 切換 | `-switch` | `cust-form-active-switch` |

### 3.3 模組縮寫對照表（團隊自行維護）

> 建議在專案中建立一份 `testid-modules.md` 或常數檔，統一管理模組縮寫。

```typescript
// testid-prefix.constants.ts（建議）
export const TEST_ID_PREFIX = {
  CUSTOMER: 'cust',
  LOAN: 'loan',
  TRANSACTION: 'txn',
  DEPOSIT: 'dep',
  COMMON: 'cmn',
  AUTH: 'auth',
} as const;
```

### 3.4 完整命名範例

```
cust-search-id-input          → 客戶模組 > 查詢區 > 客戶編號輸入框
cust-search-query-btn         → 客戶模組 > 查詢區 > 查詢按鈕
cust-search-reset-btn         → 客戶模組 > 查詢區 > 重置按鈕
cust-list-table               → 客戶模組 > 列表 > 表格
cust-list-row-A123456         → 客戶模組 > 列表 > 資料列（客戶編號 A123456）
cust-list-edit-btn-A123456    → 客戶模組 > 列表 > 編輯按鈕（客戶 A123456）
cust-edit-dialog              → 客戶模組 > 編輯對話框
cust-edit-name-input          → 客戶模組 > 編輯表單 > 姓名輸入框
cust-edit-save-btn            → 客戶模組 > 編輯表單 > 儲存按鈕
loan-detail-contact-0-type-select  → 放款模組 > 明細 > 第 0 筆聯絡方式 > 類型下拉
```

---

## 4. 規則 3：語義化 HTML + ARIA 屬性（輔助）

### 4.1 適用範圍

在本專案中，ARIA 屬性作為 `data-testid` 的**補充**，主要用於以下場景：

| 場景 | 使用的 ARIA 屬性 | 說明 |
|------|-----------------|------|
| 表單輸入框 | `aria-label` | 讓 Playwright 可用 `getByLabel()` 作為備用定位 |
| 純 icon 按鈕 | `aria-label` | 無可見文字時提供可讀名稱 |
| 展開/收合 | `aria-expanded` | 標示當前展開狀態 |
| 選取狀態 | `aria-selected` | 標示當前選取項目 |
| 停用狀態 | `aria-disabled` | 標示元素是否可用 |
| 必填欄位 | `aria-required` | 標示欄位是否必填 |
| 錯誤訊息 | `aria-describedby` | 關聯欄位與其錯誤訊息 |
| 非原生語意 | `role` | 當無法使用語意化標籤時補充角色 |

### 4.2 語意化 HTML 優先原則

即使有開發限制，仍應盡量使用語意化標籤：

```html
<!-- ✅ 優先使用語意化標籤 -->
<button pButton>查詢</button>
<nav>...</nav>
<main>...</main>

<!-- ⚠️ 無法使用語意化標籤時，用 role 補充 -->
<div role="navigation">...</div>
<div role="main">...</div>
<div role="dialog">...</div>

<!-- ❌ 完全沒有語意 -->
<div (click)="onQuery()">查詢</div>
```

### 4.3 常用 ARIA 屬性速查

```
aria-label         → 元素的可讀名稱（無可見文字時使用）
aria-labelledby    → 指向另一個元素的 id，用該元素文字當名稱
aria-describedby   → 補充描述（錯誤訊息、提示文字）
aria-expanded      → 展開/收合狀態（true/false）
aria-selected      → 選取狀態（true/false）
aria-disabled      → 停用狀態（true/false）
aria-required      → 必填標示（true/false）
aria-hidden        → 對輔助技術隱藏（true/false）
aria-live          → 動態內容更新通知（polite/assertive）
aria-level         → 層級深度（用於樹狀結構）
role               → 覆寫元素的語意角色
```

### 4.4 範例：data-testid + aria 搭配使用

```html
<!-- 表單輸入框：data-testid 定位 + aria-label 語意 -->
<input pInputText
       data-testid="cust-search-id-input"
       aria-label="客戶編號"
       formControlName="custId" />

<!-- 純 icon 按鈕：data-testid 定位 + aria-label 說明用途 -->
<button pButton
        data-testid="cust-list-delete-btn-A123"
        aria-label="刪除客戶 A123"
        icon="pi pi-trash"
        (click)="onDelete('A123')">
</button>

<!-- 帶錯誤訊息的欄位 -->
<input pInputText
       data-testid="cust-form-email-input"
       aria-label="電子郵件"
       aria-describedby="email-error"
       formControlName="email" />
<small id="email-error"
       data-testid="cust-form-email-error"
       *ngIf="form.get('email').invalid && form.get('email').touched">
  請輸入有效的電子郵件格式
</small>
```

---

## 5. 規則 4：所有表單元素必須有 label 或 aria-label

### 5.1 規則說明

每個表單控制項（input、select、textarea、checkbox、radio）都必須關聯一個 label。優先順序為：

1. **`<label for="...">`**：原生 HTML label 關聯（最佳）
2. **`aria-label`**：直接在元素上標註名稱（無法使用 `<label>` 時）
3. **`aria-labelledby`**：指向頁面上已有的文字元素

### 5.2 範例

```html
<!-- 方式 1：原生 label（推薦） -->
<label for="custName">客戶姓名</label>
<input pInputText
       id="custName"
       data-testid="cust-form-name-input"
       formControlName="name" />

<!-- 方式 2：aria-label（欄位無可見 label 時） -->
<input pInputText
       data-testid="cust-search-keyword-input"
       aria-label="關鍵字搜尋"
       placeholder="請輸入關鍵字"
       formControlName="keyword" />

<!-- 方式 3：aria-labelledby（共用既有文字） -->
<h3 id="contact-title">聯絡資訊</h3>
<input pInputText
       data-testid="cust-form-phone-input"
       aria-labelledby="contact-title"
       formControlName="phone" />
```

### 5.3 PrimeNG 表單元件注意事項

PrimeNG 8.1.1 的部分元件（如 `p-dropdown`、`p-calendar`）內部會渲染隱藏的 `<input>`，外部加的 `aria-label` 不一定會穿透。建議：

```html
<!-- p-dropdown：aria-label 可能不穿透，但 data-testid 一定會在外層 -->
<p-dropdown data-testid="cust-form-branch-select"
            aria-label="所屬分行"
            formControlName="branch"
            [options]="branches">
</p-dropdown>

<!-- p-calendar：同上 -->
<p-calendar data-testid="cust-form-birthday-input"
            aria-label="出生日期"
            formControlName="birthday">
</p-calendar>
```

> **Playwright 測試時**：對 PrimeNG 元件優先使用 `data-testid` 定位，不依賴 `aria-label` 穿透。

---

## 6. 規則 5：互動元素必須有明確的狀態標示

### 6.1 為什麼需要狀態標示

自動化測試不僅需要定位元素，還需要**驗證元素的狀態**。ARIA 狀態屬性讓 Playwright 可以直接斷言狀態，而不需要解析 CSS class。

### 6.2 必須標示的狀態

| 狀態 | ARIA 屬性 | 適用元素 | 範例值 |
|------|----------|---------|-------|
| 展開/收合 | `aria-expanded` | 手風琴、樹狀節點、下拉選單 | `"true"` / `"false"` |
| 選取 | `aria-selected` | 表格列、頁籤、列表項 | `"true"` / `"false"` |
| 停用 | `aria-disabled` | 按鈕、輸入框、連結 | `"true"` / `"false"` |
| 必填 | `aria-required` | 表單欄位 | `"true"` |
| 錯誤 | `aria-invalid` | 表單欄位驗證失敗 | `"true"` / `"false"` |
| 排序 | `aria-sort` | 表格欄位標頭 | `"ascending"` / `"descending"` / `"none"` |
| 勾選 | `aria-checked` | 核取方塊、開關 | `"true"` / `"false"` / `"mixed"` |

### 6.3 範例

```html
<!-- 展開/收合狀態 -->
<div data-testid="cust-detail-contact-section"
     [attr.aria-expanded]="isContactExpanded">
  <button data-testid="cust-detail-contact-toggle-btn"
          (click)="isContactExpanded = !isContactExpanded">
    聯絡資訊
  </button>
  <div *ngIf="isContactExpanded">
    <!-- 內容 -->
  </div>
</div>

<!-- 表單驗證狀態 -->
<input pInputText
       data-testid="cust-form-email-input"
       aria-label="電子郵件"
       [attr.aria-required]="true"
       [attr.aria-invalid]="form.get('email').invalid && form.get('email').touched"
       formControlName="email" />

<!-- 表格列選取狀態 -->
<tr *ngFor="let row of customers"
    data-testid="cust-list-row-{{ row.custId }}"
    [attr.aria-selected]="selectedCustId === row.custId"
    (click)="onSelectRow(row)">
  <!-- 欄位 -->
</tr>
```

### 6.4 Playwright 狀態驗證

```typescript
// 驗證展開狀態
await expect(page.locator('[data-testid="cust-detail-contact-section"]'))
  .toHaveAttribute('aria-expanded', 'true');

// 驗證欄位錯誤狀態
await expect(page.locator('[data-testid="cust-form-email-input"]'))
  .toHaveAttribute('aria-invalid', 'true');

// 驗證選取狀態
await expect(page.locator('[data-testid="cust-list-row-A123"]'))
  .toHaveAttribute('aria-selected', 'true');
```

---

## 7. 規則 6：為 PrimeNG 元件加上 data-testid

### 7.1 核心原則

PrimeNG 8.1.1 的元件在渲染後會產生複雜的 DOM 結構。策略是：

1. **在 PrimeNG 元件的最外層標籤加 `data-testid`**
2. **Playwright 測試時，從 `data-testid` 元素往內部用 CSS selector 定位實際操作元素**
3. **不依賴 PrimeNG 內部生成的 class 名稱**（可能隨版本升級改變）

### 7.2 常用 PrimeNG 元件標註方式

#### p-dropdown

```html
<p-dropdown data-testid="cust-form-branch-select"
            formControlName="branch"
            [options]="branches"
            placeholder="請選擇分行">
</p-dropdown>
```

```typescript
// Playwright：點擊展開 → 選擇選項
const dropdown = page.locator('[data-testid="cust-form-branch-select"]');
await dropdown.click();
await page.locator('.ui-dropdown-item').filter({ hasText: '台北分行' }).click();
```

#### p-table

```html
<p-table data-testid="cust-list-table"
         [value]="customers"
         [paginator]="true"
         [rows]="10">
  <ng-template pTemplate="header">
    <tr>
      <th data-testid="cust-list-col-id">客戶編號</th>
      <th data-testid="cust-list-col-name">客戶姓名</th>
      <th data-testid="cust-list-col-action">操作</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-row>
    <tr [attr.data-testid]="'cust-list-row-' + row.custId">
      <td [attr.data-testid]="'cust-list-cell-id-' + row.custId">
        {{ row.custId }}
      </td>
      <td [attr.data-testid]="'cust-list-cell-name-' + row.custId">
        {{ row.name }}
      </td>
      <td>
        <button pButton icon="pi pi-pencil"
                [attr.data-testid]="'cust-list-edit-btn-' + row.custId"
                [attr.aria-label]="'編輯 ' + row.name">
        </button>
      </td>
    </tr>
  </ng-template>
</p-table>
```

#### p-dialog

```html
<p-dialog data-testid="cust-edit-dialog"
          header="編輯客戶"
          [(visible)]="showEditDialog"
          [modal]="true">
  <div>
    <input pInputText
           data-testid="cust-edit-name-input"
           aria-label="客戶姓名"
           formControlName="name" />
  </div>
  <p-footer>
    <button pButton
            data-testid="cust-edit-save-btn"
            label="儲存"
            (click)="onSave()">
    </button>
    <button pButton
            data-testid="cust-edit-cancel-btn"
            label="取消"
            (click)="onCancel()">
    </button>
  </p-footer>
</p-dialog>
```

#### p-tabView

```html
<p-tabView data-testid="cust-detail-tabview">
  <p-tabPanel header="基本資料"
              data-testid="cust-detail-basic-tab">
    <!-- 內容 -->
  </p-tabPanel>
  <p-tabPanel header="交易紀錄"
              data-testid="cust-detail-txn-tab">
    <!-- 內容 -->
  </p-tabPanel>
</p-tabView>
```

```typescript
// Playwright：透過文字定位頁籤標頭
const tabview = page.locator('[data-testid="cust-detail-tabview"]');
await tabview.locator('.ui-tabview-nav li').filter({ hasText: '交易紀錄' }).click();
```

#### p-checkbox / p-radioButton

```html
<p-checkbox data-testid="cust-form-agree-checkbox"
            formControlName="agree"
            label="我同意相關條款"
            binary="true">
</p-checkbox>

<p-radioButton *ngFor="let gender of genders"
               [attr.data-testid]="'cust-form-gender-radio-' + gender.value"
               [value]="gender.value"
               [label]="gender.label"
               formControlName="gender">
</p-radioButton>
```

#### p-confirmDialog

```html
<!-- 全域確認對話框 -->
<p-confirmDialog data-testid="cmn-confirm-dialog">
</p-confirmDialog>
```

```typescript
// Playwright：操作確認對話框按鈕
// PrimeNG confirmDialog 的按鈕在 .ui-dialog-footer 內
const dialog = page.locator('[data-testid="cmn-confirm-dialog"]');
await dialog.locator('button').filter({ hasText: '確定' }).click();
```

---

## 8. 規則 7：自訂元件必須支援無障礙屬性

### 8.1 規則說明

所有自訂 Angular 元件（custom component）必須：

1. 接受外部傳入 `data-testid`
2. 將 `data-testid` 正確綁定到元件內部的關鍵互動元素上
3. 若包含表單控制項，支援 `aria-label` 的傳入與綁定

### 8.2 實作方式

#### 方式 A：使用 @Input 傳遞

```typescript
// custom-search-input.component.ts
@Component({
  selector: 'app-custom-search-input',
  template: `
    <div class="search-wrapper">
      <input pInputText
             [attr.data-testid]="dataTestId + '-input'"
             [attr.aria-label]="ariaLabel"
             [formControl]="control" />
      <button pButton icon="pi pi-search"
              [attr.data-testid]="dataTestId + '-btn'"
              [attr.aria-label]="'搜尋 ' + ariaLabel"
              (click)="onSearch.emit()">
      </button>
    </div>
  `
})
export class CustomSearchInputComponent {
  @Input() dataTestId: string = '';
  @Input() ariaLabel: string = '';
  @Input() control: FormControl;
  @Output() onSearch = new EventEmitter<void>();
}
```

```html
<!-- 使用方式 -->
<app-custom-search-input
  dataTestId="cust-search-keyword"
  ariaLabel="客戶關鍵字"
  [control]="form.get('keyword')">
</app-custom-search-input>

<!-- 渲染結果 -->
<!-- <input data-testid="cust-search-keyword-input" aria-label="客戶關鍵字" /> -->
<!-- <button data-testid="cust-search-keyword-btn" aria-label="搜尋 客戶關鍵字" /> -->
```

#### 方式 B：使用 HostBinding（簡單容器型元件）

```typescript
// custom-card.component.ts
@Component({
  selector: 'app-custom-card',
  template: `
    <div class="card-header">
      <ng-content select="[card-title]"></ng-content>
    </div>
    <div class="card-body">
      <ng-content></ng-content>
    </div>
  `
})
export class CustomCardComponent {
  @HostBinding('attr.data-testid')
  @Input() dataTestId: string = '';
}
```

### 8.3 自訂元件檢核要點

- [ ] 元件是否接受 `dataTestId` 的 `@Input`？
- [ ] `data-testid` 是否綁定到**實際互動元素**上（而非外層裝飾容器）？
- [ ] 若元件有多個互動元素，是否用後綴區分（如 `-input`、`-btn`）？
- [ ] 若包含表單控制項，是否支援 `ariaLabel` 的 `@Input`？
- [ ] 元件內部的狀態（展開、選取、停用）是否有對應的 ARIA 狀態屬性？

---

## 9. 規則 8：動態與巢狀結構的標註策略

### 9.1 *ngFor 迴圈

#### 基本用法：使用索引

```html
<div *ngFor="let item of items; let i = index"
     [attr.data-testid]="'order-item-' + i">
  <input pInputText
         [attr.data-testid]="'order-item-' + i + '-amount-input'"
         [attr.aria-label]="'第 ' + (i + 1) + ' 筆金額'"
         [formControl]="item.get('amount')" />
  <button pButton icon="pi pi-trash"
          [attr.data-testid]="'order-item-' + i + '-delete-btn'"
          [attr.aria-label]="'刪除第 ' + (i + 1) + ' 筆'"
          (click)="removeItem(i)">
  </button>
</div>
```

#### 進階用法：使用業務唯一鍵（推薦）

```html
<!-- 當資料有唯一識別值時，優先使用業務鍵而非索引 -->
<tr *ngFor="let account of accounts"
    [attr.data-testid]="'dep-list-row-' + account.accountNo">
  <td [attr.data-testid]="'dep-list-balance-' + account.accountNo">
    {{ account.balance | currency }}
  </td>
  <td>
    <button pButton
            [attr.data-testid]="'dep-list-detail-btn-' + account.accountNo"
            label="明細"
            (click)="viewDetail(account)">
    </button>
  </td>
</tr>
```

> **選擇索引 vs 業務鍵的原則**：
> - 資料有穩定唯一鍵（帳號、客戶編號）→ 用業務鍵
> - 資料無穩定鍵（新增中的暫存列）→ 用索引
> - 排序可能改變 → 用業務鍵（索引會隨排序改變）

### 9.2 FormArray 巢狀結構

```typescript
// component.ts
form = this.fb.group({
  applicant: this.fb.group({
    name: [''],
    contacts: this.fb.array([])
  })
});

get contacts(): FormArray {
  return this.form.get('applicant.contacts') as FormArray;
}
```

```html
<!-- template -->
<div formArrayName="contacts">
  <div *ngFor="let contact of contacts.controls; let i = index"
       [formGroupName]="i"
       [attr.data-testid]="'loan-form-contact-' + i">

    <p-dropdown formControlName="type"
                [attr.data-testid]="'loan-form-contact-' + i + '-type-select'"
                [attr.aria-label]="'第 ' + (i + 1) + ' 筆聯絡方式類型'"
                [options]="contactTypes">
    </p-dropdown>

    <input pInputText formControlName="value"
           [attr.data-testid]="'loan-form-contact-' + i + '-value-input'"
           [attr.aria-label]="'第 ' + (i + 1) + ' 筆聯絡方式'" />

    <button pButton icon="pi pi-minus"
            [attr.data-testid]="'loan-form-contact-' + i + '-remove-btn'"
            [attr.aria-label]="'移除第 ' + (i + 1) + ' 筆聯絡方式'"
            (click)="removeContact(i)">
    </button>
  </div>
</div>

<button pButton label="新增聯絡方式"
        data-testid="loan-form-contact-add-btn"
        (click)="addContact()">
</button>
```

### 9.3 p-treeTable 樹狀結構

```html
<p-treeTable [value]="orgTree"
             data-testid="org-tree-table">

  <ng-template pTemplate="header">
    <tr>
      <th data-testid="org-tree-col-name">部門名稱</th>
      <th data-testid="org-tree-col-code">代碼</th>
      <th data-testid="org-tree-col-action">操作</th>
    </tr>
  </ng-template>

  <ng-template pTemplate="body" let-rowNode let-rowData="rowData">
    <tr [attr.data-testid]="'org-tree-row-' + rowData.deptCode"
        [attr.aria-level]="rowNode.level + 1"
        [attr.aria-expanded]="rowNode.node.expanded">

      <td>
        <p-treeTableToggler [rowNode]="rowNode">
        </p-treeTableToggler>
        <span [attr.data-testid]="'org-tree-name-' + rowData.deptCode">
          {{ rowData.deptName }}
        </span>
      </td>

      <td [attr.data-testid]="'org-tree-code-' + rowData.deptCode">
        {{ rowData.deptCode }}
      </td>

      <td>
        <button pButton icon="pi pi-pencil"
                [attr.data-testid]="'org-tree-edit-btn-' + rowData.deptCode"
                [attr.aria-label]="'編輯 ' + rowData.deptName">
        </button>
      </td>
    </tr>
  </ng-template>
</p-treeTable>
```

```typescript
// Playwright 測試
// 展開節點
const row = page.locator('[data-testid="org-tree-row-D001"]');
await row.locator('.ui-treetable-toggler').click();
await expect(row).toHaveAttribute('aria-expanded', 'true');

// 驗證層級
await expect(page.locator('[data-testid="org-tree-row-D001-01"]'))
  .toHaveAttribute('aria-level', '2');

// 編輯子節點
await page.locator('[data-testid="org-tree-edit-btn-D001-01"]').click();
```

### 9.4 巢狀 FormGroup 內的 FormArray

```html
<!-- 多層巢狀：申請書 > 保證人(FormArray) > 聯絡方式(FormArray) -->
<div *ngFor="let guarantor of guarantors.controls; let gi = index"
     [formGroupName]="gi"
     [attr.data-testid]="'loan-guarantor-' + gi">

  <input pInputText formControlName="name"
         [attr.data-testid]="'loan-guarantor-' + gi + '-name-input'"
         [attr.aria-label]="'第 ' + (gi + 1) + ' 位保證人姓名'" />

  <div formArrayName="contacts">
    <div *ngFor="let contact of getGuarantorContacts(gi).controls; let ci = index"
         [formGroupName]="ci"
         [attr.data-testid]="'loan-guarantor-' + gi + '-contact-' + ci">

      <input pInputText formControlName="phone"
             [attr.data-testid]="'loan-guarantor-' + gi + '-contact-' + ci + '-phone-input'"
             [attr.aria-label]="'保證人 ' + (gi + 1) + ' 第 ' + (ci + 1) + ' 筆電話'" />
    </div>
  </div>
</div>
```

---

## 10. 規則 9：Playwright 定位優先順序

### 10.1 定位策略優先順序

在撰寫 Playwright 測試時，依以下優先順序選擇定位方式：

| 優先順序 | 定位方式 | 適用場景 | 範例 |
|---------|---------|---------|------|
| 1 | `data-testid` | **所有已標註的元素**（主要方式） | `page.locator('[data-testid="cust-search-query-btn"]')` |
| 2 | `getByLabel` | 表單欄位（有 aria-label 時的備用） | `page.getByLabel('客戶編號')` |
| 3 | `getByRole` | 通用互動元素 | `page.getByRole('button', { name: '查詢' })` |
| 4 | `getByText` | 靜態文字內容 | `page.getByText('查無資料')` |
| 5 | CSS selector | 以上方式都無法定位時的最後手段 | `page.locator('.ui-dropdown-item')` |

### 10.2 封裝 Playwright 測試 Helper（建議）

```typescript
// test-helpers.ts
import { Page, Locator } from '@playwright/test';

/**
 * 透過 data-testid 定位元素
 */
export function byTestId(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * 透過 data-testid 前綴定位多個元素（用於動態列表）
 */
export function byTestIdPrefix(page: Page, prefix: string): Locator {
  return page.locator(`[data-testid^="${prefix}"]`);
}

/**
 * PrimeNG dropdown 操作：展開並選擇選項
 */
export async function selectDropdown(
  page: Page,
  testId: string,
  optionText: string
): Promise<void> {
  const dropdown = byTestId(page, testId);
  await dropdown.click();
  await page.locator('.ui-dropdown-item')
    .filter({ hasText: optionText })
    .click();
}

/**
 * PrimeNG table：取得指定列數
 */
export async function getTableRowCount(
  page: Page,
  tableTestId: string
): Promise<number> {
  const table = byTestId(page, tableTestId);
  return table.locator('tbody tr').count();
}

/**
 * 等待並驗證對話框出現
 */
export async function waitForDialog(
  page: Page,
  dialogTestId: string
): Promise<Locator> {
  const dialog = byTestId(page, dialogTestId);
  await dialog.waitFor({ state: 'visible' });
  return dialog;
}
```

### 10.3 完整測試範例

```typescript
import { test, expect } from '@playwright/test';
import { byTestId, selectDropdown, waitForDialog } from './test-helpers';

test('客戶查詢與編輯流程', async ({ page }) => {
  await page.goto('/customer');

  // 1. 輸入查詢條件
  await byTestId(page, 'cust-search-id-input').fill('A123456789');
  await selectDropdown(page, 'cust-search-branch-select', '台北分行');

  // 2. 點擊查詢
  await byTestId(page, 'cust-search-query-btn').click();

  // 3. 驗證表格結果
  const table = byTestId(page, 'cust-list-table');
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(byTestId(page, 'cust-list-cell-id-A123456789'))
    .toHaveText('A123456789');

  // 4. 點擊編輯
  await byTestId(page, 'cust-list-edit-btn-A123456789').click();

  // 5. 在對話框中修改
  const dialog = await waitForDialog(page, 'cust-edit-dialog');
  await byTestId(page, 'cust-edit-name-input').clear();
  await byTestId(page, 'cust-edit-name-input').fill('新姓名');

  // 6. 儲存
  await byTestId(page, 'cust-edit-save-btn').click();
  await expect(dialog).not.toBeVisible();
});
```

---

## 11. 附錄 A：PrimeNG 8.1.1 元件對照表

> 以下整理常用 PrimeNG 元件的 `data-testid` 放置位置與 Playwright 操作方式。

| PrimeNG 元件 | data-testid 放置 | Playwright 操作內部元素 |
|-------------|-----------------|---------------------|
| `p-dropdown` | 元件標籤上 | `.click()` 展開 → `.ui-dropdown-item` 選擇 |
| `p-multiSelect` | 元件標籤上 | `.click()` 展開 → `.ui-multiselect-item` 勾選 |
| `p-table` | 元件標籤上 | `tbody tr` 定位列、`th` 定位欄標頭 |
| `p-treeTable` | 元件標籤上 | `.ui-treetable-toggler` 展開、`tr` 定位列 |
| `p-dialog` | 元件標籤上 | 內部元素直接用各自的 `data-testid` |
| `p-confirmDialog` | 元件標籤上 | `.ui-dialog-footer button` 定位按鈕 |
| `p-tabView` | 元件標籤上 | `.ui-tabview-nav li` 定位頁籤標頭 |
| `p-calendar` | 元件標籤上 | `.ui-inputtext` 輸入、`.ui-datepicker` 選日期 |
| `p-checkbox` | 元件標籤上 | `.ui-chkbox-box` 點擊 |
| `p-radioButton` | 元件標籤上 | `.ui-radiobutton-box` 點擊 |
| `p-inputSwitch` | 元件標籤上 | `.ui-inputswitch` 點擊 |
| `p-menu` | 元件標籤上 | `.ui-menuitem` 定位項目 |
| `p-toast` | 元件標籤上 | `.ui-toast-message` 定位訊息 |
| `p-autocomplete` | 元件標籤上 | `.ui-autocomplete-input` 輸入、`.ui-autocomplete-item` 選擇 |

---

## 12. 附錄 B：常見反模式

### ❌ 反模式 1：使用 CSS class 或 DOM 結構定位

```typescript
// ❌ 不穩定：CSS class 隨樣式重構改變
await page.locator('.search-panel .btn-primary').click();

// ✅ 穩定：data-testid 不受樣式影響
await page.locator('[data-testid="cust-search-query-btn"]').click();
```

### ❌ 反模式 2：使用 XPath

```typescript
// ❌ 脆弱：DOM 結構任何改變都會失效
await page.locator('//div[3]/form/div[2]/button[1]').click();

// ✅ 穩定
await page.locator('[data-testid="cust-search-query-btn"]').click();
```

### ❌ 反模式 3：data-testid 名稱包含樣式資訊

```html
<!-- ❌ 名稱反映樣式，而非用途 -->
<button data-testid="blue-large-button">查詢</button>

<!-- ✅ 名稱反映功能 -->
<button data-testid="cust-search-query-btn">查詢</button>
```

### ❌ 反模式 4：動態列表不加索引或業務鍵

```html
<!-- ❌ 所有列的 data-testid 相同，無法定位特定列 -->
<tr *ngFor="let row of rows" data-testid="table-row">

<!-- ✅ 每列有唯一 data-testid -->
<tr *ngFor="let row of rows" [attr.data-testid]="'cust-list-row-' + row.id">
```

### ❌ 反模式 5：在裝飾容器上加 data-testid 但跳過實際互動元素

```html
<!-- ❌ 外層有標註但真正的 input 沒有 -->
<div data-testid="search-field">
  <input pInputText formControlName="keyword" />
</div>

<!-- ✅ 互動元素本身有標註 -->
<div>
  <input pInputText
         data-testid="cust-search-keyword-input"
         formControlName="keyword" />
</div>
```

### ❌ 反模式 6：aria-label 使用中文但 data-testid 也用中文

```html
<!-- ❌ data-testid 用中文（不利維護和自動化） -->
<button data-testid="客戶查詢按鈕">查詢</button>

<!-- ✅ data-testid 用 kebab-case，aria-label 可用中文 -->
<button data-testid="cust-search-query-btn"
        aria-label="客戶查詢">
  查詢
</button>
```

---

> **文件維護**：本規範應隨專案演進持續更新。建議每季度由前端團隊 review 一次，確認 PrimeNG 元件對照表及命名規則是否需要調整。
