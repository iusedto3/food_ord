import React, { useContext, useState } from "react";
import "./CartItems.css";
import { StoreContext } from "../../contexts/StoreContext";
import FoodPopup from "../FoodPopup/FoodPopup";
import CartItem from "./CartItem";

const CartItems = () => {
  const { cartItems, removeFromCart, foodList, backendUrl, updateCartItem } =
    useContext(StoreContext);

  const [editingItem, setEditingItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // 🔥 Load lại đầy đủ data size + options từ món gốc
  const handleEdit = (item, index) => {
    const original = foodList.find((f) => f._id === item._id);

    if (!original) {
      console.warn("Không tìm thấy món gốc với _id:", item._id);
      return;
    }

    // 🟢 SỬA LOGIC MERGE:
    // 1. Lấy toàn bộ cấu hình gốc (để có danh sách size, crust, topping)
    // 2. Gán các lựa chọn của user vào các biến riêng (user_...)
    const merged = {
      ...original, // Lấy sizes{S,M,L}, crust{list}, options[...] từ gốc

      // Lưu lại những gì user đã chọn trong giỏ
      user_quantity: item.quantity,
      user_note: item.note,
      user_size: item.size, // VD: "Vừa"
      user_crust: item.crust, // VD: { label: "Viền phô mai", ... }
      user_toppings: item.toppings,
    };

    setEditingItem(merged);
    setEditingIndex(index);
  };

  return (
    <div className="cart-items-container">
      {/* Header */}
      <div className="cart-header">
        Có {cartItems.length} sản phẩm trong giỏ hàng của bạn
      </div>

      {/* Items */}
      <div className="cart-items-list">
        {cartItems?.length > 0 ? (
          cartItems.map((item, index) => (
            <CartItem
              key={`${item._id}-${index}`}
              item={item}
              index={index}
              backendUrl={backendUrl}
              onEdit={() => handleEdit(item, index)}
              onRemove={() => removeFromCart(index)}
            />
          ))
        ) : (
          <div className="empty-cart">
            <p>
              Giỏ hàng của bạn trông hơi trống. Tại sao không thử một vài món
              trong thực đơn của chúng tôi?
            </p>

            <a href="/" className="empty-cart-link">
              Xem thực đơn
            </a>
          </div>
        )}
      </div>

      {/* Popup Edit */}
      {editingItem && (
        <FoodPopup
          isOpen={true}
          food={editingItem}
          mode="edit"
          itemIndex={editingIndex}
          onConfirm={(updatedItem) => {
            updateCartItem(editingIndex, updatedItem);
            setEditingItem(null);
            setEditingIndex(null);
          }}
          onClose={() => {
            setEditingItem(null);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
};

export default CartItems;
