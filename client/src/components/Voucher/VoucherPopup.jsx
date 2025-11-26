import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./VoucherPopup.css";

const VoucherPopup = ({ isOpen, onClose, userVouchers = [], onApply }) => {
  // Khởi tạo state là chuỗi rỗng để tránh lỗi uncontrolled ngay từ đầu
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    // Khóa cuộn trang khi mở popup
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    // Reset input khi đóng popup để lần sau mở ra nó trống
    if (!isOpen) {
      setInputCode("");
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUseVoucher = (code) => {
    // Đảm bảo code luôn là chuỗi trước khi set state
    const validCode = code || "";
    setInputCode(validCode);
    onApply(validCode);
  };

  const handleSubmit = () => {
    if (!inputCode.trim()) return;
    onApply(inputCode.trim());
  };

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
            // --- SỬA LỖI 1: Thêm || "" để tránh undefined ---
            value={inputCode || ""}
            onChange={(e) => setInputCode(e.target.value)}
            // Tự động focus giúp tiện hơn cho user
            autoFocus
          />

          <button
            type="button"
            className="voucher-popup-apply-btn"
            onClick={handleSubmit}
          >
            Áp dụng
          </button>
        </div>

        {/* VOUCHER LIST */}
        <div className="voucher-popup-list">
          {userVouchers.length > 0 ? (
            userVouchers.map((v) => (
              // --- SỬA LỖI 2: Dùng v._id thay vì v.code để đảm bảo duy nhất ---
              <div key={v._id} className="voucher-popup-card">
                <div className="voucher-popup-card-info">
                  {/* Hiển thị code, nếu không có thì hiện thông báo */}
                  <h3>{v.code || "Mã tự động"}</h3>
                  <p>
                    {v.type === "percentage"
                      ? `Giảm ${v.value}%`
                      : `Giảm ${v.value?.toLocaleString("vi-VN")}₫`}
                  </p>

                  <p className="expiry">
                    HSD:{" "}
                    {v.endDate
                      ? new Date(v.endDate).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Không thời hạn"}
                  </p>
                </div>

                <button
                  className="voucher-popup-use-btn"
                  // Truyền v.code vào, cẩn thận nếu code null
                  onClick={() => handleUseVoucher(v.code)}
                >
                  Dùng mã này
                </button>
              </div>
            ))
          ) : (
            <div className="voucher-popup-empty">
              {/* Lưu ý: Đảm bảo bạn có file ảnh này trong public folder */}
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
    document.body
  );
};

export default VoucherPopup;
