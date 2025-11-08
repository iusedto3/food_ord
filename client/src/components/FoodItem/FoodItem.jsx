import React, { useContext } from "react";
import "./FoodItem.css";
import { StoreContext } from "../../contexts/StoreContext";

const FoodItem = ({ id, name, price, description, image, isNew }) => {
  const { addToCart, url } = useContext(StoreContext);

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          className="food-item-img"
          src={url + "/images/" + image}
          alt={name}
        />
        {isNew && <span className="food-item-badge">New</span>}
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
            onClick={() => addToCart(id)}
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
