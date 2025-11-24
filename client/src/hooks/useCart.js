import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { calculateItemPrice } from "../utils/pricing";

const useCart = (url, token) => {
  const [cartItems, setCartItems] = useState([]);

  const api = axios.create({ baseURL: url });

  const getAuthHeader = () => {
    const t = token || localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  // Lưu giỏ hàng guest (chưa đăng nhập)
  const saveGuestCart = (list) => {
    try {
      localStorage.setItem("guestCart", JSON.stringify(list));
    } catch (e) {
      console.error("saveGuestCart error", e);
    }
  };

  // Khi chưa đăng nhập → load giỏ hàng guest
  useEffect(() => {
    if (!token) {
      const saved = JSON.parse(localStorage.getItem("guestCart")) || [];
      setCartItems(saved);
    }
  }, [token]);

  // ========== LOAD CART USER ==========
  const loadUserCart = useCallback(async () => {
    try {
      const res = await api.post("/api/cart/get", {}, { headers: getAuthHeader() });
      if (res.data.success) setCartItems(res.data.cartData || []);
    } catch (err) {
      console.error("loadUserCart error:", err?.response?.data || err.message);
    }
  }, [token]);

  // Tự động load cart khi F5
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      loadUserCart();
    }
  }, [loadUserCart]);

  // ========== ADD TO CART ==========
  const addToCart = async (foodData) => {
    try {
      const t = token || localStorage.getItem("token");

      // Guest mode
      if (!t) {
        const updated = [...cartItems];

        const existing = updated.find(
          (item) =>
            item._id === foodData._id &&
            item.size === foodData.size &&
            JSON.stringify(item.crust) === JSON.stringify(foodData.crust) &&
            JSON.stringify(item.toppings) === JSON.stringify(foodData.toppings) &&
            item.note === foodData.note
        );

        if (existing) {
          existing.quantity += foodData.quantity;
          existing.totalPrice = calculateItemPrice(existing) * existing.quantity;
        } else {
          updated.push({
            ...foodData,
            totalPrice: calculateItemPrice(foodData) * foodData.quantity,
          });
        }

        setCartItems(updated);
        saveGuestCart(updated);
        return;
      }

      // User mode
      const res = await api.post("/api/cart/add", foodData, {
        headers: getAuthHeader(),
      });
      if (res.data.success) setCartItems(res.data.cartData || []);
    } catch (err) {
      console.error("addToCart error:", err?.response?.data || err.message);
    }
  };

  // ========== REMOVE ==========
  const removeFromCart = async (itemId) => {
    try {
      const t = token || localStorage.getItem("token");

      if (!t) {
        const updated = cartItems.filter((_, idx) => idx !== itemId);
        setCartItems(updated);
        saveGuestCart(updated);
        return;
      }

      const res = await api.post(
        "/api/cart/remove",
        { itemId },
        { headers: getAuthHeader() }
      );
      if (res.data.success) setCartItems(res.data.cartData || []);
    } catch (err) {
      console.error("removeFromCart error:", err?.response?.data || err.message);
    }
  };

  // ========== UPDATE ==========
  const updateCartItem = async (index, updatedItem) => {
    try {
      const t = token || localStorage.getItem("token");

      if (!t) {
        const newList = [...cartItems];
        newList[index] = {
          ...updatedItem,
          totalPrice: calculateItemPrice(updatedItem) * updatedItem.quantity,
        };
        setCartItems(newList);
        saveGuestCart(newList);
        return;
      }

      const res = await api.put(
        "/api/cart/update",
        { index, updatedItem },
        { headers: getAuthHeader() }
      );
      if (res.data.success) setCartItems(res.data.cartData || []);
    } catch (err) {
      console.error("updateCartItem error:", err?.response?.data || err.message);
    }
  };

  // ========== MERGE ==========
  const mergeGuestCart = async () => {
    const t = token || localStorage.getItem("token");
    if (!t) return;

    const guest = JSON.parse(localStorage.getItem("guestCart")) || [];
    if (!guest.length) return;

    try {
      const res = await api.post(
        "/api/cart/merge",
        { items: guest },
        { headers: getAuthHeader() }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData || []);
        localStorage.removeItem("guestCart");
      }
    } catch (err) {
      console.error("mergeGuestCart error:", err?.response?.data || err.message);
    }
  };

  // ========== CLEAR ==========
  const clearCart = () => {
    console.log("🧹 Đang dọn dẹp giỏ hàng..."); // Log để kiểm tra
    setCartItems([]);
    localStorage.removeItem("guestCart");
  };

  // ========== TOTAL (Đã sửa lỗi logic) ==========
  const getTotalCartAmount = () => {
    return cartItems.reduce((sum, item) => {
      // 1. Ưu tiên dùng totalPrice (giá đã bao gồm topping/size nếu có)
      // 2. Nếu totalPrice lỗi/bằng 0, fallback về công thức: giá gốc * số lượng
      const itemTotal = item.totalPrice ? item.totalPrice : ((item.price || 0) * (item.quantity || 1));
      
      return sum + itemTotal;
    }, 0);
  };
  return {
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    mergeGuestCart,
    getTotalCartAmount,
    clearCart,
  };
};

export default useCart;
