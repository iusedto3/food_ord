import React from "react";
import "./PaymentMethod.css";
// Import icon tiền mặt
import { FiDollarSign } from "react-icons/fi";

const PaymentMethod = ({ paymentMethod, setPaymentMethod }) => {
  const methods = [
    {
      id: "cod",
      label: "Tiền mặt (COD)",
      icon: <FiDollarSign size={20} color="#2e7d32" />,
    },
    {
      id: "stripe",
      label: "Thẻ quốc tế (Stripe)",
      // Icon Stripe
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
          width="36" // Stripe logo dài ngang nên để rộng hơn chút
          alt="stripe"
        />
      ),
    },
    {
      id: "zalopay",
      label: "Ví ZaloPay",
      icon: (
        <img
          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"
          width="24"
          alt="zalo"
        />
      ),
    },
    {
      id: "momo",
      label: "Ví MoMo",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
          width="24"
          alt="momo"
        />
      ),
    },
  ];

  return (
    <div className="checkout-card">
      <h3 className="card-title">Phương thức thanh toán</h3>

      <div className="payment-list">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`payment-item ${
              paymentMethod === method.id ? "selected" : ""
            }`}
          >
            <div className="payment-left">
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={() => setPaymentMethod(method.id)}
              />
              {/* Box icon căn giữa logo */}
              <div className="payment-icon-box">{method.icon}</div>
              <span className="payment-label">{method.label}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethod;
