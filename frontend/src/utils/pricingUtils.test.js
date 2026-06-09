// ============================================================
// NEW UNIT TESTS (Sprint 5) - Frontend
// Tests 26-37: discount pricing, refund amount, 30-day refund
// window, and refund eligibility.
// ============================================================

import {
  applyDiscount,
  calculateRefund,
  isWithinRefundWindow,
  canRequestRefund
} from './pricingUtils';

describe('NEW - Discount Pricing', () => {
  test('26. No discount returns the original price', () => {
    expect(applyDiscount(1000, 0)).toBe(1000);
  });

  test('27. 20% discount on 1000 returns 800', () => {
    expect(applyDiscount(1000, 20)).toBe(800);
  });

  test('28. Discount result is rounded to 2 decimals', () => {
    expect(applyDiscount(99.99, 10)).toBe(89.99);
  });

  test('29. 100% discount returns 0', () => {
    expect(applyDiscount(500, 100)).toBe(0);
  });
});

describe('NEW - Refund Amount', () => {
  test('30. Refund uses base price when no discount was applied', () => {
    expect(calculateRefund({ price: 200, quantity: 2 })).toBe(400);
  });

  test('31. Refund uses the discounted finalPrice paid at purchase', () => {
    expect(calculateRefund({ price: 200, finalPrice: 150, quantity: 2 })).toBe(300);
  });

  test('32. Refund supports the qty field as well as quantity', () => {
    expect(calculateRefund({ price: 100, qty: 3 })).toBe(300);
  });
});

describe('NEW - Refund Window (30 days)', () => {
  test('33. Order placed today is within the window', () => {
    const now = new Date('2026-01-15');
    expect(isWithinRefundWindow('2026-01-15', now)).toBe(true);
  });

  test('34. Order placed 29 days ago is within the window', () => {
    const now = new Date('2026-01-30');
    expect(isWithinRefundWindow('2026-01-01', now)).toBe(true);
  });

  test('35. Order placed 31 days ago is OUTSIDE the window', () => {
    const now = new Date('2026-02-01');
    expect(isWithinRefundWindow('2026-01-01', now)).toBe(false);
  });
});

describe('NEW - Refund Eligibility', () => {
  test('36. Delivered item within window can be refunded', () => {
    const now = new Date('2026-01-10');
    const item = { itemStatus: 'Delivered' };
    expect(canRequestRefund(item, '2026-01-05', now)).toBe(true);
  });

  test('37. Item still Processing cannot be refunded', () => {
    const now = new Date('2026-01-10');
    const item = { itemStatus: 'Processing' };
    expect(canRequestRefund(item, '2026-01-05', now)).toBe(false);
  });
});