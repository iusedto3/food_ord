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

  // --- STATE QUẢN LÝ FORM (Lifted State) ---
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
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Mặc định COD hoặc ZaloPay

  // --- XỬ LÝ ĐẶT HÀNG ---
  const handlePlaceOrder = async () => {
    // 1. Validate đơn giản
    if (!addressData.street || !customerData.name || !customerData.phone) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    // 2. Gọi API
    const response = await placeOrder({
      addressData,
      customerData,
      paymentMethod,
      voucher,
    });

    // 👇👇👇 SỬA ĐOẠN NÀY 👇👇👇

    // Nếu có link thanh toán (Stripe/Momo...), dừng hàm tại đây để trình duyệt tự chuyển hướng
    if (response?.paymentUrl) {
      return;
    }

    // Chỉ điều hướng sang trang Success nếu là COD (không có paymentUrl)
    if (response?.orderId) {
      navigate(`/success/${response.orderId}`);
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
        <div style={{ width: "80px" }}></div> {/* Spacer */}
      </div>

      <div className="placeorder-layout">
        {/* === CỘT TRÁI: FORM NHẬP LIỆU === */}
        <div className="layout-left">
          {/* Truyền state và hàm set xuống InfoPayment */}
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
