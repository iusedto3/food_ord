import React, { useContext } from "react";
import InfoPayment from "../../components/InfoCheckout/InfoPayment";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import CheckoutProgress from "../../components/CheckoutProgress/CheckoutProgress";
import { StoreContext } from "../../contexts/StoreContext";
import { FiArrowLeft } from "react-icons/fi"; // Import the icon
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./PlaceOrder.css"; 

const PlaceOrder = () => {
  const { voucher } = useContext(StoreContext);
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <>
      <div className="placeorder-header-nav">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft className="back-icon" />
          Quay lại
        </button>
      </div>
      <CheckoutProgress step={2} />
      <div className="placeorder-container">
        <div className="placeorder-left">
          <InfoPayment />
        </div>

        <div className="placeorder-right">
          <OrderSummary voucher={voucher} />
        </div>
      </div>
    </>
  );
};

export default PlaceOrder;

