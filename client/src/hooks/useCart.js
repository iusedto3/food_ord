import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useCart = (url, token) => {
  const [cartItems, setCartItems] = useState([]);

  const api = axios.create({ baseURL: url });

  const getAuthHeader = () => {
    const t = token || localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  // Lưu giỏ hàng guest vào localStorage
  const saveGuestCart = (list) => {
    try {
      localStorage.setItem("guestCart", JSON.stringify(list));
    } catch (e) {
      console.error("saveGuestCart error", e);
    }
  };

  // Load giỏ hàng guest khi chưa login
  useEffect(() => {
    if (!token) {
      const saved = JSON.parse(localStorage.getItem("guestCart")) || [];
      setCartItems(saved);
    }
  }, [token]);

  // Load giỏ hàng User từ API
  const loadCartData = useCallback(async (specificToken) => {
    try {
      const t = specificToken || token || localStorage.getItem("token");
      const headers = t ? { Authorization: `Bearer ${t}` } : {};
      const res = await api.post("/api/cart/get", {}, { headers });
      if (res.data.success) {
          setCartItems(res.data.cartData || []);
      }
    } catch (err) {
      console.error("loadCartData error:", err);
    }
  }, [token]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) loadCartData();
  }, [token, loadCartData]);

  // ADD TO CART
  const addToCart = async (foodData) => {
    try {
      const t = token || localStorage.getItem("token");

      // GUEST MODE
      if (!t) {
        const updated = [...cartItems];

        // Tìm món trùng
        const existing = updated.find(
          (item) =>
            item._id === foodData._id &&
            item.size === foodData.size &&
            JSON.stringify(item.crust) === JSON.stringify(foodData.crust) &&
            JSON.stringify(item.toppings) === JSON.stringify(foodData.toppings) &&
            item.note === foodData.note
        );

        if (existing) {
          // Cộng dồn số lượng và giá tiền
          existing.quantity += foodData.quantity;
          existing.totalPrice = Number(existing.totalPrice) + Number(foodData.totalPrice);
        } else {
          // Thêm món mới
          updated.push({
            ...foodData,
            totalPrice: Number(foodData.totalPrice), 
          });
        }

        setCartItems(updated);
        saveGuestCart(updated);
        return;
      }

      // USER MODE
      const res = await api.post("/api/cart/add", foodData, {
        headers: getAuthHeader(),
      });
      if (res.data.success) setCartItems(res.data.cartData || []);

    } catch (err) {
      console.error("addToCart error:", err?.response?.data || err.message);
    }
  };

  // REMOVE FROM CART
  const removeFromCart = async (itemIndex) => {
    try {
      const t = token || localStorage.getItem("token");

      // Guest
      if (!t) {
        const updated = cartItems.filter((_, idx) => idx !== itemIndex);
        setCartItems(updated);
        saveGuestCart(updated);
        return;
      }

      // User
      const res = await api.post(
        "/api/cart/remove",
        { itemIndex }, 
        { headers: getAuthHeader() }
      );
      if (res.data.success) setCartItems(res.data.cartData || []);
    } catch (err) {
      console.error("removeFromCart error:", err);
    }
  };

  // UPDATE CART ITEM
  const updateCartItem = async (index, updatedItem) => {
    try {
      const t = token || localStorage.getItem("token");

      // Guest
      if (!t) {
        const newList = [...cartItems];
        newList[index] = updatedItem;
        setCartItems(newList);
        saveGuestCart(newList);
        return;
      }

      // User
      const res = await api.put(
        "/api/cart/update",
        { index, updatedItem },
        { headers: getAuthHeader() }
      );
      if (res.data.success) setCartItems(res.data.cartData || []);
    } catch (err) {
      console.error("updateCartItem error:", err);
    }
  };

  // MERGE GUEST CART TO USER CART
  const mergeGuestCart = async () => {
    const t = token || localStorage.getItem("token");
    if (!t) return;
    const guest = JSON.parse(localStorage.getItem("guestCart")) || [];
    if (!guest.length) return;
    try {
      const res = await api.post("/api/cart/sync", { items: guest }, { headers: getAuthHeader() });
      if (res.data.success) {
        setCartItems(res.data.cartData || []);
        localStorage.removeItem("guestCart");
      }
    } catch (err) { console.error(err); }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("guestCart");
  };

  // GET TOTAL CART AMOUNT
  const getTotalCartAmount = () => {
    return cartItems.reduce((sum, item) => {
      const val = item.totalPrice ? Number(item.totalPrice) : (Number(item.price) * Number(item.quantity));
      return sum + val;
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
    loadCartData,
  };
};

export default useCart;