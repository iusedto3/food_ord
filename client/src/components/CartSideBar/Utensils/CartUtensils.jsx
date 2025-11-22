import React, { useState } from "react";
import "./CartUtensils.css";
import UtensilsPopup from "./Utensilspopup";

const CartUtensils = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="cart-box utensil-box" onClick={() => setOpen(true)}>
        <h3 className="box-title">Muỗng • Nĩa • Tương</h3>
        <p>Chọn dụng cụ ăn kèm</p>
      </div>

      {open && <UtensilsPopup onClose={() => setOpen(false)} />}
    </>
  );
};

export default CartUtensils;
