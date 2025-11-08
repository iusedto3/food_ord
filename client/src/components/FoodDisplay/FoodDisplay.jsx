import React, { useContext, useState } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../contexts/StoreContext";
import FoodSection from "../FoodSection/FoodSection";
import FoodPopup from "../FoodPopup/FoodPopup";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  // Nếu dữ liệu chưa sẵn sàng
  if (!Array.isArray(food_list) || food_list.length === 0) {
    return <p className="loading-text">Đang tải thực đơn...</p>;
  }

  // Lấy danh sách danh mục duy nhất
  const categories = [...new Set(food_list.map((f) => f.category))];

  // Nếu đang chọn danh mục cụ thể thì chỉ hiển thị danh mục đó
  const filteredCategories =
    category === "All" ? categories : categories.filter((c) => c === category);

  // Khi click vào món ăn
  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowPopup(true);
  };

  // Khi đóng popup
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedFood(null);
  };

  return (
    <div className="food-display">
      <h2 className="food-display-title">Thực Đơn</h2>

      {filteredCategories.map((cat) => {
        const items = food_list.filter((item) => item.category === cat);
        return (
          <FoodSection
            key={cat}
            category={cat}
            items={items}
            onFoodClick={handleFoodClick}
          />
        );
      })}

      {showPopup && selectedFood && (
        <FoodPopup food={selectedFood} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default FoodDisplay;
