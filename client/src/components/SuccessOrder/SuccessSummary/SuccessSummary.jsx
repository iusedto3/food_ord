import React from "react";
import { formatVND, formatDate } from "../../../utils/format";

const SuccessSummary = ({ order }) => {
  if (!order) {
    return <div className="card">Đang tải dữ liệu đơn hàng...</div>;
  }

  const items = order.items || [];

  // 1. Tính toán các loại tiền
  const subtotal = items.reduce((s, it) => s + (it.totalPrice || 0), 0);
  const shipping = order.shippingFee || 0;

  // 👇 Lấy tiền giảm giá từ dữ liệu order (nếu không có thì bằng 0)
  const discount = order.discountAmount || 0;

  // 👇 Tính tổng tiền cuối cùng (Subtotal + Ship - Discount)
  const total = Math.max(0, subtotal + shipping - discount);

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
                onError={(e) => {
                  e.target.src = "https://placehold.co/80x80?text=No+Img";
                }}
              />
            </div>

            {/* Thông tin món */}
            <div className="item-info">
              <div className="item-name">{item.name}</div>

              {item.size && (
                <div className="item-size">
                  <span>Kích cỡ: {item.size}</span>
                </div>
              )}

              {item.crust && (
                <div className="item-crust">
                  <span>Đế bánh: {item.crust.label}</span>
                </div>
              )}

              {item.toppings?.length > 0 && (
                <div className="item-toppings">
                  {item.toppings.map((tp, i) => (
                    <div key={i} className="topping-line">
                      + {tp.label}
                    </div>
                  ))}
                </div>
              )}

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

        {/* 👇 BỔ SUNG: Dòng giảm giá (Chỉ hiện khi có discount) */}
        {discount > 0 && (
          <div className="summary-row discount">
            <span>
              Voucher giảm giá{" "}
              {order.voucherCode ? `(${order.voucherCode})` : ""}
            </span>
            <span>-{formatVND(discount)}</span>
          </div>
        )}

        <div className="total-row">
          <span>Phí giao hàng</span>
          <span>{formatVND(shipping)}</span>
        </div>

        <div
          className="total-row"
          style={{
            fontWeight: "700",
            fontSize: "18px",
            marginTop: "10px",
            borderTop: "1px solid #eee",
            paddingTop: "10px",
          }}
        >
          <span>Tổng cộng</span>
          <span>{formatVND(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default SuccessSummary;
