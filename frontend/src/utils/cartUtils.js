// Helper functions for cart and review logic

export const calculateTotal = (cart) => {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export const addToCart = (cart, product) => {
  const existing = cart.find(i => i._id === product._id);
  if (existing) {
    return cart.map(i =>
      i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
    );
  }
  return [...cart, { ...product, quantity: 1 }];
};

export const removeFromCart = (cart, productId) => {
  return cart.filter(i => i._id !== productId);
};

export const canReview = (orders, productId) => {
  return orders.some(
    o => o.status === 'Delivered' &&
         o.items.some(i => i.productId === productId)
  );
};
