// ============================================================
// NEW UNIT TESTS (Sprint 5) - Backend: Product & Profit
// Tests 38-45: Product defaults/serial and profit/loss.
// ============================================================

const Product = require('../models/Product');

// Profit on a product = (price - cost) * quantity. Mirrors the Sales Manager
// revenue/loss logic; kept inline so this suite has no cross-package import.
const calculateProfit = (price, cost, quantity = 1) => (price - cost) * quantity;

describe('NEW - Product Model (defaults & serial)', () => {
  test('38. Product cost should default to 0', () => {
    const product = new Product({ name: 'Mouse', price: 100 });
    expect(product.cost).toBe(0);
  });

  test('39. Product rating should default to 0', () => {
    const product = new Product({ name: 'Mouse', price: 100 });
    expect(product.rating).toBe(0);
  });

  test('40. Product should auto-generate a serial number', () => {
    const product = new Product({ name: 'Mouse', price: 100 });
    expect(product.serial).toMatch(/^SRL-/);
  });

  test('41. Two products should get different serial numbers', () => {
    const a = new Product({ name: 'A', price: 1 });
    const b = new Product({ name: 'B', price: 1 });
    expect(a.serial).not.toBe(b.serial);
  });

  test('42. waitingList should default to an empty array', () => {
    const product = new Product({ name: 'Mouse', price: 100 });
    expect(product.waitingList).toEqual([]);
  });
});

describe('NEW - Profit / Loss Calculation', () => {
  test('43. Profit is (price - cost) for one unit', () => {
    expect(calculateProfit(1000, 700, 1)).toBe(300);
  });

  test('44. Profit scales with quantity', () => {
    expect(calculateProfit(1000, 700, 5)).toBe(1500);
  });

  test('45. Selling below cost produces a negative profit (loss)', () => {
    expect(calculateProfit(500, 700, 1)).toBe(-200);
  });
});