// frontend/hooks/useOrder.js
import { useState, useContext } from "react";
import { StoreContext } from "../contexts/StoreContext";

const useOrder = () => {
  // 💡 Cần phải đảm bảo userId được lấy từ context/local khi token có
  const { token, cartItems, getTotalCartAmount, clearCart, url, userId, setVoucher } = 
    useContext(StoreContext); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const placeOrder = async ({ addressData, customerData, paymentMethod, voucher }) => {
    setLoading(true);
    setError(null);

    try {
      // ⚠️ Đã sửa: Nếu có token và userId (user đã đăng nhập) thì gửi userId, ngược lại gửi null (guest)
      const payload = {
        userId: token && userId ? userId : null, 
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
          // 💡 Vẫn gửi token qua headers (dù Server không dùng authMiddleware cho route này)
          ...(token && { Authorization: `Bearer ${token}` }), 
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        // Lỗi từ Server (data.msg hoặc data.error)
        throw new Error(data.msg || data.error || "Lỗi tạo đơn hàng: Server phản hồi thất bại");
      }

      if (data.paymentUrl) {
          // 🚀 CHUYỂN HƯỚNG NGƯỜI DÙNG SANG TRANG THANH TOÁN
          window.location.href = data.paymentUrl;
          return data; // Dừng hàm tại đây, không cần clearCart vội (để Webhook xử lý sau)
      }

      // 2. Nếu là COD (Không có link), thì dọn dẹp như bình thường
      if (typeof clearCart === "function") {
          clearCart(); 
      }
      
      if (setVoucher) setVoucher(null);

      return data;

      // Xử lý clear cart nếu thành công
      if (typeof clearCart === "function") {
          clearCart(); 
      }else {
          console.error("❌ Không tìm thấy hàm clearCart trong Context!");
      }
     if (setVoucher) setVoucher(null);

      return data;
    } catch (err) {
      console.error("Lỗi đặt hàng chi tiết:", err);
      // ⚠️ Lấy message từ lỗi ném ra để set
      setError(err.message || "Đã xảy ra lỗi không xác định khi đặt hàng."); 
      
      // ⚠️ Ném lại lỗi để InfoPayment.jsx bắt được và xử lý logic UI
      throw err; 
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