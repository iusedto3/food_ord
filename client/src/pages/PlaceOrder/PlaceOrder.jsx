import React, { useState, useContext } from "react";
import { StoreContext } from "../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import useOrder from "../../hooks/useOrder";

// Components
import InfoPayment from "../../components/InfoCheckout/InfoPayment";
import CartVoucher from "../../components/Voucher/CartVoucher";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import { FiArrowLeft } from "react-icons/fi";
import "./PlaceOrder.css";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { voucher } = useContext(StoreContext);
  const { placeOrder, loading } = useOrder();

  // --- STATE QUẢN LÝ FORM ---
  const [addressData, setAddressData] = useState({
    street: "",
    cityCode: "",
    districtCode: "",
    wardCode: "",
    selectedId: null,
    note: "",
  });
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // --- XỬ LÝ ĐẶT HÀNG ---
  const handlePlaceOrder = async () => {
    // 1. Validate đơn giản
    if (!addressData.street || !customerData.name || !customerData.phone) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    // 2. Gọi API tạo đơn (thông qua custom hook useOrder)
    const response = await placeOrder({
      addressData,
      customerData,
      paymentMethod,
      voucher,
    });

    // 3. Xử lý kết quả trả về
    if (response && response.success) {
      const { orderId, paymentUrl } = response;

      // ---------------------------------------------------------
      // 🛑 A. GIẢ LẬP MOMO (Tự động thành công sau 5s)
      // ---------------------------------------------------------
      if (paymentMethod === "momo") {
        alert(
          `[MÔ PHỎNG MOMO] Hệ thống đang xử lý thanh toán... Vui lòng đợi 5 giây.`
        );

        setTimeout(() => {
          // Tự động điều hướng kèm resultCode=0 (Giả lập MoMo trả về thành công)
          navigate(`/verify?orderId=${orderId}&resultCode=0`);
        }, 5000);
        return; // Dừng hàm, không làm gì thêm
      }

      // ---------------------------------------------------------
      // 🛑 B. THANH TOÁN ONLINE KHÁC (ZaloPay, Stripe...)
      // ---------------------------------------------------------
      if (paymentUrl) {
        // Chuyển hướng người dùng sang trang thanh toán thật
        window.location.replace(paymentUrl);
        return;
      }

      // ---------------------------------------------------------
      // 🛑 C. THANH TOÁN COD (Tiền mặt)
      // ---------------------------------------------------------
      // Chuyển qua trang Verify để đảm bảo Frontend xóa giỏ hàng đồng bộ
      navigate(`/verify?orderId=${orderId}&status=success`);
    }
  };

  return (
    <div className="placeorder-page">
      {/* Header Quay lại */}
      <div className="placeorder-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Trở lại
        </button>
        <h2 className="page-title">Thanh toán</h2>
        <div style={{ width: "80px" }}></div>
      </div>

      <div className="placeorder-layout">
        {/* === CỘT TRÁI: FORM NHẬP LIỆU === */}
        <div className="layout-left">
          <InfoPayment
            addressData={addressData}
            setAddressData={setAddressData}
            customerData={customerData}
            setCustomerData={setCustomerData}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </div>

        {/* === CỘT PHẢI: VOUCHER & TỔNG TIỀN === */}
        <div className="layout-right">
          <CartVoucher />
          <OrderSummary onPlaceOrder={handlePlaceOrder} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
