import React, { useContext } from 'react';
import { StoreContext } from '../../contexts/StoreContext';
import './CartItems.css';

const CartItems = ({ navigate }) => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } =
    useContext(StoreContext);

  const totalAmount = getTotalCartAmount();
  const formatVND = (v) => v.toLocaleString('vi-VN') + ' ₫';

  return (
    <div className="cart-items-container">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Món Ăn</p>
          <p>Tiêu Đề</p>
          <p>Giá</p>
          <p>Số Lượng</p>
          <p>Tổng Cộng</p>
          <p>Bỏ</p>
        </div>
        <hr />

        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id} className="cart-items-row">
                <img src={`${url}/images/${item.image}`} alt={item.name} />
                <p>{item.name}</p>
                <p>{formatVND(item.price)}</p>
                <p>{cartItems[item._id]}</p>
                <p>{formatVND(item.price * cartItems[item._id])}</p>
                <p onClick={() => removeFromCart(item._id)} className="cross">
                  x
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Tổng cộng */}
      <div className="cart-bottom">
            <div className="cart-total">
            <h2>Tổng Cộng</h2>
            <div>
                <div className="cart-total-details">
                <p>Tạm Tính</p>
                <p>{formatVND(totalAmount)}</p>
                </div>
                <div className="cart-total-details">
                <p>Phí Vận Chuyển</p>
                <p>{formatVND(totalAmount === 0 ? 0 : 20000)}</p>
                </div>
                <div className="cart-total-details">
                <b>Tổng Cộng</b>
                <b>{formatVND(totalAmount === 0 ? 0 : totalAmount + 20000)}</b>
                </div>
            </div>
            <button onClick={() => navigate('/order')}>Thanh Toán</button>
            </div>

            <div className="cart-promocode">
            <p>Sử dụng mã giảm giá, nhập vào</p>
            <div className="cart-promocode-input">
                <input type="text" placeholder="Nhập mã giảm giá" />
                <button>ÁP DỤNG</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
