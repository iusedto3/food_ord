import React, { useContext, useState } from "react";
import "./FoodDisplay.css";
import useFood from "../../hooks/useFood";
import FoodItem from "../FoodItem/FoodItem";
import FoodPopup from "../FoodPopup/FoodPopup";
import bannerDefault from "/Pizza.png";
import { StoreContext } from "../../contexts/StoreContext";

const FoodDisplay = () => {
  const { url, token } = useContext(StoreContext);
  const { foodList, loading } = useFood(url);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  if (loading) {
    return <p className="loading-text">Đang tải thực đơn...</p>;
  }

  if (!Array.isArray(foodList) || foodList.length === 0) {
    return <p className="loading-text">Không có món ăn nào!</p>;
  }

  const categories = [...new Set(foodList.map((f) => f.category))];

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowPopup(true);
  };

  return (
    <div className="food-display">
      {categories.map((cat) => {
        const items = foodList.filter((item) => item.category === cat);
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
                  sizes={food.sizes}
                  image={food.image}
                  onClick={() => handleFoodClick(food)}
                  url={url}
                  token={token}
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
