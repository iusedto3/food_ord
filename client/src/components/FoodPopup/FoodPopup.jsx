import React, { useContext } from "react";
import "./FoodPopup.css";
import useFoodPopup from "../../hooks/useFoodPopup";
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

  const sizeMapping = { S: "Nhỏ", M: "Vừa", L: "Lớn" };
  const sizeKeys = ["S", "M", "L"];

  // 🟢 LOGIC MỚI: Chỉ hiện size nếu S hoặc L có giá trị > 0
  // Nếu S=0 và L=0 thì coi như món này chỉ có 1 size duy nhất (M) -> Ẩn chọn size
  const hasMultipleSizes = food.sizes && (food.sizes.S > 0 || food.sizes.L > 0);

  return (
    <div className="food-popup-overlay" onClick={onClose}>
      <div
        className="food-popup-content"
        onClick={(e) => e.stopPropagation()}
        ref={popupRef}
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

          {/* 🟢 1. CHỈ HIỆN SIZE NẾU CÓ NHIỀU SIZE */}
          {hasMultipleSizes && (
            <div className="food-popup-section">
              <div className="food-popup-label">Kích thước</div>
              <div className="food-popup-sizes">
                {sizeKeys.map((key) => {
                  // Nếu size đó giá = 0 thì không hiện nút (hoặc disable)
                  if (food.sizes[key] === 0 && key !== "M") return null;

                  const label = sizeMapping[key];
                  return (
                    <button
                      key={key}
                      className={`food-popup-size-btn ${
                        selectedSize === label ? "active" : ""
                      }`}
                      onClick={() => setSelectedSize(label)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🟢 2. ĐẾ BÁNH (Giữ nguyên logic kiểm tra enabled) */}
          {food.crust?.enabled && food.crust.list?.length > 0 && (
            <div className="food-popup-section">
              <div className="food-popup-label">Đế bánh (Crust)</div>
              <div className="food-popup-crust-options">
                {food.crust.list.map((c, i) => {
                  const currentSizeKey =
                    Object.keys(sizeMapping).find(
                      (key) => sizeMapping[key] === selectedSize
                    ) || "M";
                  const crustPrice = c.prices ? c.prices[currentSizeKey] : 0;

                  return (
                    <label key={i} className="food-popup-crust-item">
                      <input
                        type="radio"
                        name="crust"
                        checked={selectedCrust?.label === c.label}
                        onChange={() => setSelectedCrust(c)}
                      />
                      <span className="crust-name">{c.label}</span>
                      {crustPrice > 0 && (
                        <span className="crust-price">
                          +{Number(crustPrice).toLocaleString()}đ
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ... Phần Topping, Note, Button giữ nguyên ... */}
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
              placeholder="Ví dụ: không hành..."
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
