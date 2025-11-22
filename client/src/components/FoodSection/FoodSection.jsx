import React from "react";
import "./FoodSection.css";
import FoodItem from "../FoodItem/FoodItem";
import defaultBanner from "/Pizza.png";

const FoodSection = ({ category, items, onFoodClick, url, token }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const bannerMap = {
    Pizza: "/Pizza.png",
    Chickens: "/src/assets/banner-chicken.jpg",
    Spaghetti: "/src/assets/banner-pasta.jpg",
    Salad: "/src/assets/banner-salad.jpg",
  };

  const banner = bannerMap[category] || defaultBanner;

  return (
    <section id={category} className="food-section">
      <h3 className="food-section-title">{category}</h3>
      <div className="food-section-banner">
        <img src={banner} alt={category} />
      </div>
      <div className="food-section-grid">
        {items.map((food) => (
          <div
            key={food._id}
            className="food-section-item"
            onClick={() => onFoodClick(food)}
          >
            <FoodItem
              id={food._id}
              name={food.name}
              description={food.description}
              price={food.price}
              image={food.image}
              url={url}
              token={token}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FoodSection;
