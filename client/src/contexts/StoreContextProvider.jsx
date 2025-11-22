import React, { useState } from "react";
import { StoreContext } from "./StoreContext";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import useFood from "../hooks/useFood";

const StoreContextProvider = ({ children }) => {
  const url = "http://localhost:4000";
  const backendUrl = "http://localhost:4000";

  // ✅ Gọi các hook chia theo chức năng
  const { token, setToken, logout } = useAuth();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    mergeGuestCart,
    getTotalCartAmount,
    clearCart,
  } = useCart(url, token);
  const { foodList, setFoodList, loading } = useFood(url);
  const [voucher, setVoucher] = useState(null);

  // ✅ Gom toàn bộ dữ liệu và hàm lại thành một object duy nhất
  const contextValue = {
    url,
    token,
    setToken,
    logout,
    foodList,
    setFoodList,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    getTotalCartAmount,
    loading,
    clearCart,
    backendUrl,
    voucher,
    setVoucher,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

