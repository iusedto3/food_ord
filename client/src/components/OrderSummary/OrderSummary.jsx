import React, { useContext, useState } from "react";
import { StoreContext } from "../../contexts/StoreContext";
import { FiChevronRight, FiInfo } from "react-icons/fi";
import "./OrderSummary.css";

const OrderSummary = ({ onPlaceOrder, loading }) => {
  // 1. Lấy toàn bộ hàm tính toán từ Context (Single Source of Truth)
  const {
    cartItems,
    getTotalCartAmount,
    getDiscountAmount,
    getFinalTotal,
    deliveryFee, // Lấy phí ship từ Context (để khớp với bên Cart)
  } = useContext(StoreContext);

  const [agreed, setAgreed] = useState(true);

  // 2. Gọi hàm để lấy giá trị (Không tự tính tay nữa)
  const subtotal = getTotalCartAmount();
  const discount = getDiscountAmount();
  const total = getFinalTotal();

  // Xử lý hiển thị phí ship: Nếu giỏ rỗng thì hiện 0, ngược lại hiện phí ship từ Context
  const displayedDeliveryFee = subtotal === 0 ? 0 : deliveryFee;

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

        {/* Dòng Voucher (chỉ hiện khi có tiền giảm > 0) */}
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
          <strong>{displayedDeliveryFee.toLocaleString()} ₫</strong>
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
          // Disable nếu: Chưa đồng ý HOẶC Đang loading HOẶC Giỏ hàng rỗng
          disabled={!agreed || loading || subtotal === 0}
          onClick={onPlaceOrder}
        >
          {loading ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </div>
    </>
  );
};

export default OrderSummary;
