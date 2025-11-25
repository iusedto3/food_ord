import { useState, useContext } from "react";
import { StoreContext } from "../contexts/StoreContext";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";

const useOrder = () => {
  const { token, cartItems, getTotalCartAmount, clearCart, url, userId, setVoucher } =
    useContext(StoreContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const placeOrder = async ({ addressData, customerData, paymentMethod, voucher }) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        userId: token ? userId : null,
        items: cartItems,
        amount: getTotalCartAmount(),
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
        throw new Error(data.msg || "Lỗi tạo đơn hàng");
      }

      // ---------------------------
      // 1. TRƯỜNG HỢP ONLINE (Có link thanh toán)
      // ---------------------------
      if (data.paymentUrl) {
          console.log("🔗 Link thanh toán:", data.paymentUrl);
          
          // Mở link thanh toán ở tab mới
          window.open(data.paymentUrl, '_blank');

          console.log("⏳ Đang giả lập thanh toán thành công sau 3s...");
          
          setTimeout(async () => {
              try {
                  // Gọi Verify giả lập
                  await axios.post(`${url}/api/order/verify`, {
                      success: "true", 
                      orderId: data.orderId
                  });
                  
                  // Xóa giỏ hàng UI
                  if (typeof clearCart === "function") clearCart();
                  if (setVoucher) setVoucher(null);

                  navigate(`/success/${data.orderId}`);
                  
              } catch (e) {
                  console.error("Lỗi tự động verify", e);
              }
          }, 3000);

          return data;
      }

      // ---------------------------
      // 2. TRƯỜNG HỢP COD (Tiền mặt)
      // ---------------------------
      console.log("✅ Đơn hàng COD thành công!");
      
      // Xóa giỏ hàng UI ngay lập tức
      if (typeof clearCart === "function") clearCart();
      if (setVoucher) setVoucher(null);

      return data;

    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { placeOrder, loading, error };
};

export default useOrder;