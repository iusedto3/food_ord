import React, { useContext, useRef } from 'react';
import './CartSuggestions.css';
import { StoreContext } from '../../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';

const CartSuggestions = () => {
  const { food_list, addToCart, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  const suggestedFoods = [...food_list].sort(() => 0.5 - Math.random()).slice(0, 8);

  return (
    <div className="cart-suggestions-section">
      <div className="suggestions-header">
        <h3>Bạn sẽ thích! </h3>
        <p>
          Xem thêm trong{' '}
          <span className="link" onClick={() => navigate('/')}>
            thực đơn của chúng tôi
          </span>
        </p>
      </div>

      <div className="suggestions-wrapper">
        <button className="arrow left" onClick={() => scroll('left')}>
          ‹
        </button>
        <div className="cart-suggestions-list" ref={scrollRef}>
          {suggestedFoods.map((food) => (
            <div key={food._id} className="suggestion-item">
              <img src={`${url}/images/${food.image}`} alt={food.name} />
              <div className="suggestion-info">
                <h4>{food.name}</h4>
                <p>{food.price.toLocaleString('vi-VN')} ₫</p>
                <button onClick={() => addToCart(food._id)}>+ Thêm</button>
              </div>
            </div>
          ))}
        </div>
        <button className="arrow right" onClick={() => scroll('right')}>
          ›
        </button>
      </div>
    </div>
  );
};

export default CartSuggestions;
