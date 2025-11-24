import React, { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";
import axios from "axios";
import "./VerifyPayment.css"; // Tạo file css spinner đơn giảnư

const Verify = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.post(`${url}/api/order/verify`, {
          success,
          orderId,
        });
        if (response.data.success) {
          // Thanh toán thành công -> Chuyển về trang My Orders
          navigate(`/success/${orderId}`);
        } else {
          // Thất bại -> Về trang chủ
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
    </div>
  );
};

export default Verify;
