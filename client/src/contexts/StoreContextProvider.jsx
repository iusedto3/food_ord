import React, { useState } from "react";
import { StoreContext } from "./StoreContext";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import useFood from "../hooks/useFood";
import axios from "axios"; // ✅ Nhớ cài axios hoặc đảm bảo đã import

const StoreContextProvider = ({ children }) => {
  const url = "http://localhost:4000";
  // const url = "https://your-deploy-url.com"; // Dùng khi deploy
  const backendUrl = url;

  // -------------------------------------------------
  // 1. HOOKS
  // -------------------------------------------------
  const { token, setToken, logout: authLogout } = useAuth();

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    getTotalCartAmount,
    clearCart,
  } = useCart(url, token);

  const handleLogout = () => {
    // Gọi hàm logout gốc (xóa token)
    authLogout();

    // Xóa voucher khỏi State và LocalStorage
    setVoucher(null);

    // (Tuỳ chọn) Xóa luôn giỏ hàng hiển thị để tránh rác
    // clearCart();
  };

  const { foodList, setFoodList, loading } = useFood(url);

  // 1. Khởi tạo Voucher từ LocalStorage (để F5 không mất)
  const [voucher, setVoucherState] = useState(() => {
    try {
      const saved = localStorage.getItem("voucher");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // 2. Hàm setVoucher cải tiến: Vừa lưu State, vừa lưu Storage
  const setVoucher = (data) => {
    setVoucherState(data);
    if (data) {
      localStorage.setItem("voucher", JSON.stringify(data));
    } else {
      localStorage.removeItem("voucher");
    }
  };

  // -------------------------------------------------
  // 2. XỬ LÝ LOGIN & MERGE CART (QUAN TRỌNG)
  // -------------------------------------------------
  // Hàm này thay thế setToken thường dùng. Nó sẽ Sync giỏ hàng trước khi Login.
  const handleLogin = async (newToken) => {
    // Kiểm tra: Nếu có giỏ hàng Guest (Local) thì Sync lên Server
    if (cartItems && cartItems.length > 0) {
      try {
        console.log("🔄 Đang đồng bộ giỏ hàng Guest lên Server...", cartItems);

        // Gọi API Sync mà bạn đã tạo ở Backend
        await axios.post(
          url + "/api/cart/sync",
          { items: cartItems }, // Gửi danh sách món ăn hiện tại
          { headers: { Authorization: `Bearer ${newToken}` } } // Dùng token mới để xác thực
        );

        console.log("✅ Đồng bộ giỏ hàng thành công!");
      } catch (error) {
        console.log("⚠️ Lỗi đồng bộ giỏ hàng (Không ảnh hưởng Login):", error);
      }
    }

    // Sau khi Sync xong (hoặc dù lỗi), mới gọi setToken của useAuth
    // Lúc này useCart sẽ chạy lại và fetch giỏ hàng mới nhất (đã được merge) từ DB về.
    setToken(newToken);
  };

  // -------------------------------------------------
  // 3. CONTEXT VALUE
  // -------------------------------------------------
  const contextValue = {
    url,
    backendUrl,

    // Auth
    token,
    setToken: handleLogin, // 💡 Ghi đè setToken bằng hàm handleLogin thông minh hơn

    logout: handleLogout, // Ghi đè logout để clear Voucher khi Logout

    // Food
    foodList,
    setFoodList,
    loading,

    // Cart
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    getTotalCartAmount,
    clearCart,

    // Voucher
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
