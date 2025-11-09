import React, { useContext, useEffect, useRef, useState } from "react";
import "./FoodPopup.css";
import { StoreContext } from "../../contexts/StoreContext";

const FoodPopup = ({
  food,
  onClose,
  isOpen,
  mode = "add",
  itemIndex = null,
}) => {
  const { addToCart, setCartItems, cartItems, url } = useContext(StoreContext);
  const popupRef = useRef(null);

  const [quantity, setQuantity] = useState(food?.quantity || 1);
  const [selectedSize, setSelectedSize] = useState(
    food?.size || food?.sizes?.[0] || "Mặc định"
  );
  const [selectedOptions, setSelectedOptions] = useState(
    food?.toppings?.map((t) => t.label) || []
  );
  const [note, setNote] = useState(food?.note || "");

  // Focus popup
  useEffect(() => {
    if (isOpen) popupRef.current?.focus();
  }, [isOpen]);

  // ESC để đóng popup
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!food) return null;

  // ✅ Xử lý thêm hoặc cập nhật giỏ hàng
  const handleConfirm = () => {
    const toppingsData = food.options
      ?.filter((opt) => selectedOptions.includes(opt.label))
      .map((opt) => ({ label: opt.label, price: opt.price }));

    const payload = {
      itemId: food._id,
      size: selectedSize,
      toppings: toppingsData,
      note,
      quantity,
    };

    if (mode === "edit" && itemIndex !== null) {
      // 🔄 Cập nhật item trong giỏ hàng tại chỗ
      const updatedCart = [...cartItems];
      const base = Number(food.price) || 0;
      const extras = toppingsData.reduce((a, b) => a + (b.price || 0), 0);
      const totalPrice = (base + extras) * quantity;

      updatedCart[itemIndex] = {
        ...updatedCart[itemIndex],
        size: selectedSize,
        toppings: toppingsData,
        note,
        quantity,
        totalPrice,
      };

      setCartItems(updatedCart);
      console.log("✅ Đã cập nhật món trong giỏ:", updatedCart[itemIndex]);
    } else {
      // ➕ Thêm mới vào giỏ
      addToCart(payload);
    }

    onClose();
  };

  const totalPrice = (() => {
    const base = Number(food.price) || 0;
    const extras = food.options
      ?.filter((opt) => selectedOptions.includes(opt.label))
      .reduce((sum, opt) => sum + opt.price, 0);
    return (base + (extras || 0)) * quantity;
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
                      selectedOptions.includes(opt.label) ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(opt.label)}
                      onChange={(e) =>
                        setSelectedOptions((prev) =>
                          e.target.checked
                            ? [...prev, opt.label]
                            : prev.filter((o) => o !== opt.label)
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
