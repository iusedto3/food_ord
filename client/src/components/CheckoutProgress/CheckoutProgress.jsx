import React from "react";
import "./CheckoutProgress.css";

const CheckoutProgress = ({ step }) => {
  const steps = ["Giỏ hàng", "Thanh toán", "Hoàn tất"];

  return (
    <div className="checkout-progress">
      {steps.map((s, index) => {
        const stepNumber = index + 1;
        let status = "";
        if (stepNumber < step) {
          status = "completed";
        } else if (stepNumber === step) {
          status = "active";
        }

        return (
          <React.Fragment key={s}>
            <div className={`progress-step ${status}`}>
              <div className="progress-step-number">
                {status === "completed" ? "✓" : stepNumber}
              </div>
              <div className="progress-step-label">{s}</div>
            </div>
            {index < steps.length - 1 && <div className="progress-connector" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CheckoutProgress;
