// 對應文章：Day 06 — Actions 互動魔法

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Day 06：Actions 互動魔法 — 展示各種頁面互動操作', () => {

  test.describe('actions-demo 頁面互動', () => {

    test.beforeEach(async ({ page }) => {
      // 每個測試前訪問 Actions 示範頁
      await page.goto(`${BASE_URL}/pages/actions-demo.html`);
    });

    test('click() — 點擊按鈕，驗證計數器 +1', async ({ page }) => {
      // 驗證初始計數為 0
      await expect(page.locator('#click-count')).toHaveText('0');

      // 點擊按鈕
      await page.locator('#click-btn').click();

      // 驗證計數增加為 1
      await expect(page.locator('#click-count')).toHaveText('1');

      // 再點一次，計數應為 2
      await page.locator('#click-btn').click();
      await expect(page.locator('#click-count')).toHaveText('2');
    });

    test('dblclick() — 雙擊區域，驗證狀態改變', async ({ page }) => {
      const dblClickArea = page.locator('#dblclick-area');

      // 初始狀態：不含 activated class
      await expect(dblClickArea).not.toHaveClass(/activated/);

      // 雙擊
      await dblClickArea.dblclick();

      // 驗證狀態改變：包含 activated class
      await expect(dblClickArea).toHaveClass(/activated/);
    });

    test('fill() — 填入文字，驗證 value', async ({ page }) => {
      const fillInput = page.locator('#fill-input');

      // 使用 fill() 填入文字（會先清空再輸入）
      await fillInput.fill('Hello Playwright！');

      // 驗證 input 的值
      await expect(fillInput).toHaveValue('Hello Playwright！');
    });

    test('pressSequentially() — 逐字輸入', async ({ page }) => {
      const typeInput = page.locator('#type-input');

      // 使用 pressSequentially() 模擬真實鍵盤逐字輸入
      await typeInput.pressSequentially('逐字輸入測試', { delay: 50 });

      // 驗證輸入值
      await expect(typeInput).toHaveValue('逐字輸入測試');
    });

    test('check() — 勾選 checkbox', async ({ page }) => {
      const termsCheckbox = page.locator('#check-terms');

      // 初始未勾選
      await expect(termsCheckbox).not.toBeChecked();

      // 勾選
      await termsCheckbox.check();

      // 驗證已勾選
      await expect(termsCheckbox).toBeChecked();
    });

    test('uncheck() — 取消勾選 checkbox', async ({ page }) => {
      const newsletterCheckbox = page.locator('#check-newsletter');

      // 初始已勾選（HTML 中 checked 屬性）
      await expect(newsletterCheckbox).toBeChecked();

      // 取消勾選
      await newsletterCheckbox.uncheck();

      // 驗證已取消勾選
      await expect(newsletterCheckbox).not.toBeChecked();
    });

    test('selectOption() — 選擇下拉選項（台灣）', async ({ page }) => {
      const countrySelect = page.locator('#select-country');

      // 用 value 選擇選項
      await countrySelect.selectOption('tw');

      // 驗證選取值
      await expect(countrySelect).toHaveValue('tw');

      // 驗證 action-log 顯示正確訊息
      await expect(page.locator('#action-log')).toContainText('台灣');
    });

    test('selectOption() — 選擇下拉選項（日本）', async ({ page }) => {
      const countrySelect = page.locator('#select-country');

      // 用 label 文字選擇選項
      await countrySelect.selectOption({ label: '日本' });

      await expect(countrySelect).toHaveValue('jp');
    });

    test('hover() — 懸停觸發 tooltip 顯示', async ({ page }) => {
      const hoverBtn = page.locator('#hover-btn');
      const tooltip = page.locator('#tooltip-text');

      // hover 前 tooltip 不可見（CSS display:none）
      await expect(tooltip).toBeHidden();

      // 懸停在按鈕上
      await hoverBtn.hover();

      // hover 後 tooltip 變為可見
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText('hover 觸發成功');
    });

    test('press(Enter) — 鍵盤按鍵送出', async ({ page }) => {
      const keyInput = page.locator('#key-input');

      // 填入文字後按 Enter
      await keyInput.fill('按下 Enter 測試');
      await keyInput.press('Enter');

      // 驗證 action-log 顯示 Enter 按鍵的結果
      await expect(page.locator('#action-log')).toContainText('按下 Enter');
    });

    test('fill() + textarea — 多行文字輸入', async ({ page }) => {
      const textarea = page.locator('#textarea-input');

      // 在 textarea 中填入多行文字
      await textarea.fill('第一行文字\n第二行文字\n第三行文字');

      // 驗證值包含換行
      await expect(textarea).toHaveValue('第一行文字\n第二行文字\n第三行文字');
    });

  });

  test.describe('drag-drop 頁面互動', () => {

    test('dragAndDrop() — 拖放方塊 A 到方塊 B', async ({ page }) => {
      await page.goto(`${BASE_URL}/pages/drag-drop.html`);

      const boxA = page.locator('#boxA');
      const boxB = page.locator('#boxB');

      // 驗證初始狀態
      await expect(boxA).toBeVisible();
      await expect(boxB).toBeVisible();
      await expect(boxA).toContainText('方塊 A');

      // 執行拖放操作
      await page.dragAndDrop('#boxA', '#boxB');

      // 驗證拖放成功（result 訊息出現）
      await expect(page.locator('#result')).toContainText('拖放成功');
    });

  });

  test.describe('dropdown 頁面互動', () => {

    test('selectOption() — 選擇下拉選單選項 1', async ({ page }) => {
      await page.goto(`${BASE_URL}/pages/dropdown.html`);

      const dropdown = page.locator('#dropdown');

      // 選擇選項 1
      await dropdown.selectOption('1');
      await expect(dropdown).toHaveValue('1');

      // 驗證結果訊息
      await expect(page.locator('#result')).toContainText('選項 1');
    });

    test('selectOption() — 依文字選擇下拉選單選項 2', async ({ page }) => {
      await page.goto(`${BASE_URL}/pages/dropdown.html`);

      const dropdown = page.locator('#dropdown');

      // 用 label 文字選擇
      await dropdown.selectOption({ label: '選項 2' });
      await expect(dropdown).toHaveValue('2');
    });

  });

  test('💥 [錯誤示範] selectOption 指定不存在的選項值', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/actions-demo.html`);
    // 錯誤：選項值 'fr'（法國）不在下拉選單中，selectOption 會拋出例外
    await page.locator('#select-country').selectOption('fr');
  });

});
