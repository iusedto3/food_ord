import React, { useContext, useState } from "react";
import { StoreContext } from "../../contexts/StoreContext";
import FoodPopup from "../FoodPopup/FoodPopup";
import "./CartItems.css";

const CartItems = ({ navigate }) => {
  // ⚙️ Lấy dữ liệu từ context
  const { cartItems, removeFromCart, getTotalCartAmount, url, food_list } =
    useContext(StoreContext);

  const [editingItem, setEditingItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const totalAmount = getTotalCartAmount();
  const formatVND = (v) => (v ? v.toLocaleString("vi-VN") + " ₫" : "0 ₫");

  // 🧩 Khi người dùng nhấn “Sửa”
  const handleEdit = (item, index) => {
    // 🔍 Tìm món trong danh sách đầy đủ để lấy thông tin size, options, description...
    const fullFood = food_list?.find((f) => f._id === item.itemId);
    if (fullFood) {
      // ✅ Gộp dữ liệu đã chọn (size, toppings, note, quantity) với thông tin đầy đủ
      const merged = { ...fullFood, ...item };
      setEditingItem(merged);
      setEditingIndex(index);
    } else {
      console.warn(
        "⚠️ Không tìm thấy món ăn trong danh sách menu:",
        item.itemId
      );
    }
  };

  return (
    <div className="cart-items-container">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Hình Ảnh</p>
          <p>Tên Món</p>
          <p>Tuỳ Chọn</p>
          <p>Số Lượng</p>
          <p>Tổng Cộng</p>
          <p>Hành động</p>
        </div>
        <hr />

        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div key={index} className="cart-items-row">
              <img src={`${url}/images/${item.image}`} alt={item.name} />

              <p className="cart-item-name">{item.name}</p>

              <div className="cart-item-options">
                <p>
                  <b>Kích thước:</b> {item.size || "Mặc định"}
                </p>
                {item.toppings && item.toppings.length > 0 && (
                  <p>
                    <b>Topping:</b>{" "}
                    {item.toppings.map((t) => t.name || t.label).join(", ")}
                  </p>
                )}
                {item.note && (
                  <p>
                    <b>Ghi chú:</b> {item.note}
                  </p>
                )}
              </div>

              <p className="cart-item-quantity">{item.quantity}</p>
              <p className="cart-item-price">{formatVND(item.totalPrice)}</p>

              <div className="cart-item-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(item, index)}
                >
                  Sửa
                </button>
                <br></br>
                <button
                  onClick={() => removeFromCart(index)}
                  className="remove-btn"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-cart">Giỏ hàng của bạn đang trống</p>
        )}
      </div>

      {/* Tổng cộng */}
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Tổng Cộng</h2>
          <div>
            <div className="cart-total-details">
              <p>Tạm tính</p>
              <p>{formatVND(totalAmount)}</p>
            </div>
            <div className="cart-total-details">
              <p>Phí vận chuyển</p>
              <p>{formatVND(totalAmount === 0 ? 0 : 20000)}</p>
            </div>
            <div className="cart-total-details">
              <b>Tổng cộng</b>
              <b>{formatVND(totalAmount === 0 ? 0 : totalAmount + 20000)}</b>
            </div>
          </div>
          <button
            onClick={() => {
              if (cartItems.length > 0) navigate("/order");
            }}
          >
            Thanh Toán
          </button>
        </div>

        <div className="cart-promocode">
          <p>Sử dụng mã giảm giá, nhập vào</p>
          <div className="cart-promocode-input">
            <input type="text" placeholder="Nhập mã giảm giá" />
            <button>Áp Dụng</button>
          </div>
        </div>
      </div>

      {/* ✅ Popup chỉnh sửa món */}
      {editingItem && (
        <FoodPopup
          isOpen={true}
          food={editingItem}
          mode="edit"
          itemIndex={editingIndex}
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
