import React, { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";
import axios from "axios";
import "./Verify.css";

const Verify = () => {
  const [searchParams] = useSearchParams();
  // 👇 Lấy thêm setCartItems từ Context
  const { url, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");
  const success = searchParams.get("success");
  const resultCode = searchParams.get("resultCode");
  const status = searchParams.get("status");

  useEffect(() => {
    // 🧹 HÀM DỌN DẸP GIỎ HÀNG (Dùng chung cho cả COD và Online)
    const clearFrontendCart = () => {
      // 1. Xóa state React (để icon giỏ hàng về 0 ngay lập tức)
      if (setCartItems) {
        setCartItems({}); // Hoặc [] tùy cấu trúc state của bạn
      }
      // 2. Xóa LocalStorage (để khi F5 không bị hiện lại)
      localStorage.removeItem("cartItems");
    };

    const verifyPayment = async () => {
      if (!orderId) return navigate("/");

      // --- TRƯỜNG HỢP 1: COD ---
      if (status === "success") {
        clearFrontendCart(); // ✅ Xóa giỏ
        navigate(`/success/${orderId}`);
        return;
      }

      // --- TRƯỜNG HỢP 2: ONLINE (MOMO, ZALO...) ---
      try {
        const response = await axios.post(`${url}/api/order/verify`, {
          orderId,
          success,
          resultCode,
          status,
        });

        if (response.data.success) {
          clearFrontendCart(); // ✅ QUAN TRỌNG: Xóa giỏ hàng khi Backend báo OK
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
  }, []);

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
