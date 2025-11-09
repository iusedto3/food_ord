import React, { useContext, useState } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../contexts/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import FoodPopup from "../FoodPopup/FoodPopup";
import bannerDefault from "/Pizza.png";

const FoodDisplay = () => {
  const { food_list } = useContext(StoreContext);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  if (!Array.isArray(food_list) || food_list.length === 0) {
    return <p className="loading-text">Đang tải thực đơn...</p>;
  }

  const categories = [...new Set(food_list.map((f) => f.category))];

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowPopup(true);
  };

  return (
    <div className="food-display">
      {categories.map((cat) => {
        const items = food_list.filter((item) => item.category === cat);
        return (
          <section key={cat} id={cat} className="food-section">
            <h2 className="food-section-title">{cat}</h2>

            <div className="food-section-banner">
              <img src={bannerDefault} alt={`Banner ${cat}`} />
            </div>

            <div className="food-grid-two">
              {items.map((food) => (
                <FoodItem
                  key={food._id}
                  id={food._id}
                  name={food.name}
                  description={food.description}
                  price={food.price}
                  image={food.image}
                  onClick={() => handleFoodClick(food)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {showPopup && selectedFood && (
        <FoodPopup food={selectedFood} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
};

export default FoodDisplay;
