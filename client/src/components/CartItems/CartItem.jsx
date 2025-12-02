import React, { useState } from "react";
import "./CartItem.css";
import { formatVND } from "../../utils/format";
import { FiAlertCircle } from "react-icons/fi"; // Cần cài: npm install react-icons

const CartItem = ({ item, index, backendUrl, onEdit, onRemove }) => {
  // 1. State quản lý popup
  const [showConfirm, setShowConfirm] = useState(false);

  // 2. Các hàm xử lý
  const handleDeleteClick = () => {
    setShowConfirm(true); // Mở popup
  };

  const confirmDelete = () => {
    onRemove(); // Gọi hàm xóa thật sự từ cha truyền xuống
    setShowConfirm(false); // Đóng popup
  };

  const cancelDelete = () => {
    setShowConfirm(false); // Đóng popup, không làm gì cả
  };

  return (
    <>
      <div className="cart-item">
        {/* Hình ảnh */}
        <div className="cart-item-img">
          <img src={`${backendUrl}/images/${item.image}`} alt={item.name} />
        </div>

        {/* Thông tin */}
        <div className="cart-item-info">
          <div className="cart-item-top">
            <span className="cart-item-name">{item.name}</span>

            <div className="cart-item-qty-price">
              <span className="cart-item-quantity">x{item.quantity}</span>
              <span className="cart-item-price">
                {/* Nếu có totalPrice (đã tính topping/đế) thì dùng nó, nếu không thì dùng giá gốc * số lượng */}
                {formatVND(
                  item.totalPrice ? item.totalPrice : item.price * item.quantity
                )}
              </span>
            </div>

            {/* 👇 Sửa sự kiện onClick ở đây */}
            <button className="cart-item-remove" onClick={handleDeleteClick}>
              ×
            </button>
          </div>

          {/* Size */}
          {item.size && (
            <div className="cart-item-sub">Kích thước: {item.size}</div>
          )}

          {/* Crust */}
          {item.crust && (
            <div className="cart-item-sub">Đế bánh: {item.crust.label}</div>
          )}

          {/* Toppings */}
          {item.toppings?.length > 0 && (
            <div className="cart-item-sub">
              Topping: {item.toppings.map((t) => t.label).join(", ")}
            </div>
          )}

          {/* Ghi chú */}
          {item.note && (
            <div className="cart-item-sub">Ghi chú: {item.note}</div>
          )}

          {/* Chỉnh sửa */}
          <button className="cart-item-edit" onClick={onEdit}>
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* 👇 3. PHẦN GIAO DIỆN POPUP (Nằm ngoài thẻ div cart-item nhưng trong Fragment) */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={cancelDelete}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <FiAlertCircle className="confirm-icon" />
            <h3>Xác nhận xóa</h3>
            <p>
              Bạn có chắc muốn xóa món <b>{item.name}</b> khỏi giỏ hàng?
            </p>

            <div className="confirm-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Không
              </button>
              <button className="btn-confirm" onClick={confirmDelete}>
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartItem;
