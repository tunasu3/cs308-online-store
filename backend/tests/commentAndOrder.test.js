// ============================================================
// NEW UNIT TESTS (Sprint 5) - Backend: Comment & Order
// Tests 46-50: Comment validation and Order item-status enum.
// ============================================================

const Comment = require('../models/Comment');
const Order = require('../models/Order');

describe('NEW - Comment Model', () => {
  test('46. Comment should require a rating', () => {
    const c = new Comment({ productId: '507f1f77bcf86cd799439011', userId: '507f1f77bcf86cd799439012', userName: 'Janset', comment: 'Nice' });
    const err = c.validateSync();
    expect(err.errors.rating).toBeDefined();
  });

  test('47. Comment rating above 5 should be invalid', () => {
    const c = new Comment({ productId: '507f1f77bcf86cd799439011', userId: '507f1f77bcf86cd799439012', userName: 'Janset', rating: 6, comment: 'Great' });
    const err = c.validateSync();
    expect(err.errors.rating).toBeDefined();
  });

  test('48. New comment should default to NOT approved', () => {
    const c = new Comment({ productId: '507f1f77bcf86cd799439011', userId: '507f1f77bcf86cd799439012', userName: 'Janset', rating: 5, comment: 'Great' });
    expect(c.approved).toBe(false);
  });
});

describe('NEW - Order Model (item status)', () => {
  test('49. "Refund Requested" should be a valid item status', () => {
    const order = new Order({
      totalPrice: 100,
      items: [{ name: 'GPU', price: 100, quantity: 1, itemStatus: 'Refund Requested' }]
    });
    const err = order.validateSync();
    expect(err).toBeUndefined();
  });

  test('50. An invalid item status should fail validation', () => {
    const order = new Order({
      totalPrice: 100,
      items: [{ name: 'GPU', price: 100, quantity: 1, itemStatus: 'Lost' }]
    });
    const err = order.validateSync();
    expect(err).toBeDefined();
  });
});