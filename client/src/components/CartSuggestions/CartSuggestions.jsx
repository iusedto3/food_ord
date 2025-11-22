import React, { useRef, useState, useEffect } from "react";
import "./CartSuggestions.css";
import { useNavigate } from "react-router-dom";
import FoodPopup from "../FoodPopup/FoodPopup";
import useFood from "../../hooks/useFood";
import { formatVND } from "../../utils/format";

const CartSuggestions = () => {
  const url = "http://localhost:4000";
  const { foodList, loading } = useFood(url);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [selectedFood, setSelectedFood] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Chọn ngẫu nhiên 8 món gợi ý
  const suggestedFoods = [...foodList]
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

  // Kiểm tra khả năng scroll
  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Tính index hiện tại (ước lượng)
      const itemWidth = 296; // 280px + 16px gap
      setCurrentIndex(Math.round(scrollLeft / itemWidth));
    }
  };

  useEffect(() => {
    checkScrollability();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        scrollElement.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [suggestedFoods]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const itemWidth = 296; // 280px + 16px gap
      scrollRef.current.scrollBy({
        left: dir === "left" ? -itemWidth : itemWidth,
        behavior: "smooth",
      });
    }
  };

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowPopup(true);
  };

  if (loading) return <p className="loading-text">Đang tải gợi ý món ăn...</p>;

  if (!suggestedFoods.length)
    return <p className="loading-text">Không có món gợi ý!</p>;

  return (
    <div className="cart-suggestions-section">
      <div className="suggestions-header">
        <h3>Có thể bạn sẽ thích</h3>
      </div>

      <div className="suggestions-wrapper">
        {/* Left Arrow - chỉ hiện khi có thể scroll trái */}
        {canScrollLeft && (
          <button
            className="suggestions-arrow suggestions-prev"
            onClick={() => scroll("left")}
            aria-label="Xem món trước"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Food List */}
        <div className="cart-suggestions-list" ref={scrollRef}>
          {suggestedFoods.map((food) => (
            <div
              key={food._id}
              className="suggestion-item"
              onClick={() => handleFoodClick(food)}
            >
              <img
                src={`${url}/images/${food.image}`}
                alt={food.name}
                onError={(e) => (e.target.src = "/fallback.png")}
              />
              <div className="suggestion-info">
                <h4>{food.name}</h4>
                <span className="suggestion-price">
                  {formatVND(food.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow - chỉ hiện khi có thể scroll phải */}
        {canScrollRight && (
          <button
            className="suggestions-arrow suggestions-next"
            onClick={() => scroll("right")}
            aria-label="Xem món tiếp"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dots Indicator */}
      {suggestedFoods.length > 2 && (
        <div className="suggestions-dots">
          {Array.from({ length: Math.ceil(suggestedFoods.length / 2) }).map(
            (_, idx) => (
              <span
                key={idx}
                className={`dot ${
                  Math.floor(currentIndex / 2) === idx ? "active" : ""
                }`}
              />
            )
          )}
        </div>
      )}

      {/* Popup */}
      {showPopup && selectedFood && (
        <FoodPopup food={selectedFood} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
};

export default CartSuggestions;
