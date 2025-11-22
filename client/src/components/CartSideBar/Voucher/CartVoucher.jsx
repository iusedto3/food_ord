import React, { useState } from "react";
import axios from "axios";
import "./CartVoucher.css";
import VoucherPopup from "./VoucherPopup";

const CartVoucher = ({ onApplyVoucher, cartTotal }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleApply = async (code) => {
    try {
      await axios.post("http://localhost:5000/api/promotion/validate", {
        code,
        orderTotal: cartTotal,
      });

      if (res.data.success) {
        onApplyVoucher({
          code,
          discountAmount: res.data.discountAmount,
          voucherInfo: res.data.voucher,
        });
        setIsPopupOpen(false);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Lỗi khi kiểm tra voucher");
    }
  };

  return (
    <div className="cart-box voucher-box">
      <h3 className="box-title">Voucher</h3>

      <p className="voucher-trigger-text" onClick={() => setIsPopupOpen(true)}>
        Nhập hoặc chọn voucher của bạn
      </p>

      <VoucherPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        userVouchers={[]}
        onApply={handleApply}
      />
    </div>
  );
};

export default CartVoucher;
