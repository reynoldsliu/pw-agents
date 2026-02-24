// 對應文章：Day 13 — 鍵盤與滑鼠的魔法咒語

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 13：鍵盤與滑鼠的魔法咒語', () => {

  test.describe('keyboard — 鍵盤操作', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/pages/actions-demo.html`);
    });

    test('keyboard.press() — 按下 Tab 移動焦點', async ({ page }) => {
      // 點擊第一個輸入框，再按 Tab 移到下一個
      await page.locator('#fill-input').click();
      await page.keyboard.press('Tab');

      // 確認焦點已移到其他元素（通過 JavaScript 檢查）
      const focused = await page.evaluate(() => document.activeElement?.id);
      // 焦點應已離開 fill-input
      expect(focused).not.toBe('fill-input');
    });

    test('keyboard.press() — 按下 Enter 送出', async ({ page }) => {
      await page.locator('#key-input').fill('Enter 鍵測試');
      await page.keyboard.press('Enter');

      // 驗證 Enter 鍵的效果
      await expect(page.locator('#action-log')).toContainText('按下 Enter');
    });

    test('keyboard.press() — 按下 Escape', async ({ page }) => {
      const keyInput = page.locator('#key-input');
      await keyInput.fill('測試文字');
      await keyInput.press('Escape');

      // 驗證 Escape 鍵被記錄
      await expect(page.locator('#action-log')).toContainText('按下');
    });

    test('keyboard.press() — 組合鍵 Control+A 全選', async ({ page }) => {
      const fillInput = page.locator('#fill-input');
      await fillInput.fill('全選測試文字');

      // 使用 selectText() 全選（跨平台相容；macOS 的 Control+A = 移到行首而非全選）
      await fillInput.selectText();

      // 再輸入會取代全選的文字
      await fillInput.pressSequentially('新文字');
      await expect(fillInput).toHaveValue('新文字');
    });

    test('keyboard.type() — 透過 keyboard.type 輸入（已棄用但仍可用）', async ({ page }) => {
      const fillInput = page.locator('#fill-input');
      await fillInput.click();
      // 使用 keyboard.type 模擬鍵盤輸入
      await page.keyboard.type('鍵盤輸入測試');
      await expect(fillInput).toHaveValue('鍵盤輸入測試');
    });

    test('pressSequentially() — 逐字輸入（含 delay）', async ({ page }) => {
      const typeInput = page.locator('#type-input');

      // 模擬真實打字速度（每個字 50ms 間隔）
      await typeInput.pressSequentially('逐字輸入', { delay: 50 });
      await expect(typeInput).toHaveValue('逐字輸入');
    });

    test('clear() — 清空輸入框', async ({ page }) => {
      const fillInput = page.locator('#fill-input');

      // 先填入內容
      await fillInput.fill('要被清空的文字');
      await expect(fillInput).toHaveValue('要被清空的文字');

      // 清空
      await fillInput.clear();
      await expect(fillInput).toHaveValue('');
    });

  });

  test.describe('mouse — 滑鼠操作', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/pages/actions-demo.html`);
    });

    test('click() — 一般點擊', async ({ page }) => {
      await expect(page.locator('#click-count')).toHaveText('0');
      await page.locator('#click-btn').click();
      await expect(page.locator('#click-count')).toHaveText('1');
    });

    test('dblclick() — 雙擊', async ({ page }) => {
      const area = page.locator('#dblclick-area');
      await expect(area).not.toHaveClass(/activated/);
      await area.dblclick();
      await expect(area).toHaveClass(/activated/);
    });

    test('click({ button: "right" }) — 右鍵點擊', async ({ page }) => {
      // 右鍵點擊，通常會觸發 contextmenu 事件
      let contextMenuFired = false;
      page.on('console', msg => {
        if (msg.text().includes('contextmenu')) contextMenuFired = true;
      });

      await page.locator('#click-btn').click({ button: 'right' });
      // 右鍵點擊主要是觀察行為，不強制斷言（因為頁面可能沒有右鍵菜單）
    });

    test('hover() — 懸停觸發 tooltip', async ({ page }) => {
      const tooltip = page.locator('#tooltip-text');
      await expect(tooltip).toBeHidden();

      await page.locator('#hover-btn').hover();
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText('hover 觸發成功');
    });

    test('click({ clickCount: 3 }) — 三連擊選取文字', async ({ page }) => {
      const fillInput = page.locator('#fill-input');
      await fillInput.fill('三連擊選取測試');

      // 三連擊可以選取整行文字
      await fillInput.click({ clickCount: 3 });

      // 三連擊後輸入新文字，應取代原文
      await page.keyboard.type('新文字');
      await expect(fillInput).toHaveValue('新文字');
    });

    test('click({ position }) — 在特定座標點擊', async ({ page }) => {
      // 在元素內的特定位置點擊
      await page.locator('#click-btn').click({ position: { x: 5, y: 5 } });
      await expect(page.locator('#click-count')).toHaveText('1');
    });

  });

  test.describe('dragAndDrop — 拖放', () => {

    test('dragAndDrop() — 拖放方塊 A 到方塊 B', async ({ page }) => {
      await page.goto(`${BASE_URL}/pages/drag-drop.html`);

      await expect(page.locator('#boxA')).toContainText('方塊 A');
      await page.dragAndDrop('#boxA', '#boxB');

      await expect(page.locator('#result')).toContainText('拖放成功');
    });

    test('mouse.move() + mouse.down() + mouse.up() — 手動模擬拖放', async ({ page }) => {
      await page.goto(`${BASE_URL}/pages/drag-drop.html`);

      const boxA = page.locator('#boxA');
      const boxB = page.locator('#boxB');

      const boxABounds = await boxA.boundingBox();
      const boxBBounds = await boxB.boundingBox();

      if (boxABounds && boxBBounds) {
        const startX = boxABounds.x + boxABounds.width / 2;
        const startY = boxABounds.y + boxABounds.height / 2;
        const endX = boxBBounds.x + boxBBounds.width / 2;
        const endY = boxBBounds.y + boxBBounds.height / 2;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 10 });
        await page.mouse.up();
      }

      // 驗證拖放結果
      await expect(page.locator('#result')).toBeVisible();
    });

  });

  test('💥 [錯誤示範] fill 後斷言錯誤的輸入值', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/actions-demo.html`);
    await page.locator('#fill-input').fill('Hello Playwright');
    // 錯誤：填入的是 'Hello Playwright'，但斷言 'Hello World'
    await expect(page.locator('#fill-input')).toHaveValue('Hello World');
  });

});
