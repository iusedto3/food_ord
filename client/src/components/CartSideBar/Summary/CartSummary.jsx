// CartSummary.jsx
import React, { useContext, useState } from "react";
import "./CartSummary.css";
import { StoreContext } from "../../../contexts/StoreContext";

const CartSummary = () => {
  const {
    cartItems,
    discountAmount,
    appliedVoucher,
    applyVoucher,
    getTotalCartAmount,
  } = useContext(StoreContext);

  const [voucherCode, setVoucherCode] = useState("");

  const subtotal = Number(getTotalCartAmount()) || 0;
  const delivery = 15000;
  const discount = Number(discountAmount) || 0;
  const totalPay = subtotal - discount + delivery;

  const handleApply = async () => {
    if (!voucherCode.trim()) return;
    await applyVoucher(voucherCode.trim());
  };

  return (
    <div className="cart-box summary-box">
      <h3 className="box-title">Tóm tắt đơn hàng</h3>

      <div className="summary-row">
        <span>Tổng phụ</span>
        <span>{subtotal.toLocaleString()}đ</span>
      </div>

      <div className="summary-row voucher-row">
        <input
          className="voucher-input"
          type="text"
          placeholder="Nhập mã giảm giá..."
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value)}
        />
        <button className="voucher-btn" onClick={handleApply}>
          Áp dụng
        </button>
      </div>

      {discount > 0 && (
        <div className="summary-row discount-row">
          <span>Giảm giá ({appliedVoucher?.code})</span>
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
