import React from "react";
import "./CartSummary.css";

// Component này bây giờ CHỈ NHẬN PROPS để hiển thị.
// Không tự tính toán, không tự gọi Context để tránh sai lệch.
const CartSummary = ({ subtotal, discount }) => {
  const delivery = 15000;

  // Đảm bảo tổng không bị âm
  const totalPay = Math.max(0, subtotal - discount) + delivery;

  return (
    <div className="cart-box summary-box">
      <h3 className="box-title">Tóm tắt đơn hàng</h3>

      <div className="summary-row">
        <span>Tạm tính</span>
        {/* Hiển thị số tiền được truyền từ PageCart -> Sidebar -> Summary */}
        <span>{subtotal.toLocaleString()}đ</span>
      </div>

      {discount > 0 && (
        <div
          className="summary-row discount-row"
          style={{ color: "#276749", fontWeight: "bold" }}
        >
          <span>Voucher giảm giá</span>
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
        <span>{totalPay.toLocaleString()}đ</span>
      </div>
    </div>
  );
};

export default CartSummary;
