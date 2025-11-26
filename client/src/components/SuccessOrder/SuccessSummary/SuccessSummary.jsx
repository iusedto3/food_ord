import React from "react";
import { formatVND, formatDate } from "../../../utils/format";
// Lưu ý: Đảm bảo bạn đã import CSS nếu cần, hoặc dùng chung CSS toàn cục

const SuccessSummary = ({ order }) => {
  if (!order) {
    return <div className="card">Đang tải dữ liệu đơn hàng...</div>;
  }

  const items = order.items || [];

  // 1. Tính toán lại dựa trên dữ liệu đã lưu trong DB (Snapshot)
  const subtotal = items.reduce((s, it) => s + (it.totalPrice || 0), 0);
  const shipping = order.shippingFee || 0;
  const discount = order.discountAmount || 0;

  // Tính tổng để hiển thị (Hoặc dùng order.amount nếu backend đã lưu tổng cuối)
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
              {/* Hiển thị chi tiết (Size, Topping...) nếu có */}
              <div style={{ fontSize: "13px", color: "#666" }}>
                {item.size && <span>Size: {item.size} </span>}
                {item.quantity > 1 && <span>x{item.quantity}</span>}
              </div>
            </div>

            {/* Giá tiền */}
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

        {/* Dòng giảm giá: Thêm style màu xanh */}
        {discount > 0 && (
          <div
            className="total-row"
            style={{ color: "#2e7d32", fontWeight: "500" }}
          >
            <span>
              Voucher {order.voucherCode ? `(${order.voucherCode})` : ""}
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
