import React from "react";
import { formatVND, formatDate } from "../../../utils/format";

const SuccessSummary = ({ order }) => {
  if (!order) {
    return <div className="card">Đang tải dữ liệu đơn hàng...</div>;
  }

  const items = order.items || [];
  const subtotal = items.reduce((s, it) => s + (it.totalPrice || 0), 0);
  const shipping = order.shippingFee || 0;
  const total = subtotal + shipping;

  return (
    <div className="card success-summary">
      {/* ---- HEADER ---- */}
      <h3 style={{ fontWeight: "600" }}>
        Có {items.length} sản phẩm trong đơn hàng của bạn
      </h3>

      <p style={{ fontSize: "14px", marginTop: "4px", color: "#555" }}>
        Ngày đặt: {formatDate(order.createdAt, true)}
      </p>

      {/* ---- LIST ITEM ---- */}
      <div className="items-list">
        {items.map((item, idx) => (
          <div className="item-row" key={`${item._id}-${idx}`}>
            {/* Hình ảnh */}
            <div className="item-thumb">
              <img
                src={`http://localhost:4000/images/${item.image}`}
                alt={item.name}
              />
            </div>

            {/* Thông tin món */}
            <div className="item-info">
              <div className="item-name">{item.name}</div>

              {/* ⭐ Size KHÔNG in đậm */}
              {item.size && (
                <div className="item-size">
                  <span>Kích cỡ: {item.size}</span>
                </div>
              )}

              {/* Crust / Đế bánh */}
              {item.crust && (
                <div className="item-crust">
                  <span>Đế bánh: {item.crust.label}</span>
                </div>
              )}

              {/* Toppings */}
              {item.toppings?.length > 0 && (
                <div className="item-toppings">
                  {item.toppings.map((tp, i) => (
                    <div key={i} className="topping-line">
                      + {tp.label}
                    </div>
                  ))}
                </div>
              )}

              {/* Ghi chú */}
              {item.note && (
                <div className="item-note">
                  <em>Ghi chú: {item.note}</em>
                </div>
              )}
            </div>

            {/* Số lượng */}
            <div className="item-qty">x{item.quantity}</div>

            {/* Giá */}
            <div className="item-price">{formatVND(item.totalPrice)}</div>
          </div>
        ))}
      </div>

      {/* ---- TOTALS ---- */}
      <div className="summary-totals">
        <div className="total-row">
          <span>Tạm tính</span>
          <span>{formatVND(subtotal)}</span>
        </div>

        <div className="total-row">
          <span>Phí giao hàng</span>
          <span>{formatVND(shipping)}</span>
        </div>

        <div
          className="total-row"
          style={{ fontWeight: "700", fontSize: "18px" }}
        >
          <span>Tổng cộng</span>
          <span>{formatVND(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default SuccessSummary;
