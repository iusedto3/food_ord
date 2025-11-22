import React from "react";
import "./FoodPopup.css";
import useFoodPopup from "../../hooks/useFoodPopup";
import { useContext } from "react";
import { StoreContext } from "../../contexts/StoreContext";

const FoodPopup = ({ isOpen, food, mode, itemIndex, onConfirm, onClose }) => {
  const { backendUrl } = useContext(StoreContext);

  const {
    popupRef,
    quantity,
    setQuantity,
    selectedSize,
    setSelectedSize,
    selectedCrust,
    setSelectedCrust,
    selectedToppings,
    toggleTopping,
    note,
    setNote,
    handleConfirm,
    totalPrice,
  } = useFoodPopup(food, mode, itemIndex, onClose);

  if (!food) return null;

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
            src={`${backendUrl}/images/${food.image}`}
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
              {/* ==== CRUST (RADIO BUTTONS) ==== */}
              {food.crust?.enabled && food.crust.list?.length > 0 && (
                <div className="food-popup-section">
                  <div className="food-popup-label">Đế bánh (Crust)</div>

                  <div className="food-popup-crust-options">
                    {food.crust.list.map((c, i) => (
                      <label key={i} className="food-popup-crust-item">
                        <input
                          type="radio"
                          name="crust"
                          checked={selectedCrust?.label === c.label}
                          onChange={() => setSelectedCrust(c)}
                        />

                        <span className="crust-name">{c.label}</span>

                        {c.price > 0 && (
                          <span className="crust-price">
                            +{c.price.toLocaleString()}đ
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
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
                      selectedToppings.some((t) => t.label === opt.label)
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedToppings.some(
                        (t) => t.label === opt.label
                      )}
                      onChange={() => toggleTopping(opt)}
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

            <button className="food-popup-order-btn" onClick={handleConfirm}>
              {mode === "edit" ? "Cập nhật" : "Thêm vào giỏ hàng"} •{" "}
              {totalPrice.toLocaleString("vi-VN")} đ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPopup;
