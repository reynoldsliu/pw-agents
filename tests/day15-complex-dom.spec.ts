// 對應文章：Day 15 — 複雜 DOM 的迷霧：CSS Selector、XPath 與 Chaining

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const PAGE_URL = `${BASE_URL}/pages/complex-dom.html`;

test.describe('Day 15：複雜 DOM 的迷霧 — CSS Selector、XPath 與 Chaining', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  // --- CSS Selector ---

  test('CSS Selector — 用 class 找到商品卡片', async ({ page }) => {
    // 用 .product-card 類別定位所有商品卡片
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(3);
  });

  test('CSS Selector — 用偽類 :not([disabled]) 找到可加入購物車的按鈕', async ({ page }) => {
    // 找到未停用的「加入購物車」按鈕
    const enabledBtns = page.locator('.add-cart-btn:not([disabled])');
    await expect(enabledBtns).toHaveCount(2);
  });

  test('CSS Selector — 用屬性選擇器 [disabled] 找到停用按鈕', async ({ page }) => {
    const disabledBtn = page.locator('.add-cart-btn[disabled]');
    await expect(disabledBtn).toHaveCount(1);
    await expect(disabledBtn).toBeDisabled();
  });

  test('CSS Selector — 子元素選擇器 .product-card .price', async ({ page }) => {
    // 取得所有商品價格
    const prices = page.locator('.product-card .price');
    await expect(prices).toHaveCount(3);

    // 驗證第一個商品的價格
    await expect(prices.first()).toHaveText('$32,000');
  });

  // --- :has-text() ---

  test(':has-text() — 找到包含「重要公告」的區塊', async ({ page }) => {
    // 找到文字包含「重要公告」的 .info-block
    const importantBlocks = page.locator('.info-block:has-text("重要公告")');
    await expect(importantBlocks).toHaveCount(2);
  });

  test(':has-text() — 找到含「系統維護」文字的通知', async ({ page }) => {
    const maintenanceBlock = page.locator('.info-block:has-text("系統")');
    await expect(maintenanceBlock).toBeVisible();
    await expect(maintenanceBlock).toContainText('維護');
  });

  // --- :has() ---

  test(':has() — 找到包含取消按鈕的訂單（待處理）', async ({ page }) => {
    // 找到含有 .cancel-btn 子元素的訂單
    const pendingOrders = page.locator('.order-item:has(.cancel-btn)');
    await expect(pendingOrders).toHaveCount(2);
  });

  test(':has() — 找到包含停用標籤的訂單', async ({ page }) => {
    const pendingOrders = page.locator('.order-item:has(.pending-tag)');
    await expect(pendingOrders).toHaveCount(2);

    // 驗證這些訂單都是「待處理」
    for (const order of await pendingOrders.all()) {
      await expect(order.locator('.status-tag')).toHaveText('待處理');
    }
  });

  // --- filter({ has }) ---

  test('filter({ has }) — 找到含取消按鈕的訂單', async ({ page }) => {
    const cancelableOrders = page.locator('.order-item').filter({
      has: page.locator('.cancel-btn')
    });
    await expect(cancelableOrders).toHaveCount(2);
  });

  test('filter({ hasText }) — 找到已完成的訂單', async ({ page }) => {
    const completedOrder = page.locator('.order-item').filter({ hasText: '已完成' });
    await expect(completedOrder).toHaveCount(1);
    await expect(completedOrder.locator('.order-id')).toHaveText('訂單 #A001');
  });

  // --- Locator Chaining ---

  test('Chaining — 在特定類別內定位子元素', async ({ page }) => {
    // 先定位前端技術類別，再找其中的子項目
    const frontendCategory = page.locator('#category-frontend');
    const frontendItems = frontendCategory.locator('li');

    await expect(frontendItems).toHaveCount(3);
    await expect(frontendItems.first()).toHaveText('React');
    await expect(frontendItems.last()).toHaveText('Playwright');
  });

  test('Chaining — 在後端類別中確認 Node.js 存在', async ({ page }) => {
    const backendCategory = page.locator('#category-backend');
    await expect(backendCategory.getByText('Node.js')).toBeVisible();
    await expect(backendCategory.getByText('Python')).toBeVisible();
    await expect(backendCategory.getByText('Java')).toBeVisible();
  });

  // --- XPath ---

  test('XPath — 用 xpath 選擇器定位元素', async ({ page }) => {
    // 使用 XPath 表達式定位
    const xpathTarget = page.locator('xpath=//span[@id="xpath-span"]');
    await expect(xpathTarget).toBeVisible();
    await expect(xpathTarget).toHaveText('透過 XPath id 定位');
  });

  test('XPath — 找到第一個 .xpath-target 段落', async ({ page }) => {
    const firstPara = page.locator('xpath=(//p[@class="xpath-target"])[1]');
    await expect(firstPara).toContainText('第一段');
  });

  test('XPath — 找到所有 xpath-target 元素', async ({ page }) => {
    const allTargets = page.locator('xpath=//p[@class="xpath-target"]');
    await expect(allTargets).toHaveCount(2);
  });

  // --- 點擊互動 ---

  test('點擊有庫存商品的加入購物車按鈕', async ({ page }) => {
    // 找到「筆記型電腦」的卡片（有庫存）
    const laptopCard = page.locator('.product-card').filter({ hasText: '筆記型電腦' });
    await laptopCard.locator('.add-cart-btn').click();

    await expect(page.locator('#result')).toContainText('筆記型電腦');
  });

  test('點擊待處理訂單的取消按鈕', async ({ page }) => {
    // 找到 A002 訂單並取消
    const order002 = page.locator('.order-item').filter({ hasText: '#A002' });
    await order002.locator('.cancel-btn').click();

    await expect(page.locator('#result')).toContainText('#A002');
  });

  test('💥 [錯誤示範] XPath 條件錯誤 — 找不到任何元素', async ({ page }) => {
    await page.goto(PAGE_URL);
    // 錯誤：class 名稱「produktkarte」不存在，XPath 找不到元素
    const el = page.locator('xpath=//div[@class="produktkarte"]');
    await expect(el.first()).toBeVisible({ timeout: 3000 });
  });

});
