# 前端無障礙測試標註 Cheat Sheet

> 策略：`data-testid` 為主、`aria-*` 為輔 ｜ Angular 8 + PrimeNG 8.1.1 + Playwright 1.39

---

## 命名格式

```
data-testid="[模組]-[區塊]-[用途]-[鍵/索引]"
```

全部 **kebab-case**、**禁中文**、**禁樣式字詞**

```
✅ cust-search-query-btn        ❌ blue-large-button
✅ loan-form-contact-0-phone-input   ❌ 客戶查詢按鈕
```

---

## 後綴對照

| 按鈕 `-btn` | 輸入框 `-input` | 下拉 `-select` | 核取 `-checkbox` | 單選 `-radio` |
|---|---|---|---|---|
| **表格 `-table`** | **列 `-row`** | **對話框 `-dialog`** | **頁籤 `-tab`** | **切換 `-switch`** |
| **區塊 `-section`** | **文字 `-text`** | **連結 `-link`** | | |

---

## 必須標註的元素

所有使用者能**點擊、輸入、選擇**的元素都要有 `data-testid`

```html
<button pButton data-testid="cust-search-query-btn" label="查詢"></button>
<input pInputText data-testid="cust-search-id-input" formControlName="custId" />
<p-dropdown data-testid="cust-form-branch-select" [options]="branches"></p-dropdown>
```

---

## aria 用在哪？（輔助角色）

| 場景 | 做法 |
|------|------|
| 表單 input | 加 `aria-label="可讀名稱"` |
| 純 icon 按鈕 | 加 `aria-label="用途說明"` |
| 展開/收合 | 加 `[attr.aria-expanded]="bool"` |
| 選取狀態 | 加 `[attr.aria-selected]="bool"` |
| 驗證錯誤 | 加 `[attr.aria-invalid]="bool"` |
| 錯誤訊息關聯 | 加 `aria-describedby="error-id"` |

```html
<button pButton icon="pi pi-trash"
        data-testid="cust-list-delete-btn-A123"
        aria-label="刪除客戶 A123">
</button>
```

---

## 動態列表（*ngFor）

```html
<!-- 有業務鍵 → 用業務鍵 -->
<tr *ngFor="let row of rows"
    [attr.data-testid]="'cust-list-row-' + row.custId">

<!-- 無業務鍵 → 用索引 -->
<div *ngFor="let item of items; let i = index"
     [attr.data-testid]="'order-item-' + i">
```

⚠️ 必須用 `[attr.data-testid]`，不能用 `[data-testid]`

---

## PrimeNG 元件標註原則

`data-testid` 放在**元件標籤**上，Playwright 從外往內操作：

```html
<p-dropdown data-testid="xxx-select" ...></p-dropdown>
<p-dialog data-testid="xxx-dialog" ...>
  <button pButton data-testid="xxx-save-btn"></button>
</p-dialog>
```

```typescript
// Playwright：先定位外層，再往內操作
const dropdown = page.locator('[data-testid="xxx-select"]');
await dropdown.click();
await page.locator('.ui-dropdown-item').filter({ hasText: '目標選項' }).click();
```

---

## Playwright 定位優先順序

```
1️⃣ page.locator('[data-testid="xxx"]')     ← 主力
2️⃣ page.getByLabel('xxx')                  ← 表單備用
3️⃣ page.getByRole('button', { name: 'x' }) ← 通用備用
4️⃣ page.getByText('xxx')                   ← 文字內容
5️⃣ page.locator('.ui-xxx')                 ← 最後手段
```

---

## 自訂元件必做

```typescript
@Input() dataTestId: string = '';
@Input() ariaLabel: string = '';

// template 內綁定到實際互動元素
<input [attr.data-testid]="dataTestId + '-input'"
       [attr.aria-label]="ariaLabel" />
```

---

## 快速 Review 5 步驟

```
① 搜 (click)、formControlName、pButton → 有 data-testid？
② 搜 data-testid → 命名格式正確？無重複？
③ 搜 *ngFor → 內部用 [attr.data-testid] 動態綁定？
④ 搜 icon= 且無 label= → 有 aria-label？
⑤ 有自訂元件 → 有 @Input dataTestId？
```

---

> 📄 完整規範：`accessibility-testing-standards.md`　　☑️ 檢查表：`accessibility-review-checklist.md`