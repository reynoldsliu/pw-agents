// 對應文章：Day 14 — 表格迷宮：nth()、filter()、all()

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const PAGE_URL = `${BASE_URL}/pages/table-demo.html`;

test.describe('Day 14：表格迷宮 — nth()、filter()、all()', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  // --- nth() / first() / last() ---

  test('nth() — 定位表格第 1 列（索引 0）', async ({ page }) => {
    // nth(0) 取得第一個符合的元素
    const firstRow = page.locator('#table-body tr').nth(0);
    await expect(firstRow.locator('.user-name')).toHaveText('王小明');
  });

  test('nth() — 定位表格第 3 列（索引 2）', async ({ page }) => {
    const thirdRow = page.locator('#table-body tr').nth(2);
    await expect(thirdRow.locator('.user-name')).toHaveText('李阿德');
  });

  test('first() — 定位第一列', async ({ page }) => {
    // first() 等同於 nth(0)
    const firstRow = page.locator('#table-body tr').first();
    await expect(firstRow.locator('.user-name')).toHaveText('王小明');
    await expect(firstRow.locator('.role-badge')).toHaveText('管理員');
  });

  test('last() — 定位最後一列', async ({ page }) => {
    // last() 取得最後一個符合的元素
    const lastRow = page.locator('#table-body tr').last();
    await expect(lastRow.locator('.user-name')).toHaveText('張大偉');
    await expect(lastRow.locator('.role-badge')).toHaveText('管理員');
  });

  // --- count() ---

  test('count() — 計算表格列數', async ({ page }) => {
    const rowCount = await page.locator('#table-body tr').count();
    expect(rowCount).toBe(5);
  });

  test('count() — 計算啟用使用者數量', async ({ page }) => {
    const activeCount = await page.locator('.active-status').count();
    expect(activeCount).toBe(4);
  });

  test('count() — 計算停用使用者數量', async ({ page }) => {
    const inactiveCount = await page.locator('.inactive-status').count();
    expect(inactiveCount).toBe(1);
  });

  // --- filter() ---

  test('filter({ hasText }) — 找到包含特定文字的列', async ({ page }) => {
    // 找到姓名為「陳小花」的列
    const row = page.locator('#table-body tr').filter({ hasText: '陳小花' });
    await expect(row).toHaveCount(1);
    await expect(row.locator('.user-email')).toHaveText('hua@example.com');
  });

  test('filter({ has }) — 找到包含停用標籤的列', async ({ page }) => {
    // 找到包含 .inactive-status 元素的列
    const inactiveRow = page.locator('#table-body tr').filter({
      has: page.locator('.inactive-status')
    });
    await expect(inactiveRow).toHaveCount(1);
    await expect(inactiveRow.locator('.user-name')).toHaveText('李阿德');
  });

  test('filter({ hasText }) — 找到所有管理員', async ({ page }) => {
    // 篩選包含「管理員」角色的列
    const adminRows = page.locator('#table-body tr').filter({ hasText: '管理員' });
    await expect(adminRows).toHaveCount(2);
  });

  test('filter({ has }) — 找到所有編輯者列', async ({ page }) => {
    const editorRows = page.locator('#table-body tr').filter({
      has: page.locator('.role-editor')
    });
    await expect(editorRows).toHaveCount(2);
  });

  // --- all() ---

  test('all() — 遍歷所有列取得姓名', async ({ page }) => {
    // all() 回傳 Locator 陣列，可逐一操作
    const rows = await page.locator('#table-body tr').all();
    const names: string[] = [];

    for (const row of rows) {
      const name = await row.locator('.user-name').textContent();
      if (name) names.push(name.trim());
    }

    expect(names).toEqual(['王小明', '陳小花', '李阿德', '林美麗', '張大偉']);
  });

  test('all() — 確認所有啟用使用者', async ({ page }) => {
    const activeRows = await page.locator('#table-body tr').filter({
      has: page.locator('.active-status')
    }).all();

    expect(activeRows.length).toBe(4);

    for (const row of activeRows) {
      await expect(row.locator('.user-status')).toHaveText('啟用');
    }
  });

  // --- 進階組合 ---

  test('filter + nth — 找到第一個編輯者', async ({ page }) => {
    const firstEditor = page.locator('#table-body tr')
      .filter({ has: page.locator('.role-editor') })
      .first();

    await expect(firstEditor.locator('.user-name')).toHaveText('陳小花');
  });

  test('組合操作 — 點擊特定使用者的編輯按鈕', async ({ page }) => {
    // 找到「林美麗」的列，點擊其編輯按鈕
    const meiRow = page.locator('#table-body tr').filter({ hasText: '林美麗' });
    await meiRow.locator('.edit-btn').click();

    // 驗證狀態列顯示編輯訊息
    await expect(page.locator('#status-bar')).toContainText('編輯使用者：林美麗');
  });

  test('locator chaining — 從 tr 往下定位', async ({ page }) => {
    // 用資料屬性定位特定列再取其欄位
    const row = page.locator('tr[data-user-id="3"]');
    await expect(row.locator('.user-name')).toHaveText('李阿德');
    await expect(row.locator('.user-email')).toHaveText('de@example.com');
    await expect(row.locator('.user-status')).toHaveText('停用');
  });

  test('表格摘要 — 驗證統計數字', async ({ page }) => {
    await expect(page.locator('#total-count')).toHaveText('5');
    await expect(page.locator('#active-count')).toHaveText('4');
    await expect(page.locator('#inactive-count')).toHaveText('1');
  });

});
