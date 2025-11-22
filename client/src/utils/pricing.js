// src/utils/pricing.js

/**
 * ================================
 * 1) Tính giá 1 món ăn
 * ================================
 */
export function calculateItemPrice(item) {
  if (!item) return 0;

  const basePrice = item.price || 0;
  const crustPrice = item.crust?.price || 0;
  const toppings = item.toppings || [];
  const quantity = item.quantity || 1;

  // ----- SIZE MULTIPLIER -----
  let sizeMultiplier = 1;

  if (item.size === "Lớn") sizeMultiplier = 1.35;
  if (item.size === "Nhỏ") sizeMultiplier = 0.9;

  const sizePrice = basePrice * sizeMultiplier;

  // ----- TOPPING PRICE -----
  const toppingPrice = toppings.reduce(
    (sum, t) => sum + (t.price || 0),
    0
  );

  // ----- FINAL UNIT PRICE -----
  const unitPrice = Math.round(sizePrice + crustPrice + toppingPrice);

  return unitPrice;
}

/**
 * ================================
 * 2) Subtotal giỏ hàng
 * ================================
 */
export function calculateCartSubtotal(cartItems = []) {
  return cartItems.reduce((sum, item) => {
    const unitPrice = calculateItemPrice(item);
    return sum + unitPrice * (item.quantity || 1);
  }, 0);
}

/**
 * ================================
 * 3) Tổng hóa đơn
 * ================================
 */
export function calculateOrderTotals(cartItems = [], shippingFee = 0, voucher = null) {
  const subtotal = calculateCartSubtotal(cartItems);

  let discount = 0;

  if (voucher) {
    if (voucher.type === "percent") discount = subtotal * (voucher.value / 100);
    if (voucher.type === "fixed") discount = voucher.value;
  }

  const grandTotal = Math.max(subtotal + shippingFee - discount, 0);

  return {
    subtotal,
    shipping: shippingFee,
    discount,
    grandTotal,
  };
}
