import React, { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";
import axios from "axios";
import "./Verify.css";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const { url, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");
  const success = searchParams.get("success");
  const resultCode = searchParams.get("resultCode");
  const status = searchParams.get("status");

  useEffect(() => {
    // 🧹 HÀM DỌN DẸP GIỎ HÀNG
    const clearFrontendCart = () => {
      // 1. SỬA LỖI Ở ĐÂY: Phải set là Mảng rỗng [] thay vì Object {}
      // Vì useCart đang dùng hàm .reduce() của mảng
      if (setCartItems) {
        setCartItems([]);
      }
      // 2. Xóa LocalStorage
      localStorage.removeItem("guestCart");
      localStorage.removeItem("cartItems");
    };

    const verifyPayment = async () => {
      if (!orderId) return navigate("/");

      // --- TRƯỜNG HỢP 1: COD ---
      if (status === "success") {
        clearFrontendCart();
        // ✅ Giữ nguyên hướng dẫn của bạn: Về trang Success
        navigate(`/success/${orderId}`);
        return;
      }

      // --- TRƯỜNG HỢP 2: ONLINE ---
      try {
        const response = await axios.post(`${url}/api/order/verify`, {
          orderId,
          success,
          resultCode,
          status,
        });

        if (response.data.success) {
          clearFrontendCart();
          // ✅ Giữ nguyên hướng dẫn của bạn: Về trang Success
          navigate(`/success/${orderId}`);
        } else {
          alert("Thanh toán thất bại hoặc đã bị hủy!");
          navigate("/");
        }
      } catch (error) {
        console.log(error);
        navigate("/");
      }
    };

    verifyPayment();
  }, [orderId, success, resultCode, status, navigate, setCartItems, url]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p style={{ marginTop: "20px", color: "#555" }}>
        Đang xử lý giao dịch...
      </p>
    </div>
  );
};

export default Verify;
