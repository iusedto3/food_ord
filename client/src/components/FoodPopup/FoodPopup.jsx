import React, { useContext, useEffect, useRef, useState } from "react";
import "./FoodPopup.css";
import { StoreContext } from "../../contexts/StoreContext";

const FoodPopup = ({ food, onClose }) => {
  const { addToCart, url } = useContext(StoreContext);
  const popupRef = useRef(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    food?.sizes?.[0] || "Mặc định"
  );
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [note, setNote] = useState("");

  // Focus popup
  useEffect(() => {
    popupRef.current?.focus();
  }, []);

  // ESC to close
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleAddToCart = () => {
    const itemData = {
      id: food._id,
      size: selectedSize,
      options: selectedOptions,
      note,
      quantity,
    };
    console.log(" Thêm vào giỏ:", itemData);
    for (let i = 0; i < quantity; i++) addToCart(food._id);
    onClose();
  };

  const totalPrice = (() => {
    const base = Number(food.price) || 0;
    const extras = selectedOptions
      .map((i) => food.options?.[i]?.price || 0)
      .reduce((a, b) => a + b, 0);
    return (base + extras) * quantity;
  })();

  return (
    <div className="food-popup-overlay" onClick={onClose}>
      <div
        className="food-popup-content"
        onClick={(e) => e.stopPropagation()}
        ref={popupRef}
        tabIndex={-1}
      >
        <button className="food-popup-close" onClick={onClose}>
          &times;
        </button>

        <div className="food-popup-img-wrap">
          <img
            src={`${url}/images/${food.image}`}
            alt={food.name}
            className="food-popup-img"
          />
        </div>

        <div className="food-popup-info">
          <h3 className="food-popup-title">{food.name}</h3>
          <p className="food-popup-desc">{food.description}</p>

          {food.sizes?.length > 0 && (
            <div className="food-popup-section">
              <div className="food-popup-label">Kích thước</div>
              <div className="food-popup-sizes">
                {food.sizes.map((s, i) => (
                  <button
                    key={i}
                    className={`food-popup-size-btn ${
                      selectedSize === s ? "active" : ""
                    }`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {food.options?.length > 0 && (
            <div className="food-popup-section">
              <div className="food-popup-label">Tuỳ chọn thêm</div>
              <div className="food-popup-options">
                {food.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`food-popup-option ${
                      selectedOptions.includes(i) ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(i)}
                      onChange={(e) =>
                        setSelectedOptions((prev) =>
                          e.target.checked
                            ? [...prev, i]
                            : prev.filter((id) => id !== i)
                        )
                      }
                    />
                    <span>{opt.label}</span>
                    {opt.price > 0 && (
                      <span className="option-price">
                        {opt.price.toLocaleString()} đ
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="food-popup-section">
            <div className="food-popup-label">Ghi chú</div>
            <textarea
              className="food-popup-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: không hành, ít cay..."
            />
          </div>

          <div className="food-popup-bottom">
            <div className="food-popup-quantity-section">
              <div className="food-popup-quantity-and-total">
                <div className="food-popup-quantity">
                  <button
                    className="food-popup-qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="food-popup-qty-value">{quantity}</span>
                  <button
                    className="food-popup-qty-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button className="food-popup-order-btn" onClick={handleAddToCart}>
              Thêm vào giỏ hàng • {totalPrice.toLocaleString()} đ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPopup;
