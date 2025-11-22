import React, { useState } from "react";
import "./UtensilsPopup.css";

const utensilOptions = [
  { id: 1, name: "Muỗng", price: 0 },
  { id: 2, name: "Nĩa", price: 0 },
];

const UtensilsPopup = ({ onClose }) => {
  const [selected, setSelected] = useState([]);

  const toggleItem = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="utensils-popup-overlay">
      <div className="utensils-popup">
        <h2>Dụng cụ ăn kèm</h2>

        <div className="utensils-list">
          {utensilOptions.map((item) => (
            <label key={item.id} className="utensil-row">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggleItem(item.id)}
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>

        <div className="popup-actions">
          <button className="close-btn" onClick={onClose}>
            Đóng
          </button>
          <button className="confirm-btn" onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};

export default UtensilsPopup;
