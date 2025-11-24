import React, { useContext, useState } from "react";
import { StoreContext } from "../../contexts/StoreContext";
import { FiChevronRight, FiInfo } from "react-icons/fi";
import "./OrderSummary.css";

const OrderSummary = ({ onPlaceOrder, loading }) => {
  const { cartItems, getTotalCartAmount, voucher } = useContext(StoreContext);
  const [agreed, setAgreed] = useState(true);

  const subtotal = getTotalCartAmount();

  // 🟢 CẬP NHẬT 1: Logic phí giao hàng
  // Nếu giỏ hàng có món thì phí là 15.000đ, nếu rỗng thì 0đ
  const deliveryFee = subtotal === 0 ? 0 : 15000;

  const discount = voucher ? Number(voucher.discount) : 0;

  // Tính tổng: (Tổng tiền + Ship - Voucher), không được âm
  const total = Math.max(0, subtotal + deliveryFee - discount);

  return (
    <>
      {/* Khối Tóm tắt Giỏ hàng */}
      <div className="summary-card-box">
        <div className="summary-header">
          <h3>Giỏ hàng của tôi</h3>
          <FiChevronRight />
        </div>
        <div className="summary-subtitle">
          Có {cartItems.length} sản phẩm trong giỏ hàng
        </div>

        <div className="summary-row">
          <span>Tạm tính</span>
          <strong>{subtotal.toLocaleString()} ₫</strong>
        </div>

        {/* 🔴 ĐÃ XÓA: Dòng "Giảm giá thành viên" theo yêu cầu */}

        {/* Dòng Voucher (chỉ hiện khi có áp dụng mã) */}
        {discount > 0 && (
          <div className="summary-row" style={{ color: "#2e7d32" }}>
            <span>Voucher giảm giá</span>
            <strong>-{discount.toLocaleString()} ₫</strong>
          </div>
        )}

        <div className="summary-row">
          <span>
            Phí giao hàng <FiInfo size={12} style={{ color: "#999" }} />
          </span>
          <strong>{deliveryFee.toLocaleString()} ₫</strong>
        </div>

        <div className="summary-row total">
          <span className="total-label">Tổng cộng</span>
          <span className="total-value">{total.toLocaleString()} ₫</span>
        </div>
      </div>

      {/* Khối Điều khoản & Nút Đặt Hàng */}
      <div className="checkout-agreement">
        <label className="agreement-checkbox">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            Tôi đồng ý với <u>các điều khoản và điều kiện</u>
          </span>
        </label>

        <button
          className="btn-place-order-final"
          disabled={!agreed || loading || subtotal === 0} // Disable nếu giỏ hàng rỗng
          onClick={onPlaceOrder}
        >
          {loading ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </div>
    </>
  );
};

export default OrderSummary;
