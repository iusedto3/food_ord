import { useEffect, useState, useCallback } from "react";
import axios from "axios";
// import { calculateItemPrice } from "../utils/pricing"; // ❌ BỎ DÒNG NÀY (Không dùng logic cũ nữa)

const useCart = (url, token) => {
  const [cartItems, setCartItems] = useState([]);

  const api = axios.create({ baseURL: url });

  const getAuthHeader = () => {
    const t = token || localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  // Lưu giỏ hàng guest
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

  // Load giỏ hàng User
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

  // ============================================================
  // 🟢 ADD TO CART (SỬA LOGIC GUEST ĐỂ KHỚP VỚI USER)
  // ============================================================
  const addToCart = async (foodData) => {
    try {
      const t = token || localStorage.getItem("token");

      // ---------------- GUEST MODE ----------------
      if (!t) {
        const updated = [...cartItems];

        // Tìm món trùng
        const existing = updated.find(
          (item) =>
            item._id === foodData._id &&
            item.size === foodData.size &&
            // So sánh Crust & Topping chuẩn xác hơn
            JSON.stringify(item.crust) === JSON.stringify(foodData.crust) &&
            JSON.stringify(item.toppings) === JSON.stringify(foodData.toppings) &&
            item.note === foodData.note
        );

        if (existing) {
          // CỘNG DỒN SỐ LƯỢNG
          existing.quantity += foodData.quantity;
          
          // 🟢 FIX LỖI GIÁ: Cộng dồn totalPrice từ dữ liệu mới gửi vào
          // (Vì foodData.totalPrice đã được tính đúng ở FoodPopup)
          existing.totalPrice = Number(existing.totalPrice) + Number(foodData.totalPrice);
          
        } else {
          // THÊM MỚI
          updated.push({
            ...foodData,
            // Đảm bảo lưu đúng giá tổng mà FoodPopup gửi sang
            totalPrice: Number(foodData.totalPrice), 
          });
        }

        setCartItems(updated);
        saveGuestCart(updated);
        return;
      }

      // ---------------- USER MODE ----------------
      // Gửi foodData (đã bao gồm totalPrice đúng) lên Server
      const res = await api.post("/api/cart/add", foodData, {
        headers: getAuthHeader(),
      });
      if (res.data.success) setCartItems(res.data.cartData || []);

    } catch (err) {
      console.error("addToCart error:", err?.response?.data || err.message);
    }
  };

  // ========== REMOVE ==========
  const removeFromCart = async (itemIndex) => {
    try {
      const t = token || localStorage.getItem("token");

      // Guest: Xóa theo index
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

  // ========== UPDATE ==========
  const updateCartItem = async (index, updatedItem) => {
    try {
      const t = token || localStorage.getItem("token");

      // Guest
      if (!t) {
        const newList = [...cartItems];
        newList[index] = updatedItem; // updatedItem đã có totalPrice mới từ Popup
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

  // ... (Merge, Clear giữ nguyên) ...
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

  // 🟢 TÍNH TỔNG TIỀN (Dựa trên totalPrice có sẵn)
  const getTotalCartAmount = () => {
    return cartItems.reduce((sum, item) => {
      // Ưu tiên lấy totalPrice đã lưu, nếu không mới tính thủ công
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