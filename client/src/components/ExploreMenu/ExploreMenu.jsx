import React, { useEffect, useState, useContext } from "react";
import "./ExploreMenu.css";
import axios from "axios";
import { StoreContext } from "../../contexts/StoreContext";

const ExploreMenu = ({ category, setCategory }) => {
  const [menuList, setMenuList] = useState([]);
  const { url } = useContext(StoreContext);
  const API_URL = `${url}/api/food`;

  // 🔹 Lấy danh sách danh mục (categories)
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setMenuList(["All", ...res.data.data]); // thêm "All" ở đầu
      }
    } catch (err) {
      console.error(" Lỗi khi tải danh mục:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 Khi click danh mục: chỉ đổi state và scroll đến section tương ứng
  const handleClick = (cat) => {
    setCategory(cat);

    // Nếu chọn All thì cuộn lên đầu trang
    if (cat === "All") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Cuộn tới section tương ứng
    setTimeout(() => {
      const section = document.getElementById(cat);
      if (section) {
        const yOffset = -80;
        const y =
          section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 300);
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <div className="explore-menu-list">
        {menuList.map((cat, index) => (
          <div key={index} className="explore-menu-list-item">
            <div
              className={`menu-item ${category === cat ? "active" : ""}`}
              onClick={() => handleClick(cat)}
            >
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
