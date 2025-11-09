import React, { useContext, useRef, useState } from "react";
import "./CartSuggestions.css";
import { StoreContext } from "../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import FoodPopup from "../FoodPopup/FoodPopup"; // ✅ thêm import popup

const CartSuggestions = () => {
  const { food_list, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // ✅ popup states
  const [selectedFood, setSelectedFood] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  // ✅ chọn ngẫu nhiên 8 món gợi ý
  const suggestedFoods = [...food_list]
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowPopup(true);
  };

  return (
    <div className="cart-suggestions-section">
      <div className="suggestions-header">
        <h3>Bạn sẽ thích! </h3>
        <p>
          Xem thêm trong{" "}
          <span className="link" onClick={() => navigate("/")}>
            thực đơn của chúng tôi
          </span>
        </p>
      </div>

      <div className="suggestions-wrapper">
        <button className="arrow left" onClick={() => scroll("left")}>
          ‹
        </button>

        <div className="cart-suggestions-list" ref={scrollRef}>
          {suggestedFoods.map((food) => (
            <div
              key={food._id}
              className="suggestion-item"
              onClick={() => handleFoodClick(food)} // ✅ mở popup
            >
              <img src={`${url}/images/${food.image}`} alt={food.name} />
              <div className="suggestion-info">
                <h4>{food.name}</h4>
                <p>{food.price.toLocaleString("vi-VN")} ₫</p>
                {/* ❌ bỏ nút “+ Thêm” trực tiếp, vì người dùng sẽ thêm qua popup */}
              </div>
            </div>
          ))}
        </div>

        <button className="arrow right" onClick={() => scroll("right")}>
          ›
        </button>
      </div>

      {/* ✅ Hiển thị popup chi tiết */}
      {showPopup && selectedFood && (
        <FoodPopup food={selectedFood} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
};

export default CartSuggestions;
