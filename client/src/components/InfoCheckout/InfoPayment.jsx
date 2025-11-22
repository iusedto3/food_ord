import React, { useState, useEffect, useContext } from "react";
import DeliveryAddress from "./Address/DeliveryAddress";
import CustomerInfo from "./Customer/CustomerInfo";
import PaymentMethod from "./PaymentMethod/PaymentMethod";
import "./InfoPayment.css";
import ConfirmOrderButton from "./ConfirmOrderButton/ConfirmOrderButton";
import useOrder from "../../hooks/useOrder";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../contexts/StoreContext";

const InfoPayment = () => {
  const { token, clearCart, url } = useContext(StoreContext);
  const isLoggedIn = Boolean(token);
  const navigate = useNavigate();
  // 👉 Gọi hook **bên trong component**
  const { placeOrder, loading, error } = useOrder();

  // -------------------------
  // ADDRESS
  // -------------------------
  const [addressData, setAddressData] = useState({
    street: "",
    cityCode: "",
    districtCode: "",
    wardCode: "",
    selectedId: null,
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${url}/api/address/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) setSavedAddresses(data.addresses);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAddresses();
  }, [isLoggedIn, token, url]);

  // -------------------------
  // CUSTOMER
  // -------------------------
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // -------------------------
  // PAYMENT METHOD
  // -------------------------
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // -------------------------
  // VALIDATION
  // -------------------------
  const [errors, setErrors] = useState({});

  const validateAll = () => {
    let newErrors = {};

    // Address validation
    if (!addressData.street) newErrors.street = "Vui lòng nhập địa chỉ";
    if (!addressData.cityCode) newErrors.city = "Chọn tỉnh/thành";
    if (!addressData.districtCode) newErrors.district = "Chọn quận/huyện";
    if (!addressData.wardCode) newErrors.ward = "Chọn phường/xã";

    // Guest only — customer info
    if (!isLoggedIn) {
      if (!customerData.name) newErrors.name = "Vui lòng nhập họ tên";
      if (!customerData.phone) newErrors.phone = "Vui lòng nhập số điện thoại";
      if (!customerData.email) newErrors.email = "Vui lòng nhập email";
    }

    if (!paymentMethod) newErrors.payment = "Chọn phương thức thanh toán";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------
  // HANDLE CONFIRM ORDER
  // -------------------------
  const handleConfirmOrder = async () => {
    if (!validateAll()) {
      console.log("❌ Validate thất bại");
      return;
    }

    const response = await placeOrder({
      addressData,
      customerData,
      paymentMethod,
    });

    if (!response) {
      console.log("❌ Đặt hàng thất bại");
      return;
    }

    if (isLoggedIn && saveAddress) {
      try {
        await axios.post(
          `${url}/api/address/add`,
          {
            street: addressData.street,
            city: addressData.cityCode,
            district: addressData.districtCode,
            ward: addressData.wardCode,
            label: "Địa chỉ mới", // You might want to let the user set a label
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.log("Lỗi khi lưu địa chỉ:", error);
      }
    }

    console.log("✅ Đặt hàng thành công:", response);

    // Clear cart and navigate to success page
    if (response?.orderId) {
      clearCart();
      navigate(`/success/${response.orderId}`);
    }
  };

  return (
    <div className="place-order-page">
      <h2 className="checkout-title">Thanh toán</h2>

      {/* Địa chỉ */}
      <DeliveryAddress
        savedAddresses={isLoggedIn ? savedAddresses : []}
        setSavedAddresses={isLoggedIn ? setSavedAddresses : () => {}}
        addressData={addressData}
        setAddressData={setAddressData}
        errors={errors}
        saveAddress={saveAddress}
        setSaveAddress={setSaveAddress}
        isLoggedIn={isLoggedIn}
      />

      {/* Người đặt hàng */}
      <CustomerInfo
        customerData={customerData}
        setCustomerData={setCustomerData}
        errors={errors}
      />

      {/* Phương thức thanh toán */}
      <PaymentMethod
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        errors={errors}
      />

      {/* Nút đặt hàng */}
      <ConfirmOrderButton loading={loading} onConfirm={handleConfirmOrder} />

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default InfoPayment;
