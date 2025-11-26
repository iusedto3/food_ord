import React, { useContext } from "react";
import CartSummary from "./Summary/CartSummary";
import CartVoucher from "../Voucher/CartVoucher";
import CheckoutButton from "./CheckoutButton/CheckoutButton";
import { StoreContext } from "../../contexts/StoreContext";
import "./CartSidebar.css";

const CartSidebar = () => {
  const {
    getTotalCartAmount,
    getDiscountAmount,
    getFinalTotal,
    deliveryFee, // <--- Đảm bảo bạn đã export biến này ở StoreContext
  } = useContext(StoreContext);

  return (
    <div className="cart-sidebar">
      {/* 1. Phần chọn Voucher (Popup) */}
      <CartVoucher />

      {/* 2. Phần tính tiền (Chỉ hiển thị) */}
      <CartSummary
        subtotal={getTotalCartAmount()}
        discount={getDiscountAmount()}
        delivery={deliveryFee || 0} // Nếu deliveryFee chưa có, truyền 0 để tránh lỗi
        total={getFinalTotal()}
      />
      {/* 3. Nút thanh toán */}
      <CheckoutButton />
    </div>
  );
};

export default CartSidebar;
