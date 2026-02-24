/**
 * Playwright 測試 Helper 工具
 *
 * 依據規範 specs/01-accessibility-testing-standards.md 第 10.2 節
 * 策略：`data-testid` 為主要定位屬性，所有 helper 均基於此策略封裝。
 *
 * @module test-helpers
 */
import { type Page, type Locator } from '@playwright/test';

/**
 * 透過 `data-testid` 屬性定位單一元素（主要定位方式）
 *
 * @param page - Playwright Page 實例
 * @param testId - 元素的 `data-testid` 屬性值
 * @returns 對應 data-testid 的 Locator
 *
 * @example
 * await byTestId(page, 'auth-form-login-btn').click();
 */
export function byTestId(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * 透過 `data-testid` 前綴定位多個元素（用於動態列表）
 *
 * 適用於 `*ngFor` 等動態產生、帶有流水號或業務鍵後綴的列表元素。
 *
 * @param page - Playwright Page 實例
 * @param prefix - data-testid 的前綴字串（使用 CSS `^=` 屬性起始選擇器）
 * @returns 所有符合前綴的元素 Locator
 *
 * @example
 * // 取得所有 data-testid 以 'cust-list-row-' 開頭的列
 * const rows = byTestIdPrefix(page, 'cust-list-row-');
 * const count = await rows.count();
 */
export function byTestIdPrefix(page: Page, prefix: string): Locator {
  return page.locator(`[data-testid^="${prefix}"]`);
}

/**
 * PrimeNG / 自訂 dropdown 操作：展開後依文字選取選項
 *
 * PrimeNG 的 `<p-dropdown>` 不是原生 `<select>`，需先點擊外層元件展開，
 * 再從浮動選單（`.ui-dropdown-item`）中選取目標選項。
 *
 * @param page - Playwright Page 實例
 * @param testId - dropdown 元件的 `data-testid` 屬性值
 * @param optionText - 要選取的選項文字（精確或部分比對）
 *
 * @example
 * await selectDropdown(page, 'cust-form-branch-select', '台北分行');
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
 * 取得表格的 `<tbody>` 列數
 *
 * @param page - Playwright Page 實例
 * @param tableTestId - 表格元素的 `data-testid` 屬性值
 * @returns 表格中 `<tbody tr>` 的列數
 *
 * @example
 * const rowCount = await getTableRowCount(page, 'cust-list-table');
 * expect(rowCount).toBe(5);
 */
export async function getTableRowCount(
  page: Page,
  tableTestId: string
): Promise<number> {
  const table = byTestId(page, tableTestId);
  return table.locator('tbody tr').count();
}

/**
 * 等待對話框出現並回傳其 Locator
 *
 * 使用 `waitFor({ state: 'visible' })` 等待對話框元素可見，
 * 適用於需要在斷言前確認對話框已完整顯示的情境。
 *
 * @param page - Playwright Page 實例
 * @param dialogTestId - 對話框元素的 `data-testid` 屬性值
 * @returns 已確認可見的對話框 Locator
 *
 * @example
 * const dialog = await waitForDialog(page, 'confirm-delete-dialog');
 * await dialog.locator('[data-testid="confirm-delete-ok-btn"]').click();
 */
export async function waitForDialog(
  page: Page,
  dialogTestId: string
): Promise<Locator> {
  const dialog = byTestId(page, dialogTestId);
  await dialog.waitFor({ state: 'visible' });
  return dialog;
}
