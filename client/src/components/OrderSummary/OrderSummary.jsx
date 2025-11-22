import React, { useContext } from "react";
import "./OrderSummary.css";
import { StoreContext } from "../../contexts/StoreContext";
import { formatVND } from "../../utils/format";

const OrderSummary = ({ voucher }) => {
  const { cartItems, getTotalCartAmount } = useContext(StoreContext);
  const subtotal = getTotalCartAmount();
  const shippingFee = subtotal > 0 ? 15000 : 0; // Phí ship ví dụ
  const discount = voucher?.discountAmount || 0;
  const total = subtotal + shippingFee - discount;

  return (
    <div className="order-summary">
      <h2 className="summary-title">Tóm tắt đơn hàng</h2>
      
      <div className="summary-items">
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div key={`${item._id}-${index}`} className="summary-item">
              <img src={`http://localhost:4000/images/${item.image}`} alt={item.name} className="summary-item-image" />
              <div className="summary-item-details">
                <span className="summary-item-name">{item.name}</span>
                {item.size && <div className="summary-item-sub">Kích thước: {item.size}</div>}
                {item.crust && <div className="summary-item-sub">Đế bánh: {item.crust.label}</div>}
                {item.toppings?.length > 0 && (
                  <div className="summary-item-sub">
                    Topping: {item.toppings.map((t) => t.label).join(", ")}
                  </div>
                )}
                {item.note && <div className="summary-item-sub">Ghi chú: {item.note}</div>}
                <span className="summary-item-quantity">SL: {item.quantity}</span>
              </div>
              <span className="summary-item-price">{formatVND(item.price * item.quantity)}</span>
            </div>
          ))
        ) : (
          <p>Giỏ hàng của bạn đang trống.</p>
        )}
      </div>

      <div className="summary-total">
        <div className="summary-total-row">
          <span>Tạm tính</span>
          <span>{formatVND(subtotal)}</span>
        </div>
        <div className="summary-total-row">
          <span>Phí giao hàng</span>
          <span>{formatVND(shippingFee)}</span>
        </div>
        {discount > 0 && (
          <div className="summary-total-row discount-row">
            <span>Giảm giá</span>
            <span>- {formatVND(discount)}</span>
          </div>
        )}
        <div className="summary-total-row total-row">
          <span>Tổng cộng</span>
          <span>{formatVND(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
