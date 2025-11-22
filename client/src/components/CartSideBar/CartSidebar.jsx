import React, { useContext } from "react";
import CartSummary from "./Summary/CartSummary";
import CartVoucher from "./Voucher/CartVoucher";
import CartUtensils from "./Utensils/CartUtensils";
import CheckoutButton from "./CheckoutButton/CheckoutButton";
import { StoreContext } from "../../contexts/StoreContext";

import "./CartSidebar.css";

const CartSidebar = ({ cartTotal }) => {
  const { voucher, setVoucher } = useContext(StoreContext);

  const handleApplyVoucher = (v) => {
    setVoucher(v); // { code, discountAmount, voucherInfo }
  };

  return (
    <div className="cart-sidebar">
      <CartVoucher onApplyVoucher={handleApplyVoucher} cartTotal={cartTotal} />

      <CartUtensils />

      <CartSummary
        subtotal={cartTotal}
        discount={voucher?.discountAmount || 0}
      />
    </div>
  );
};

export default CartSidebar;
