// frontend/hooks/useOrder.js
import { useState, useContext } from "react";
import { StoreContext } from "../contexts/StoreContext";
import { useNavigate } from "react-router-dom"; 

const useOrder = () => {
  // 👇 Lấy hàm getFinalTotal từ Context
  const { 
    token, 
    cartItems, 
    getTotalCartAmount, 
    clearCart, 
    url, 
    userId, 
    setVoucher, 
    getFinalTotal, // Đây là hàm
    deliveryFee 
  } = useContext(StoreContext); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const placeOrder = async ({ addressData, customerData, paymentMethod, voucher }) => {
    setLoading(true);
    setError(null);

    try {
      // 🟢 QUAN TRỌNG: Gọi hàm để lấy giá trị số (thêm dấu ngoặc đơn)
      const finalAmount = getFinalTotal(); 

      const payload = {
        userId: token && userId ? userId : null, 
        items: cartItems,
        amount: getTotalCartAmount(),
        shippingFee: deliveryFee,
        finalTotal: finalAmount, // ✅ SỬA: Truyền giá trị số, không truyền hàm
        address: addressData,
        customer: customerData,
        paymentMethod,
        voucher: voucher || null,
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
        throw new Error(data.msg || data.error || "Lỗi tạo đơn hàng: Server phản hồi thất bại");
      }

      // Chỉ clear cart nếu là COD (không có link thanh toán)
      if (!data.paymentUrl) {
          if (typeof clearCart === "function") {
              clearCart(); 
          }
          if (setVoucher) setVoucher(null);
      }

      return data; 

    } catch (err) {
      console.error("Lỗi đặt hàng chi tiết:", err);
      setError(err.message || "Đã xảy ra lỗi không xác định khi đặt hàng."); 
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  return { placeOrder, loading, error };
};

export default useOrder;