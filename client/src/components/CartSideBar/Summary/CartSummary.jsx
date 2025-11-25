import React from "react";
import "./CartSummary.css";

const CartSummary = ({ subtotal, discount }) => {
  const delivery = 15000;

  // Tính tổng tiền: (Tổng phụ + Ship) - Giảm giá
  const totalPay = Math.max(0, subtotal + delivery - discount);

  return (
    <div className="cart-box summary-box">
      <h3 className="box-title">Tóm tắt đơn hàng</h3>

      <div className="summary-row">
        <span>Tổng phụ</span>
        <span>{subtotal.toLocaleString()}đ</span>
      </div>

      {/* Chỉ hiện dòng giảm giá nếu có giá trị > 0 */}
      {discount > 0 && (
        <div
          className="summary-row discount-row"
          style={{ color: "#2e7d32", fontWeight: "bold" }}
        >
          <span>Giảm giá</span>
          <span>-{discount.toLocaleString()}đ</span>
        </div>
      )}

      <div className="summary-row">
        <span>Phí giao hàng</span>
        <span>{delivery.toLocaleString()}đ</span>
      </div>

      <hr />

      <div className="summary-total">
        <span>Tổng cộng</span>
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
          {totalPay.toLocaleString()}đ
        </span>
      </div>
    </div>
  );
};

export default CartSummary;
