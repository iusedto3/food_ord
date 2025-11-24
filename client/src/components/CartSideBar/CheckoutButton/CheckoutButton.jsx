import React, { useContext } from "react";
import { StoreContext } from "../../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import "./CheckoutButton.css";

const CheckoutButton = () => {
  const { cartItems } = useContext(StoreContext);
  const navigate = useNavigate();

  const isDisabled = cartItems.length === 0;

  return (
    <button
      className={`checkout-btn ${isDisabled ? "disabled" : ""}`}
      // Chuyển hướng đến trang đặt hàng (InfoPayment)
      onClick={() => !isDisabled && navigate("/checkout")}
      disabled={isDisabled}
    >
      Tiến hành thanh toán
    </button>
  );
};

export default CheckoutButton;
