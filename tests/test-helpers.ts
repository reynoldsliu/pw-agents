/**
 * Playwright 測試工具函式
 *
 * 搭配文件：accessibility-testing-standards-20260224v1.1.md
 * 適用環境：Playwright 1.39 + Angular 8 + PrimeNG 8.1.1
 *
 * 用途：封裝常用的 data-testid 定位與 PrimeNG 元件操作，
 *       確保測試程式碼與規範一致，降低重複程式碼。
 *
 * 注意：PrimeNG 內部 CSS class（如 .ui-dropdown-item）為 8.1.1 版本，
 *       升級 PrimeNG 版本後須重新驗證。
 */

import { Page, Locator, expect } from '@playwright/test';

// ============================================================
// 一、基礎定位
// ============================================================

/**
 * 透過 data-testid 定位單一元素
 *
 * @example
 * const btn = byTestId(page, 'cust-search-query-btn');
 * await btn.click();
 */
export function byTestId(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * 透過 data-testid 前綴定位多個元素（用於動態列表）
 *
 * @example
 * // 取得所有客戶列表的列
 * const rows = byTestIdPrefix(page, 'cust-list-row-');
 * await expect(rows).toHaveCount(5);
 */
export function byTestIdPrefix(page: Page, prefix: string): Locator {
  return page.locator(`[data-testid^="${prefix}"]`);
}

/**
 * 在指定父容器內透過 data-testid 定位元素（用於避免重複 testid 的 scoping）
 *
 * @example
 * const section = byTestId(page, 'loan-applicant-contact-section');
 * const phoneInput = scopedByTestId(section, 'loan-applicant-contact-0-phone-input');
 */
export function scopedByTestId(parent: Locator, testId: string): Locator {
  return parent.locator(`[data-testid="${testId}"]`);
}

// ============================================================
// 二、PrimeNG Dropdown 操作
// ============================================================

/**
 * PrimeNG p-dropdown：展開並選擇選項（以選項文字匹配）
 *
 * @example
 * await selectDropdownByText(page, 'cust-form-branch-select', '台北分行');
 */
export async function selectDropdownByText(
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
 * PrimeNG p-dropdown：展開並選擇選項（以選項索引匹配）
 *
 * @example
 * await selectDropdownByIndex(page, 'cust-form-branch-select', 0); // 選第一個
 */
export async function selectDropdownByIndex(
  page: Page,
  testId: string,
  index: number
): Promise<void> {
  const dropdown = byTestId(page, testId);
  await dropdown.click();
  await page.locator('.ui-dropdown-item').nth(index).click();
}

/**
 * PrimeNG p-dropdown：取得目前已選取的顯示文字
 *
 * @example
 * const selected = await getDropdownSelectedText(page, 'cust-form-branch-select');
 * expect(selected).toBe('台北分行');
 */
export async function getDropdownSelectedText(
  page: Page,
  testId: string
): Promise<string> {
  const dropdown = byTestId(page, testId);
  const label = dropdown.locator('.ui-dropdown-label');
  return (await label.textContent()) ?? '';
}

// ============================================================
// 三、PrimeNG MultiSelect 操作
// ============================================================

/**
 * PrimeNG p-multiSelect：展開並勾選多個選項
 *
 * @example
 * await selectMultiSelectOptions(page, 'cust-form-tags-select', ['VIP', '法人']);
 */
export async function selectMultiSelectOptions(
  page: Page,
  testId: string,
  optionTexts: string[]
): Promise<void> {
  const multiSelect = byTestId(page, testId);
  await multiSelect.click();

  for (const text of optionTexts) {
    await page.locator('.ui-multiselect-item')
      .filter({ hasText: text })
      .click();
  }

  // 點擊外部關閉面板
  await page.locator('body').click({ position: { x: 0, y: 0 } });
}

// ============================================================
// 四、PrimeNG Table 操作
// ============================================================

/**
 * PrimeNG p-table：取得表格列數
 *
 * @example
 * const count = await getTableRowCount(page, 'cust-list-table');
 * expect(count).toBe(10);
 */
export async function getTableRowCount(
  page: Page,
  tableTestId: string
): Promise<number> {
  const table = byTestId(page, tableTestId);
  return table.locator('tbody tr').count();
}

/**
 * PrimeNG p-table：取得指定欄位標頭的文字內容
 *
 * @example
 * const headers = await getTableHeaders(page, 'cust-list-table');
 * // ['客戶編號', '客戶姓名', '操作']
 */
export async function getTableHeaders(
  page: Page,
  tableTestId: string
): Promise<string[]> {
  const table = byTestId(page, tableTestId);
  const headers = table.locator('thead th');
  const count = await headers.count();
  const texts: string[] = [];

  for (let i = 0; i < count; i++) {
    texts.push((await headers.nth(i).textContent())?.trim() ?? '');
  }

  return texts;
}

/**
 * PrimeNG p-table：取得指定列的所有儲存格文字
 *
 * @example
 * const cells = await getTableRowCells(page, 'cust-list-row-A123456');
 * // ['A123456', '王小明', '']
 */
export async function getTableRowCells(
  page: Page,
  rowTestId: string
): Promise<string[]> {
  const row = byTestId(page, rowTestId);
  const cells = row.locator('td');
  const count = await cells.count();
  const texts: string[] = [];

  for (let i = 0; i < count; i++) {
    texts.push((await cells.nth(i).textContent())?.trim() ?? '');
  }

  return texts;
}

// ============================================================
// 五、PrimeNG TreeTable 操作
// ============================================================

/**
 * PrimeNG p-treeTable：展開指定節點
 *
 * @example
 * await expandTreeNode(page, 'org-tree-row-D001');
 */
export async function expandTreeNode(
  page: Page,
  rowTestId: string
): Promise<void> {
  const row = byTestId(page, rowTestId);
  const isExpanded = await row.getAttribute('aria-expanded');

  if (isExpanded !== 'true') {
    await row.locator('.ui-treetable-toggler').click();
    await expect(row).toHaveAttribute('aria-expanded', 'true');
  }
}

/**
 * PrimeNG p-treeTable：收合指定節點
 *
 * @example
 * await collapseTreeNode(page, 'org-tree-row-D001');
 */
export async function collapseTreeNode(
  page: Page,
  rowTestId: string
): Promise<void> {
  const row = byTestId(page, rowTestId);
  const isExpanded = await row.getAttribute('aria-expanded');

  if (isExpanded === 'true') {
    await row.locator('.ui-treetable-toggler').click();
    await expect(row).toHaveAttribute('aria-expanded', 'false');
  }
}

/**
 * PrimeNG p-treeTable：驗證節點層級
 *
 * @example
 * await expectTreeNodeLevel(page, 'org-tree-row-D001', 1);    // 根節點
 * await expectTreeNodeLevel(page, 'org-tree-row-D001-01', 2); // 子節點
 */
export async function expectTreeNodeLevel(
  page: Page,
  rowTestId: string,
  expectedLevel: number
): Promise<void> {
  await expect(byTestId(page, rowTestId))
    .toHaveAttribute('aria-level', String(expectedLevel));
}

// ============================================================
// 六、PrimeNG Dialog 操作
// ============================================================

/**
 * 等待對話框出現並返回 Locator
 *
 * @example
 * const dialog = await waitForDialog(page, 'cust-edit-dialog');
 * await byTestId(page, 'cust-edit-name-input').fill('新姓名');
 */
export async function waitForDialog(
  page: Page,
  dialogTestId: string
): Promise<Locator> {
  const dialog = byTestId(page, dialogTestId);
  await dialog.waitFor({ state: 'visible' });
  return dialog;
}

/**
 * 等待對話框消失
 *
 * @example
 * await byTestId(page, 'cust-edit-save-btn').click();
 * await waitForDialogClosed(page, 'cust-edit-dialog');
 */
export async function waitForDialogClosed(
  page: Page,
  dialogTestId: string
): Promise<void> {
  await expect(byTestId(page, dialogTestId)).not.toBeVisible();
}

/**
 * PrimeNG p-confirmDialog：點擊確認或取消按鈕
 *
 * @example
 * await confirmDialog(page, 'cmn-confirm-dialog', '確定');
 * await confirmDialog(page, 'cmn-confirm-dialog', '取消');
 */
export async function confirmDialog(
  page: Page,
  dialogTestId: string,
  buttonText: string
): Promise<void> {
  const dialog = await waitForDialog(page, dialogTestId);
  await dialog.locator('.ui-dialog-footer button')
    .filter({ hasText: buttonText })
    .click();
}

// ============================================================
// 七、PrimeNG TabView 操作
// ============================================================

/**
 * PrimeNG p-tabView：切換到指定頁籤
 *
 * @example
 * await switchTab(page, 'cust-detail-tabview', '交易紀錄');
 */
export async function switchTab(
  page: Page,
  tabViewTestId: string,
  tabHeaderText: string
): Promise<void> {
  const tabView = byTestId(page, tabViewTestId);
  await tabView.locator('.ui-tabview-nav li')
    .filter({ hasText: tabHeaderText })
    .click();
}

// ============================================================
// 八、PrimeNG Checkbox / Radio / Switch 操作
// ============================================================

/**
 * PrimeNG p-checkbox：勾選（若未勾選）
 *
 * @example
 * await checkCheckbox(page, 'cust-form-agree-checkbox');
 */
export async function checkCheckbox(
  page: Page,
  testId: string
): Promise<void> {
  const checkbox = byTestId(page, testId);
  const box = checkbox.locator('.ui-chkbox-box');
  // PrimeNG 8 以 CSS class ui-state-checked 標示勾選狀態（非 aria-checked）
  const isChecked = await box.evaluate(el => el.classList.contains('ui-state-checked'));

  if (!isChecked) {
    await box.click();
  }
}

/**
 * PrimeNG p-checkbox：取消勾選（若已勾選）
 *
 * @example
 * await uncheckCheckbox(page, 'cust-form-agree-checkbox');
 */
export async function uncheckCheckbox(
  page: Page,
  testId: string
): Promise<void> {
  const checkbox = byTestId(page, testId);
  const box = checkbox.locator('.ui-chkbox-box');
  // PrimeNG 8 以 CSS class ui-state-checked 標示勾選狀態（非 aria-checked）
  const isChecked = await box.evaluate(el => el.classList.contains('ui-state-checked'));

  if (isChecked) {
    await box.click();
  }
}

/**
 * PrimeNG p-radioButton：選取指定的 radio
 *
 * @example
 * await selectRadio(page, 'cust-form-gender-radio-M');
 */
export async function selectRadio(
  page: Page,
  testId: string
): Promise<void> {
  const radio = byTestId(page, testId);
  await radio.locator('.ui-radiobutton-box').click();
}

/**
 * PrimeNG p-inputSwitch：切換開關
 *
 * @example
 * await toggleSwitch(page, 'cust-form-active-switch');
 */
export async function toggleSwitch(
  page: Page,
  testId: string
): Promise<void> {
  const switchEl = byTestId(page, testId);
  await switchEl.locator('.ui-inputswitch').click();
}

// ============================================================
// 九、PrimeNG Calendar 操作
// ============================================================

/**
 * PrimeNG p-calendar：直接輸入日期文字
 *
 * @example
 * await inputCalendarDate(page, 'cust-form-birthday-input', '1990/01/15');
 */
export async function inputCalendarDate(
  page: Page,
  testId: string,
  dateText: string
): Promise<void> {
  const calendar = byTestId(page, testId);
  const input = calendar.locator('.ui-inputtext');
  await input.click();
  await input.fill(dateText);
  // 按 Enter 關閉日曆面板
  await input.press('Enter');
}

// ============================================================
// 十、PrimeNG AutoComplete 操作
// ============================================================

/**
 * PrimeNG p-autocomplete：輸入文字並選擇建議項
 *
 * @example
 * await selectAutoComplete(page, 'cust-search-name-input', '王', '王小明');
 */
export async function selectAutoComplete(
  page: Page,
  testId: string,
  inputText: string,
  suggestionText: string
): Promise<void> {
  const autocomplete = byTestId(page, testId);
  const input = autocomplete.locator('.ui-autocomplete-input');
  await input.fill(inputText);
  await page.locator('.ui-autocomplete-item')
    .filter({ hasText: suggestionText })
    .click();
}

// ============================================================
// 十一、PrimeNG Toast 驗證
// ============================================================

/**
 * 驗證 Toast 訊息出現
 *
 * @example
 * await expectToastMessage(page, 'cmn-toast', '儲存成功');
 */
export async function expectToastMessage(
  page: Page,
  toastTestId: string,
  messageText: string
): Promise<void> {
  const toast = byTestId(page, toastTestId);
  await expect(
    toast.locator('.ui-toast-message').filter({ hasText: messageText })
  ).toBeVisible();
}

// ============================================================
// 十二、ARIA 狀態驗證
// ============================================================

/**
 * 驗證元素的 aria-expanded 狀態
 *
 * @example
 * await expectExpanded(page, 'cust-detail-contact-section', true);
 */
export async function expectExpanded(
  page: Page,
  testId: string,
  expanded: boolean
): Promise<void> {
  await expect(byTestId(page, testId))
    .toHaveAttribute('aria-expanded', String(expanded));
}

/**
 * 驗證元素的 aria-selected 狀態
 *
 * @example
 * await expectSelected(page, 'cust-list-row-A123', true);
 */
export async function expectSelected(
  page: Page,
  testId: string,
  selected: boolean
): Promise<void> {
  await expect(byTestId(page, testId))
    .toHaveAttribute('aria-selected', String(selected));
}

/**
 * 驗證表單欄位的 aria-invalid 狀態
 *
 * @example
 * await expectInvalid(page, 'cust-form-email-input', true);
 */
export async function expectInvalid(
  page: Page,
  testId: string,
  invalid: boolean
): Promise<void> {
  await expect(byTestId(page, testId))
    .toHaveAttribute('aria-invalid', String(invalid));
}

/**
 * 驗證元素的 aria-disabled 狀態
 *
 * @example
 * await expectDisabled(page, 'cust-edit-save-btn', true);
 */
export async function expectDisabled(
  page: Page,
  testId: string,
  disabled: boolean
): Promise<void> {
  await expect(byTestId(page, testId))
    .toHaveAttribute('aria-disabled', String(disabled));
}

// ============================================================
// 十三、FormArray 動態列表操作
// ============================================================

/**
 * 取得動態列表的項目數（透過 data-testid 前綴計算）
 *
 * @example
 * const count = await getDynamicListCount(page, 'loan-form-contact-');
 * expect(count).toBe(3);
 */
export async function getDynamicListCount(
  page: Page,
  testIdPrefix: string
): Promise<number> {
  return byTestIdPrefix(page, testIdPrefix).count();
}

/**
 * 填入動態列表中指定索引項目的指定欄位
 *
 * @example
 * // 填入第 0 筆聯絡方式的電話
 * await fillDynamicListField(page, 'loan-form-contact', 0, 'phone-input', '0912345678');
 */
export async function fillDynamicListField(
  page: Page,
  listPrefix: string,
  index: number,
  fieldSuffix: string,
  value: string
): Promise<void> {
  const testId = `${listPrefix}-${index}-${fieldSuffix}`;
  await byTestId(page, testId).fill(value);
}

// ============================================================
// 十四、通用等待與操作
// ============================================================

/**
 * 等待指定 data-testid 的元素出現在畫面上
 *
 * @example
 * await waitForVisible(page, 'cust-list-table');
 */
export async function waitForVisible(
  page: Page,
  testId: string
): Promise<void> {
  await byTestId(page, testId).waitFor({ state: 'visible' });
}

/**
 * 等待指定 data-testid 的元素從畫面消失
 *
 * @example
 * await waitForHidden(page, 'cmn-loading-spinner');
 */
export async function waitForHidden(
  page: Page,
  testId: string
): Promise<void> {
  await byTestId(page, testId).waitFor({ state: 'hidden' });
}
