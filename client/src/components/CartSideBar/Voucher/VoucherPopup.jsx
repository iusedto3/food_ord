import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./VoucherPopup.css";

const VoucherPopup = ({ isOpen, onClose, userVouchers = [], onApply }) => {
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    // Cleanup khi unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUseVoucher = (code) => {
    setInputCode(code);
    onApply(code);
  };

  const handleSubmit = () => {
    if (!inputCode.trim()) return;
    onApply(inputCode.trim());
  };

  // Render popup ra ngoài root div bằng Portal
  return ReactDOM.createPortal(
    <div className="voucher-popup-overlay" onClick={onClose}>
      <div className="voucher-popup" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="voucher-popup-close-wrapper">
          <button className="voucher-popup-close" onClick={onClose}>
            ×
          </button>
        </div>

        <h3 className="voucher-popup-title">MÃ KHUYẾN MÃI</h3>

        {/* INPUT ROW */}
        <div className="voucher-popup-input-wrapper">
          <input
            type="text"
            className="voucher-popup-input"
            placeholder="Nhập mã giảm giá của bạn"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />

          <button className="voucher-popup-apply-btn" onClick={handleSubmit}>
            Áp dụng
          </button>
        </div>

        {/* VOUCHER LIST */}
        <div className="voucher-popup-list">
          {userVouchers.length > 0 ? (
            userVouchers.map((v) => (
              <div key={v.code} className="voucher-popup-card">
                <div className="voucher-popup-card-info">
                  <h3>{v.code}</h3>
                  <p>
                    {v.type === "percentage"
                      ? `Giảm ${v.value}%`
                      : `Giảm ${v.value.toLocaleString("vi-VN")}₫`}
                  </p>

                  <p className="expiry">
                    HSD:{" "}
                    {new Date(v.endDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <button
                  className="voucher-popup-use-btn"
                  onClick={() => handleUseVoucher(v.code)}
                >
                  Dùng mã này
                </button>
              </div>
            ))
          ) : (
            <div className="voucher-popup-empty">
              <img src="/empty-voucher.png" alt="empty" />
              <p>Chưa có mã giảm giá</p>
              <span>
                Thêm mã giảm giá có sẵn vào thanh nhập mã phía trên để sử dụng.
              </span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <button className="voucher-popup-confirm" onClick={onClose}>
          Xong
        </button>
      </div>
    </div>,
    document.body // Render vào body thay vì trong component cha
  );
};

export default VoucherPopup;
