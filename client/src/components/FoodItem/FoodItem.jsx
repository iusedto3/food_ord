import React, { useContext, useState, useMemo } from "react";
import "./FoodItem.css";
import { StoreContext } from "../../contexts/StoreContext";
import { formatVND } from "../../utils/format";

// 🟢 Nhận thêm prop 'sizes'
const FoodItem = ({ id, name, price, description, image, sizes, onClick }) => {
  const { addToCart, backendUrl } = useContext(StoreContext);
  const [loaded, setLoaded] = useState(false);

  // 🟢 LOGIC MỚI: Tính giá hiển thị
  // Nếu có sizes, tìm giá thấp nhất trong các size (S, M, L) để hiển thị "Chỉ từ..."
  // Nếu không có sizes, dùng giá gốc (price)
  const displayPrice = useMemo(() => {
    if (sizes && typeof sizes === "object") {
      // Lấy tất cả giá trị tiền từ object sizes, loại bỏ giá trị 0 hoặc null
      const prices = Object.values(sizes).filter(
        (p) => typeof p === "number" && p > 0
      );
      if (prices.length > 0) {
        return Math.min(...prices); // Lấy giá nhỏ nhất
      }
    }
    return price; // Fallback về giá gốc
  }, [sizes, price]);

  const flyToCart = (e) => {
    // ... (Giữ nguyên logic hiệu ứng bay)
    const cart = document.querySelector(".navbar-cart");
    const imgToFly = e.target
      .closest(".food-item")
      .querySelector(".food-item-img");
    if (!imgToFly || !cart) return; // Safety check

    const imgClone = imgToFly.cloneNode(true);
    const rect = imgToFly.getBoundingClientRect();

    imgClone.style.position = "fixed";
    imgClone.style.left = `${rect.left}px`;
    imgClone.style.top = `${rect.top}px`;
    imgClone.style.width = `${rect.width}px`;
    imgClone.style.height = `${rect.height}px`;
    imgClone.style.zIndex = "9999";
    imgClone.style.transition = "all 1s ease-in-out";

    document.body.appendChild(imgClone);

    setTimeout(() => {
      const cartRect = cart.getBoundingClientRect();
      imgClone.style.left = `${cartRect.left + cartRect.width / 2}px`;
      imgClone.style.top = `${cartRect.top + cartRect.height / 2}px`;
      imgClone.style.width = "0px";
      imgClone.style.height = "0px";
      imgClone.style.transform = "rotate(360deg)";
    }, 10);

    setTimeout(() => {
      imgClone.remove();
    }, 1000);
  };

  return (
    <div className="food-item horizontal" onClick={onClick}>
      <div className="food-item-img-container round-img">
        {!loaded && <div className="skeleton skeleton-img" />}
        <img
          className={`food-item-img ${loaded ? "visible" : "hidden"}`}
          src={`${backendUrl}/images/${image}`}
          alt={name}
          onLoad={() => setLoaded(true)}
        />
      </div>

      <div className="food-item-info">
        <h3 className="food-item-name">{name}</h3>
        <p className="food-item-desc">{description}</p>

        <div className="food-item-bottom">
          <div className="food-item-price-section">
            <span className="food-item-price-label">Chỉ từ</span>
            {/* 🟢 Hiển thị giá đã tính toán */}
            <span className="food-item-price">{formatVND(displayPrice)}</span>
          </div>

          <button
            className="food-item-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                _id: id,
                name,
                price, // Vẫn gửi giá gốc vào giỏ (Logic giỏ sẽ tự xử lý lại sau)
                image,
                description,
                quantity: 1,
              });
              flyToCart(e);
            }}
            aria-label="Thêm vào giỏ"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
