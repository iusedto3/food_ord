import React, { useEffect, useState } from "react";
import "./ExploreMenu.css";
import axios from "axios";

const ExploreMenu = ({ category, setCategory, setFoodList }) => {
  const [menuList, setMenuList] = useState([]);

  const API_URL = "http://localhost:4000/api/food";

  // Lấy danh sách danh mục từ backend
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setMenuList(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  };

  // Lấy món ăn theo danh mục
  const fetchFoodsByCategory = async (selectedCategory) => {
    try {
      if (selectedCategory === "All") {
        const res = await axios.get(`${API_URL}/list`);
        if (res.data.success && Array.isArray(res.data.data)) {
          setFoodList(res.data.data);
        }
      } else {
        const res = await axios.get(`${API_URL}/category/${selectedCategory}`);
        if (res.data.success && Array.isArray(res.data.data)) {
          setFoodList(res.data.data);
        } else {
          setFoodList([]); // Không có món nào
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải món ăn:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Khi đổi danh mục, tự động gọi API lấy món
  useEffect(() => {
    fetchFoodsByCategory(category);
  }, [category]);

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>THỰC ĐƠN</h1>
      <p className="explore-menu-text">
        "Cảnh báo: ghé thăm website này có thể khiến bạn đói không kiểm soát!"
        <br />
        "Ăn xong nhớ quay lại – khẩu phần tình yêu còn rất nhiều!"
      </p>

      <div className="explore-menu-list">
        {menuList.map((cat, index) => (
          <div
            key={index}
            onClick={() => setCategory((prev) => (prev === cat ? "All" : cat))}
            className="explore-menu-list-item"
          >
            <div className={`menu-item ${category === cat ? "active" : ""}`}>
              <p>{cat}</p>
            </div>
          </div>
        ))}
      </div>

      <hr />
    </div>
  );
};

export default ExploreMenu;
