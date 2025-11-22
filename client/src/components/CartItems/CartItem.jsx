import React from "react";
import "./CartItem.css";
import { formatVND } from "../../utils/format";

const CartItem = ({ item, index, backendUrl, onEdit, onRemove }) => {
  return (
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
            <span className="cart-item-quantity">{item.quantity}×</span>
            <span className="cart-item-price">
              {formatVND(item.totalPrice ?? item.price * item.quantity)}
            </span>
          </div>

          <button className="cart-item-remove" onClick={onRemove}>
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
        {item.note && <div className="cart-item-sub">Ghi chú: {item.note}</div>}

        {/* Chỉnh sửa */}
        <button className="cart-item-edit" onClick={onEdit}>
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

export default CartItem;
