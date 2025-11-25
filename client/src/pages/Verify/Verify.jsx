import React, { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";
import axios from "axios";
import "./Verify.css";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  // Lấy các tham số đặc trưng của từng cổng
  const orderId = searchParams.get("orderId");
  const success = searchParams.get("success"); // Stripe
  const resultCode = searchParams.get("resultCode"); // MoMo
  const status = searchParams.get("status"); // ZaloPay

  useEffect(() => {
    const verifyPayment = async () => {
      // Logic xác định thành công cho cả 3 cổng
      const isSuccess =
        success === "true" || resultCode === "0" || status === "1";

      if (isSuccess && orderId) {
        try {
          // Gọi Backend để báo cập nhật DB
          const response = await axios.post(`${url}/api/order/verify`, {
            success: "true",
            orderId,
          });

          if (response.data.success) {
            // Thành công -> Đến trang chi tiết đơn hàng
            navigate(`/success/${orderId}`);
          } else {
            // Thất bại -> Về trang chủ
            navigate("/");
          }
        } catch (error) {
          console.log(error);
          navigate("/");
        }
      } else {
        // Trường hợp người dùng bấm "Hủy" lúc thanh toán
        navigate("/");
      }
    };

    verifyPayment();
  }, []); // Chạy 1 lần khi trang load

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>Đang xác thực thanh toán...</p>
    </div>
  );
};

export default Verify;
