import React from "react";

const SuccessDelivery = ({ order }) => {
  // order?.address structure depends on your BE. Handle safely.
  const addr = order?.address || {};
  const customer = order?.customer || {};

  return (
    <div className="card">
      <h3 className="success-card-title">Giao đến</h3>

      <p className="success-card-text">{order?.customer?.name}</p>
      <p className="success-card-text">{order?.customer?.phone}</p>
      <p className="success-card-text">
        {order?.address?.street}, {order?.address?.wardName},
        {order?.address?.districtName}, {order?.address?.cityName}
      </p>
    </div>
  );
};

const maskPhone = (p) => {
  if (!p) return "";
  return p.replace(/(\d{3})\d+(\d{2})/, "$1***$2");
};

const formatAddress = (a) => {
  if (!a) return "";
  return [a.street, a.ward, a.district, a.city].filter(Boolean).join(", ");
};

export default SuccessDelivery;
