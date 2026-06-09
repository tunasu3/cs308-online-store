// Pricing, discount, and refund helper functions.
// Pure functions so they can be unit-tested without the UI.

// Price after a percentage discount (0-100). Rounded to 2 decimals.
export const applyDiscount = (price, discountPercent = 0) => {
  if (discountPercent <= 0) return price;
  const final = price * (1 - discountPercent / 100);
  return Math.round(final * 100) / 100;
};

// Refund amount for a single line item, based on the (possibly discounted)
// price paid at purchase time times the quantity.
export const calculateRefund = (item) => {
  const unit = item.finalPrice !== undefined ? item.finalPrice : item.price;
  return unit * (item.quantity || item.qty || 0);
};

// A refund is only allowed within `windowDays` (default 30) of the order date.
export const isWithinRefundWindow = (orderDate, now = new Date(), windowDays = 30) => {
  const diffMs = new Date(now) - new Date(orderDate);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= windowDays;
};

// Only delivered items may be refunded.
export const canRequestRefund = (item, orderDate, now = new Date()) => {
  return item.itemStatus === 'Delivered' && isWithinRefundWindow(orderDate, now);
};

// Profit on a single product = (price - cost) for the units sold.
export const calculateProfit = (price, cost, quantity = 1) => {
  return (price - cost) * quantity;
};