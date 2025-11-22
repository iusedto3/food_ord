import { useContext, useEffect, useRef, useState } from "react";
import { StoreContext } from "../contexts/StoreContext";
import { calculateItemPrice } from "../utils/pricing";

export default function useFoodPopup(food, mode, itemIndex, onClose) {
  const { addToCart, updateCartItem } = useContext(StoreContext);

  const popupRef = useRef(null);

  // === STATE ===
  const [quantity, setQuantity] = useState(mode === "edit" ? food.quantity : 1);

  // SIZE
  const [selectedSize, setSelectedSize] = useState(
    mode === "edit" ? food.size : food.sizes?.[0] || "Vừa"
  );

  // CRUST
  const [selectedCrust, setSelectedCrust] = useState(
    mode === "edit"
      ? food.crust || null
      : food.crusts?.[0] || null // crust mặc định: rẻ nhất
  );

  // TOPPINGS
  const [selectedToppings, setSelectedToppings] = useState(
    mode === "edit" ? food.toppings || [] : []
  );

  // NOTE
  const [note, setNote] = useState(mode === "edit" ? food.note : "");

  // AUTO FOCUS
  useEffect(() => {
    popupRef.current?.focus();
  }, []);

  // CLOSE ON ESC
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // SYNC WHEN EDIT MODE
  useEffect(() => {
    if (mode === "edit") {
      setSelectedSize(food.size);
      setSelectedCrust(food.crust || null);
      setSelectedToppings(food.toppings || []);
      setQuantity(food.quantity);
      setNote(food.note || "");
    }
  }, [mode, food]);

  // 👉 Toggle topping
  const toggleTopping = (opt) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.label === opt.label);
      if (exists) return prev.filter((t) => t.label !== opt.label);
      return [...prev, opt];
    });
  };

  // 👉 TÍNH GIÁ — dùng pricing.js
  const totalPrice = (() => {
    const item = {
      ...food,
      size: selectedSize,
      crust: selectedCrust,
      toppings: selectedToppings,
      quantity,
    };
    return calculateItemPrice(item) * quantity;
  })();

  // 👉 Xác nhận
  const handleConfirm = () => {
    const payload = {
      _id: food._id,
      name: food.name,
      image: food.image,
      price: food.price,

      size: selectedSize,
      crust: selectedCrust,
      toppings: selectedToppings,

      note,
      quantity,
      totalPrice,
    };

    if (mode === "edit") {
      updateCartItem(itemIndex, payload);
    } else {
      addToCart(payload);
    }

    onClose();
  };

  return {
    popupRef,
    quantity,
    setQuantity,

    selectedSize,
    setSelectedSize,

    selectedCrust,
    setSelectedCrust,

    selectedToppings,
    toggleTopping,

    note,
    setNote,

    totalPrice,
    handleConfirm,
  };
}
