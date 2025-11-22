import React, { useContext, useState } from "react";
import "./FoodItem.css";
import { StoreContext } from "../../contexts/StoreContext";
import { formatVND } from "../../utils/format";

const FoodItem = ({ id, name, price, description, image, onClick }) => {
  const { addToCart, backendUrl } = useContext(StoreContext);
  const [loaded, setLoaded] = useState(false);

  const flyToCart = (e) => {
    const cart = document.querySelector(".navbar-cart");
    const imgToFly = e.target.closest(".food-item").querySelector(".food-item-img");

    const imgClone = imgToFly.cloneNode(true);
    const rect = imgToFly.getBoundingClientRect();

    imgClone.style.position = "fixed";
    imgClone.style.left = `${rect.left}px`;
    imgClone.style.top = `${rect.top}px`;
    imgClone.style.width = `${rect.width}px`;
    imgClone.style.height = `${rect.height}px`;
    imgClone.style.zIndex = "9999";
    imgClone.style.transition = "all 1s ease-in-out";

    document.body.appendChild(imgClone);

    setTimeout(() => {
      const cartRect = cart.getBoundingClientRect();
      imgClone.style.left = `${cartRect.left + cartRect.width / 2}px`;
      imgClone.style.top = `${cartRect.top + cartRect.height / 2}px`;
      imgClone.style.width = "0px";
      imgClone.style.height = "0px";
      imgClone.style.transform = "rotate(360deg)";
    }, 10);

    setTimeout(() => {
      imgClone.remove();
    }, 1000);
  };

  return (
    <div className="food-item horizontal" onClick={onClick}>
      {/* Ảnh */}
      <div className="food-item-img-container round-img">
        {!loaded && <div className="skeleton skeleton-img" />}
        <img
          className={`food-item-img ${loaded ? "visible" : "hidden"}`}
          src={`${backendUrl}/images/${image}`}
          alt={name}
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Nội dung */}
      <div className="food-item-info">
        <h3 className="food-item-name">{name}</h3>
        <p className="food-item-desc">{description}</p>

        <div className="food-item-bottom">
          <div className="food-item-price-section">
            <span className="food-item-price-label">Chỉ từ</span>
            <span className="food-item-price">{formatVND(price)}</span>
          </div>

          <button
            className="food-item-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                _id: id,
                name,
                price,
                image,
                description,
                quantity: 1,
              });
              flyToCart(e);
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
