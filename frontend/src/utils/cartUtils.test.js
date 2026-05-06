import { calculateTotal, addToCart, removeFromCart, canReview } from './cartUtils';

describe('Cart Utilities', () => {
  test('16. Empty cart total should be 0', () => {
    expect(calculateTotal([])).toBe(0);
  });

  test('17. Cart total should sum price * quantity', () => {
    const cart = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 }
    ];
    expect(calculateTotal(cart)).toBe(250);
  });

  test('18. addToCart should add new product with quantity 1', () => {
    const result = addToCart([], { _id: 'a', name: 'GPU', price: 5000 });
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(1);
  });

  test('19. addToCart should increase quantity if product already in cart', () => {
    const cart = [{ _id: 'a', name: 'GPU', price: 5000, quantity: 1 }];
    const result = addToCart(cart, { _id: 'a', name: 'GPU', price: 5000 });
    expect(result[0].quantity).toBe(2);
  });

  test('20. addToCart should not duplicate same product', () => {
    const cart = [{ _id: 'a', quantity: 1, price: 10 }];
    const result = addToCart(cart, { _id: 'a', price: 10 });
    expect(result).toHaveLength(1);
  });

  test('21. removeFromCart should remove the matching product', () => {
    const cart = [{ _id: 'a' }, { _id: 'b' }];
    expect(removeFromCart(cart, 'a')).toEqual([{ _id: 'b' }]);
  });

  test('22. removeFromCart should not affect other products', () => {
    const cart = [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }];
    expect(removeFromCart(cart, 'b')).toHaveLength(2);
  });
});

describe('Review Eligibility', () => {
  test('23. User CAN review if order is Delivered and contains the product', () => {
    const orders = [{
      status: 'Delivered',
      items: [{ productId: 'p1' }]
    }];
    expect(canReview(orders, 'p1')).toBe(true);
  });

  test('24. User CANNOT review if order is still Processing', () => {
    const orders = [{
      status: 'Processing',
      items: [{ productId: 'p1' }]
    }];
    expect(canReview(orders, 'p1')).toBe(false);
  });

  test('25. User CANNOT review a product they never ordered', () => {
    const orders = [{
      status: 'Delivered',
      items: [{ productId: 'p1' }]
    }];
    expect(canReview(orders, 'p2')).toBe(false);
  });
});