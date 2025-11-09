import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState([]);
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const url = "http://localhost:4000";

  // 🧺 Thêm món vào giỏ
  const addToCart = async (foodData) => {
    if (!token) {
      console.warn("⚠️ Người dùng chưa đăng nhập, không thể thêm giỏ hàng");
      return;
    }

    try {
      const res = await axios.post(`${url}/api/cart/add`, foodData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("🧺 Kết quả addToCart:", res.data);

      if (res.data.success) {
        setCartItems([...res.data.cartData]); // ✅ force re-render
      } else {
        console.warn("❌ Lỗi thêm giỏ hàng:", res.data.message);
      }
    } catch (err) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", err);
    }
  };

  // ❌ Xoá / giảm số lượng trong giỏ
  const removeFromCart = async (itemIndex) => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${url}/api/cart/remove`,
        { itemIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCartItems([...res.data.cartData]); // ✅ dùng đúng key
      }
    } catch (err) {
      console.error("❌ Lỗi khi xoá khỏi giỏ hàng:", err);
    }
  };

  // 💰 Tính tổng tiền giỏ hàng
  const getTotalCartAmount = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  // ✅ Cập nhật món ăn trong giỏ hàng
  const updateCartItem = async (itemIndex, updatedItem) => {
    if (!token) return;
    try {
      const res = await axios.put(
        `${url}/api/cart/update`,
        { userId: token.userId, itemIndex, updatedItem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCartItems([...res.data.cartData]);
      }
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật món ăn:", err);
    }
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
        { headers: { Authorization: `Bearer ${tokenValue}` } }
      );
      if (res.data.success && Array.isArray(res.data.cartData)) {
        setCartItems([...res.data.cartData]);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải giỏ hàng:", err);
    }
  };

  // 🚀 Khởi động app
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
    setFoodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    updateCartItem,
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
