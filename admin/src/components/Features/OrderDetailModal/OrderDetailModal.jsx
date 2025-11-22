import React, { useState } from "react";
import "./OrderDetailModal.css";

const OrderDetailModal = ({ order, onClose, refreshList }) => {
  const [status, setStatus] = useState(order.status);

  // API cập nhật trạng thái
  const updateStatus = async (newStatus) => {
    setStatus(newStatus);

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
  };
  console.log(order);

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Chi tiết đơn hàng</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Dropdown trạng thái */}
        <div className="status-row">
          <b>Trạng thái đơn:</b>
          <select
            className={`status-select ${status}`}
            value={status}
            onChange={(e) => updateStatus(e.target.value)}
          >
            <option value="preparing">Đang chuẩn bị</option>
            <option value="delivering">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="canceled">Đã hủy</option>
          </select>
        </div>

        {/* Danh sách món */}
        <div className="food-list">
          {order.items.map((item, i) => (
            <div className="food-item" key={i}>
              <img
                src={`http://localhost:4000/images/${item.image}`}
                className="food-img"
              />

              <div className="food-info">
                <h4>{item.name}</h4>

                {item.size && (
                  <p>
                    <b>Kích cỡ:</b> {item.size}
                  </p>
                )}

                <p>
                  <b>Topping:</b>{" "}
                  {item.toppings?.length > 0
                    ? item.toppings.map((t) => `${t.label}`).join(", ")
                    : "Không có"}
                </p>

                {item.note && item.note.trim() !== "" && (
                  <p>
                    <b>Ghi chú:</b> {item.note}
                  </p>
                )}

                <p>
                  <b>Số lượng:</b> {item.quantity}
                </p>

                <p>
                  <b>Thành tiền:</b> {item.totalPrice.toLocaleString()}đ
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
