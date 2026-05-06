const Product = require('../models/Product');

describe('Product Model', () => {
  test('6. Product should require a name', () => {
    const product = new Product({ price: 100 });
    const err = product.validateSync();
    expect(err.errors.name).toBeDefined();
  });

  test('7. Product should require a price', () => {
    const product = new Product({ name: 'Mouse' });
    const err = product.validateSync();
    expect(err.errors.price).toBeDefined();
  });

  test('8. Product stock should default to 0', () => {
    const product = new Product({ name: 'GPU', price: 5000 });
    expect(product.stock).toBe(0);
  });

  test('9. Product discount should default to 0', () => {
    const product = new Product({ name: 'Keyboard', price: 500 });
    expect(product.discount).toBe(0);
  });

  test('10. Valid product should pass validation', () => {
    const product = new Product({
      name: 'Headset',
      price: 1200,
      stock: 5,
      category: 'Headset'
    });
    const err = product.validateSync();
    expect(err).toBeUndefined();
  });
});