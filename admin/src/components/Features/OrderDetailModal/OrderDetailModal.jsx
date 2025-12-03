import React, { useState } from "react";
import "./OrderDetailModal.css";

const OrderDetailModal = ({ order, onClose, refreshList }) => {
  const [status, setStatus] = useState(order.status);

  const updateStatus = async (newStatus) => {
    setStatus(newStatus);
    try {
      const res = await fetch(
        `http://localhost:4000/api/order/admin/update-status/${order._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (data.success) {
        refreshList?.();
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        {/* --- HEADER --- */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Chi tiết đơn hàng</h3>
            <span className="order-id">#{order.orderId}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* --- STATUS BAR (Giữ Tiếng Anh theo yêu cầu) --- */}
        <div className="status-section">
          <label>Status:</label>
          <select
            className={`status-select ${status}`}
            value={status}
            onChange={(e) => updateStatus(e.target.value)}
          >
            <option value="preparing">Preparing</option>
            <option value="delivering">Delivering</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        {/* --- DANH SÁCH MÓN ĂN --- */}
        <div className="food-list">
          {order.items.map((item, i) => (
            <div className="food-item" key={i}>
              <div className="food-thumb">
                <img
                  src={`http://localhost:4000/images/${item.image}`}
                  onError={(e) =>
                    (e.target.src = "https://placehold.co/80x80?text=No+Img")
                  }
                  alt={item.name}
                />
                <span className="qty-badge">x{item.quantity}</span>
              </div>

              <div className="food-info">
                <div className="food-header">
                  <h4>{item.name}</h4>
                  <span className="food-price">
                    {item.totalPrice.toLocaleString()}đ
                  </span>
                </div>

                <div className="food-details">
                  {item.size && (
                    <p>
                      <span>Size:</span> {item.size}
                    </p>
                  )}

                  {/* 🔥 Hiển thị Đế bánh (Tiếng Việt) */}
                  {item.crust && (
                    <p>
                      <span>Đế bánh:</span> {item.crust}
                    </p>
                  )}

                  {/* Hiển thị Topping */}
                  {item.toppings && item.toppings.length > 0 && (
                    <p>
                      <span>Topping:</span>{" "}
                      {item.toppings.map((t) => t.label).join(", ")}
                    </p>
                  )}

                  {/* 🔥 Hiển thị Ghi chú (Tiếng Việt) */}
                  {item.note && (
                    <p className="food-note">Ghi chú: "{item.note}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- FOOTER --- */}
        <div className="modal-footer">
          <div className="total-row">
            <span>Tổng cộng:</span>
            <span className="total-price">
              {order.amount.toLocaleString()}đ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
