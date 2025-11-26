import React from "react";
import "./CartSummary.css";

// Nhận thêm props 'delivery' và 'total' để không phải tự tính
const CartSummary = ({
  subtotal = 0,
  discount = 0,
  delivery = 0,
  total = 0,
}) => {
  return (
    <div className="cart-box summary-box">
      <h3 className="box-title">Tóm tắt đơn hàng</h3>

      <div className="summary-row">
        <span>Tạm tính</span>
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
        {/* Nhận giá trị từ props thay vì fix cứng 15000 */}
        <span>
          {delivery === 0 ? "Miễn phí" : `${delivery.toLocaleString()}đ`}
        </span>
      </div>

      <hr />

      <div className="summary-total">
        <span>Tổng cộng</span>
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
          {total.toLocaleString()}đ
        </span>
      </div>
    </div>
  );
};

export default CartSummary;
