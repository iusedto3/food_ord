import React, { useContext } from "react";
import CartSummary from "./Summary/CartSummary";
import CartVoucher from "../Voucher/CartVoucher";
import CheckoutButton from "./CheckoutButton/CheckoutButton";
import { StoreContext } from "../../contexts/StoreContext";
import "./CartSidebar.css";

const CartSidebar = ({ cartTotal }) => {
  const { voucher } = useContext(StoreContext);

  // Lấy giá trị giảm giá từ voucher (nếu không có thì bằng 0)
  const discountAmount = voucher ? voucher.discount || voucher.discoun || 0 : 0;

  return (
    <div className="cart-sidebar">
      {/* 1. Phần chọn Voucher (Popup) */}
      <CartVoucher />

      {/* 2. Phần tính tiền (Chỉ hiển thị) */}
      <CartSummary subtotal={cartTotal} discount={discountAmount} />

      {/* 3. Nút thanh toán */}
      <CheckoutButton />
    </div>
  );
};

export default CartSidebar;
