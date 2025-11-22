import React from "react";
import useCart from "../../hooks/useCart";
import CartItems from "../../components/CartItems/CartItems";
import CartSuggestions from "../../components/CartSuggestions/CartSuggestions";
import CartSidebar from "../../components/CartSideBar/CartSidebar";
import CheckoutButton from "../../components/CartSideBar/CheckoutButton/CheckoutButton";
import CheckoutProgress from "../../components/CheckoutProgress/CheckoutProgress";
import { FiArrowLeft } from "react-icons/fi"; // Import the icon
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Cart.css";

const PageCart = () => {
  const { getTotalCartAmount } = useCart();
  const subtotal = getTotalCartAmount(); // tổng tiền giỏ hàng (chưa giảm)
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <>
      <div className="cart-header-nav">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft className="back-icon" />
          Quay lại
        </button>
      </div>
      <CheckoutProgress step={1} />
      <div className="cart-wrapper">
        {/* LEFT – 65% */}
        <div className="cart-left">
          <CartItems />
          <CartSuggestions />
        </div>

        {/* RIGHT – SIDEBAR 35% */}
        <div className="cart-right">
          <CartSidebar cartTotal={subtotal} />
          <CheckoutButton />
        </div>
      </div>
    </>
  );
};

export default PageCart;
