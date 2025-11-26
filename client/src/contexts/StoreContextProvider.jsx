import React, { useState } from "react";
import { StoreContext } from "./StoreContext";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import useFood from "../hooks/useFood";
import axios from "axios";

const StoreContextProvider = ({ children }) => {
  const url = "http://localhost:4000";
  const backendUrl = url;

  // 1. HOOKS
  const { token, setToken, logout: authLogout } = useAuth();

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    getTotalCartAmount,
    clearCart,
    setCartItems,
    loadCartData,
    get,
  } = useCart(url, token);

  const { foodList, setFoodList, loading } = useFood(url);

  // 2. VOUCHER STATE
  const [voucher, setVoucherState] = useState(() => {
    try {
      const saved = localStorage.getItem("voucher");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setVoucher = (data) => {
    setVoucherState(data);
    if (data) {
      localStorage.setItem("voucher", JSON.stringify(data));
    } else {
      localStorage.removeItem("voucher");
    }
  };

  const handleLogout = () => {
    authLogout();
    setVoucher(null);
  };

  const handleLogin = async (newToken) => {
    if (cartItems && cartItems.length > 0) {
      try {
        await axios.post(
          url + "/api/cart/sync",
          { items: cartItems },
          { headers: { Authorization: `Bearer ${newToken}` } }
        );
      } catch (error) {
        console.log("Error syncing cart:", error);
      }
    }
    setToken(newToken);
  };

  // ==========================================================
  // 3. LOGIC TÍNH TOÁN TIỀN (PHẦN QUAN TRỌNG MỚI THÊM)
  // ==========================================================

  // Hàm này sẽ tính lại tiền giảm giá mỗi khi Component render
  const getDiscountAmount = () => {
    const total = getTotalCartAmount();
    if (!voucher) return 0;

    try {
      // Nếu giảm theo %
      if (voucher.type === "percentage") {
        // voucher.value là số % (VD: 10)
        return Math.floor((total * voucher.value) / 100);
      }

      // Nếu giảm tiền cố định (fixed)
      // Không cho giảm quá số tiền đơn hàng (tránh âm tiền)
      return Math.min(voucher.value, total);
    } catch (e) {
      console.error("Lỗi tính tiền voucher:", e);
      return 0;
    }
  };

  const getFinalTotal = () => {
    const total = getTotalCartAmount();
    const discount = getDiscountAmount();
    const deliveryFee = total === 0 ? 0 : 20000; // Phí ship ví dụ 20k

    return Math.max(0, total - discount + deliveryFee);
  };

  // 4. CONTEXT VALUE
  const contextValue = {
    url,
    backendUrl,
    token,
    setToken: handleLogin,
    logout: handleLogout,
    foodList,
    setFoodList,
    loading,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    getTotalCartAmount,
    clearCart,
    setCartItems,
    loadCartData,
    voucher,
    setVoucher,

    // --- EXPORT HÀM MỚI RA ĐỂ DÙNG ---
    getDiscountAmount,
    getFinalTotal,
    deliveryFee: 20000,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
