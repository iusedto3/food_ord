import React from "react";
import useCart from "../../hooks/useCart";
import CartItems from "../../components/CartItems/CartItems";
import CartSuggestions from "../../components/CartSuggestions/CartSuggestions";
import CartSidebar from "../../components/CartSideBar/CartSidebar";

import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { StoreContext } from "../../contexts/StoreContext";
import "./Cart.css";
// import CartVoucher from "../../components/CartVoucher/CartVoucher"; // ⚠️ Đã chuyển vào trong CartSidebar nên KHÔNG import ở đây nữa

const PageCart = () => {
  // 🟢 FIX LỖI Ở ĐÂY:
  // Phải lấy thêm cartItems, foodList để component tự động re-render khi dữ liệu thay đổi
  const { getTotalCartAmount, cartItems } = useContext(StoreContext);

  const navigate = useNavigate();

  // Khi cartItems hoặc foodList thay đổi, dòng này sẽ chạy lại => Giá cập nhật ngay lập tức
  const subtotal = getTotalCartAmount();

  return (
    <>
      <div className="cart-header-nav">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft className="back-icon" />
          Quay lại
        </button>
      </div>

      <div className="cart-wrapper">
        {/* LEFT – 65% */}
        <div className="cart-left">
          <CartItems />
          <CartSuggestions />
        </div>

        {/* RIGHT – SIDEBAR 35% */}
        <div className="cart-right">
          {/* Truyền subtotal mới nhất xuống Sidebar */}
          <CartSidebar cartTotal={subtotal} />
        </div>
      </div>
    </>
  );
};

export default PageCart;
