import React from "react";
import DeliveryAddress from "./Address/DeliveryAddress";
import CustomerInfo from "./Customer/CustomerInfo";
import PaymentMethod from "./PaymentMethod/PaymentMethod";
import "./InfoPayment.css";

const InfoPayment = ({
  addressData,
  setAddressData,
  customerData,
  setCustomerData,
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <div className="info-payment-wrapper">
      {/* 1. KHỐI GIAO ĐẾN */}
      <DeliveryAddress
        addressData={addressData}
        setAddressData={setAddressData}
      />

      {/* 2. KHỐI NGƯỜI ĐẶT HÀNG */}
      <CustomerInfo
        customerData={customerData}
        setCustomerData={setCustomerData}
      />

      {/* 3. KHỐI PHƯƠNG THỨC THANH TOÁN */}
      <PaymentMethod
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />
    </div>
  );
};

export default InfoPayment;
