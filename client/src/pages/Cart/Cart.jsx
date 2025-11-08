import React from 'react';
import './Cart.css';
import CartItems from '../../components/CartItems/CartItems';
import CartSuggestions from '../../components/CartSuggestions/CartSuggestions';

const Cart = () => {
  return (
    <div className="cart-page">
      <div className="cart-main">
        <CartItems />
      </div>
      <CartSuggestions />
    </div>
  );
};

export default Cart;
