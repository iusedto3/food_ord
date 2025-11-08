import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const url = "http://localhost:4000";

  // 🧺 Thêm món vào giỏ
  const addToCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      updated[itemId] = (updated[itemId] || 0) + 1;
      return updated;
    });

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("❌ Lỗi khi thêm vào giỏ hàng:", err);
      }
    }
  };

  // ❌ Xoá / giảm số lượng trong giỏ
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) updated[itemId] -= 1;
      else delete updated[itemId];
      return updated;
    });

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("❌ Lỗi khi xoá khỏi giỏ hàng:", err);
      }
    }
  };

  // 💰 Tính tổng tiền giỏ hàng
  const getTotalCartAmount = () => {
    if (!Array.isArray(food_list) || food_list.length === 0) return 0;

    let totalAmount = 0;

    for (const itemId in cartItems) {
      const quantity = cartItems[itemId];
      if (quantity <= 0) continue;

      const itemInfo = food_list.find((f) => f._id === itemId);

      if (!itemInfo) {
        console.warn(`⚠️ Không tìm thấy món ăn với ID: ${itemId}`);
        continue; // bỏ qua nếu không tồn tại trong danh sách
      }

      totalAmount += Number(itemInfo.price) * quantity;
    }

    return totalAmount;
  };

  // 📦 Lấy danh sách món ăn từ backend
  const fetchFoodList = async () => {
    try {
      const res = await axios.get(`${url}/api/food/list`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setFoodList(res.data.data);
      } else {
        console.warn("⚠️ Dữ liệu món ăn không hợp lệ:", res.data);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách món ăn:", err);
    }
  };

  // 🧾 Lấy dữ liệu giỏ hàng từ backend
  const loadCartData = async (tokenValue) => {
    try {
      const res = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token: tokenValue } }
      );
      if (res.data.cartData) {
        setCartItems(res.data.cartData);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải giỏ hàng:", err);
    }
  };

  // 🚀 Chạy khi khởi động app
  useEffect(() => {
    const init = async () => {
      await fetchFoodList();
      if (token) {
        await loadCartData(token);
      }
    };
    init();
  }, [token]);

  // 🧩 Gộp tất cả dữ liệu vào context
  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
