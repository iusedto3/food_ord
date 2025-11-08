import React, { useContext, useState } from "react";
import "./FoodItem.css";
import { StoreContext } from "../../contexts/StoreContext";

const FoodItem = ({ id, name, price, description, image, onClick }) => {
  const { addToCart, url } = useContext(StoreContext);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="food-item" onClick={onClick}>
      <div className="food-item-img-container">
        {!loaded && <div className="skeleton skeleton-img" />}
        <img
          className={`food-item-img ${loaded ? "visible" : "hidden"}`}
          src={`${url}/images/${image}`}
          alt={name}
          onLoad={() => setLoaded(true)}
        />
      </div>

      <div className="food-item-info">
        <h3 className="food-item-name">{name}</h3>
        <p className="food-item-desc">{description}</p>

        <div className="food-item-bottom">
          <div className="food-item-price-section">
            <span className="food-item-price-label">Chỉ từ</span>
            <span className="food-item-price">
              {new Intl.NumberFormat("vi-VN", {
                maximumFractionDigits: 0,
              }).format(price)}{" "}
              đ
            </span>
          </div>

          <button
            className="food-item-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(id);
            }}
            aria-label="Thêm vào giỏ"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
