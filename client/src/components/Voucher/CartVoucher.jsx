import React, { useState, useContext, useEffect } from "react";
import { StoreContext } from "../../contexts/StoreContext";
import axios from "axios";
import "./CartVoucher.css";
import VoucherPopup from "./VoucherPopup";
import { FiChevronRight, FiX } from "react-icons/fi"; // Cần cài react-icons hoặc dùng text '>'

const CartVoucher = () => {
  const { url, voucher, setVoucher, getTotalCartAmount } =
    useContext(StoreContext);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);

  // Load danh sách voucher
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axios.get(`${url}/api/promotion/active`);
        if (res.data.success) setAvailableVouchers(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVouchers();
  }, [url]);

  // Xử lý áp dụng mã
  const handleApply = async (code) => {
    if (!code) return;
    try {
      const res = await axios.post(`${url}/api/promotion/validate`, {
        code,
        orderTotal: getTotalCartAmount(),
      });

      // Axios trả về dữ liệu trong res.data
      const responseData = res.data;

      // Kiểm tra dựa trên cấu trúc Backend trả về
      if (responseData.success && responseData.valid) {
        setVoucher({
          code: responseData.promotion.code,
          discount: responseData.discount, // Lấy trực tiếp, không qua .data
          type: responseData.promotion.type,
          value: responseData.promotion.value,
        });

        // Có thể thay alert bằng toast notification cho đẹp
        alert("Áp dụng mã thành công!");
        setIsPopupOpen(false);
      } else {
        // Backend trả về success: false hoặc valid: false
        alert(responseData.message || "Mã không hợp lệ");
        setVoucher(null); // Reset nếu mã sai
      }
    } catch (err) {
      console.error(err);
      // Xử lý lỗi từ server (VD: 500 hoặc 400)
      const errorMessage = err.response?.data?.message || "Lỗi kiểm tra mã";
      alert(errorMessage);
    }
  };

  return (
    <>
      <div className="voucher-card-box">
        <div className="voucher-card-header">
          <h3>Voucher</h3>
          <FiChevronRight color="#999" />
        </div>

        {!voucher ? (
          <div
            className="voucher-selector"
            onClick={() => setIsPopupOpen(true)}
          >
            <span className="voucher-placeholder-text">
              Nhập hoặc chọn voucher của bạn
            </span>
            <FiChevronRight color="#d32f2f" />
          </div>
        ) : (
          <div className="voucher-applied">
            <div>
              <span className="voucher-code-tag">Use: {voucher.code}</span>
              <div style={{ fontSize: "12px", color: "#2e7d32" }}>
                Tiết kiệm: {voucher.discount.toLocaleString()}đ
              </div>
            </div>
            <button
              className="btn-remove-voucher"
              onClick={(e) => {
                e.stopPropagation();
                setVoucher(null);
              }}
            >
              <FiX />
            </button>
          </div>
        )}
      </div>

      <VoucherPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        userVouchers={availableVouchers}
        onApply={handleApply}
      />
    </>
  );
};

export default CartVoucher;
