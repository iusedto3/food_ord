import React from "react";
import "./PaymentMethod.css";

const PaymentMethod = ({ paymentMethod, setPaymentMethod }) => {
  const methods = [
    { id: "cod", label: "Thanh toán khi nhận hàng (COD)" },
    { id: "momo", label: "Momo / VNPay" },
    { id: "card", label: "Thẻ ngân hàng (Visa/Mastercard)" },
  ];

  return (
    <div className="checkout-section">
      <h3 className="section-title">Phương thức thanh toán</h3>

      <div className="payment-method-list">
        {methods.map((m) => (
          <label key={m.id} className="payment-option">
            <input
              type="radio"
              name="payment-method"
              value={m.id}
              checked={paymentMethod === m.id}
              onChange={() => setPaymentMethod(m.id)}
            />
            <span>{m.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethod;
