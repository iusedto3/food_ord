import React from "react";

const PaymentMethodSuccess = ({ order }) => {
  return (
    <div className="card">
      <h3 className="success-card-title">Phương thức thanh toán</h3>

      <p className="success-card-text">
        {order?.paymentMethod === "cod"
          ? "Thanh toán khi nhận hàng"
          : order?.paymentMethod}
      </p>
    </div>
  );
};

export default PaymentMethodSuccess;
