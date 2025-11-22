import React from "react";
import "./ConfirmOrderButton.css";

const ConfirmOrderButton = ({ loading, onConfirm }) => {
  return (
    <button
      className={`confirm-btn ${loading ? "loading" : ""}`}
      onClick={onConfirm}
      disabled={loading}
    >
      {loading ? "Đang xử lý..." : "Đặt hàng"}
    </button>
  );
};

export default ConfirmOrderButton;
