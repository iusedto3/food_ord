import { useState, useContext } from "react";
import { StoreContext } from "../contexts/StoreContext";

const useOrder = () => {
  // LẤY clearCart từ context luôn (và url, token, cartItems, getTotalCartAmount)
  const { token, cartItems, getTotalCartAmount, clearCart, url } =
    useContext(StoreContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const placeOrder = async ({ addressData, customerData, paymentMethod }) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        userId: token ? undefined : null, // nếu guest thì null
        items: cartItems,
        amount: getTotalCartAmount(),
        address: addressData,
        customer: customerData,
        paymentMethod,
      };

      const res = await fetch(`${url}/api/order/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Lỗi tạo đơn hàng");
      }

      // Nếu clearCart được định nghĩa trong context thì gọi để xoá giỏ
      if (typeof clearCart === "function") {
        try {
          await clearCart(); // support async clearCart if it gọi API
        } catch (err) {
          console.warn("clearCart() failed:", err);
        }
      } else {
        console.warn("clearCart is not available in StoreContext.");
      }

      return data;
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    placeOrder,
    loading,
    error,
  };
};

export default useOrder;
