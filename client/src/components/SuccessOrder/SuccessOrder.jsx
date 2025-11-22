import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import SuccessHero from "./SuccessHero/SuccessHero";
import SuccessDelivery from "./SuccessDelivery/SuccessDeliveryInfo";
import SuccessPaymentMethod from "./PaymentMethodSuccess/SuccessPaymentInfo";
import SuccessSummary from "./SuccessSummary/SuccessSummary";
import SuccessFAQ from "./SuccessFAQ/SuccessFAQ";

import "./SuccessOrder.css";

const SuccessOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/order/${orderId}`);

        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.log("❌ Fetch order failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="success-page">
      <div className="success-container">
        <SuccessHero
          orderId={order?.orderId || orderId}
          customerName={order?.customer?.name}
          loading={loading}
        />

        {/* 👉 GRID 2 CARD */}
        <div className="success-grid">
          <SuccessDelivery order={order} />
          <SuccessPaymentMethod order={order} />
        </div>

        <SuccessSummary order={order} />
        <SuccessFAQ />
      </div>
    </div>
  );
};

export default SuccessOrder;
