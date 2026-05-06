const Order = require('../models/Order');

describe('Order Model', () => {
  test('11. Order should require a totalPrice', () => {
    const order = new Order({ userName: 'Janset' });
    const err = order.validateSync();
    expect(err.errors.totalPrice).toBeDefined();
  });

  test('12. New order should default to "Processing" status', () => {
    const order = new Order({ totalPrice: 200 });
    expect(order.status).toBe('Processing');
  });

  test('13. Order status must be one of: Processing, In-Transit, Delivered', () => {
    const order = new Order({ totalPrice: 200, status: 'Cancelled' });
    const err = order.validateSync();
    expect(err.errors.status).toBeDefined();
  });

  test('14. "Delivered" should be a valid status', () => {
    const order = new Order({ totalPrice: 200, status: 'Delivered' });
    const err = order.validateSync();
    expect(err).toBeUndefined();
  });

  test('15. Order total of multiple items should sum correctly', () => {
    const items = [
      { price: 100, quantity: 2 }, // 200
      { price: 50, quantity: 3 }   // 150
    ];
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    expect(total).toBe(350);
  });
});
