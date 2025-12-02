import { useContext, useEffect, useRef, useState } from "react";
import { StoreContext } from "../contexts/StoreContext";

export default function useFoodPopup(food, mode, itemIndex, onClose) {
  const { addToCart, updateCartItem } = useContext(StoreContext);
  const popupRef = useRef(null);

  // === STATE ===
  const [quantity, setQuantity] = useState(mode === "edit" ? food.quantity : 1);

  // SIZE: Mặc định là "Vừa" (tương ứng với M)
  const [selectedSize, setSelectedSize] = useState(
    mode === "edit" ? food.size : "Vừa"
  );

  // CRUST
  const [selectedCrust, setSelectedCrust] = useState(
    mode === "edit"
      ? food.crust || null
      : food.crust?.list?.[0] || null // Mặc định chọn loại đế đầu tiên
  );

  // TOPPINGS
  const [selectedToppings, setSelectedToppings] = useState(
    mode === "edit" ? food.toppings || [] : []
  );

  // NOTE
  const [note, setNote] = useState(mode === "edit" ? food.note : "");
  
  // TOTAL PRICE (State này sẽ được tính toán tự động)
  const [totalPrice, setTotalPrice] = useState(0);

  // AUTO FOCUS & CLOSE ON ESC
  useEffect(() => {
    popupRef.current?.focus();
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // SYNC WHEN EDIT MODE
  useEffect(() => {
    if (mode === "edit" && food) {
      // 🟢 LOGIC MỚI: Ưu tiên lấy dữ liệu từ CartItem truyền sang (user_...)
      // Nếu không có (trường hợp view thường) thì lấy mặc định
      
      setSelectedSize(food.user_size || food.size || "Vừa");
      
      setSelectedCrust(food.user_crust || food.crust || null);
      
      setSelectedToppings(food.user_toppings || food.toppings || []);
      
      setQuantity(food.user_quantity || food.quantity || 1);
      
      setNote(food.user_note || food.note || "");
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

  // 👉 TÍNH GIÁ TIỀN (QUAN TRỌNG: LOGIC MỚI)
  useEffect(() => {
    if (!food) return;

    // 1. Map tên Size (UI) sang Key (DB)
    const sizeMap = { "Nhỏ": "S", "Vừa": "M", "Lớn": "L" };
    const currentSizeKey = sizeMap[selectedSize] || "M"; // Fallback là M

    // 2. Tính giá gốc (Base Price)
    let basePrice = food.price; // Giá mặc định
    
    // Nếu DB dùng cấu trúc sizes: { S:..., M:..., L:... }
    if (food.sizes && typeof food.sizes === 'object' && food.sizes[currentSizeKey] !== undefined) {
        basePrice = food.sizes[currentSizeKey];
    } else {
        // Fallback logic cũ (nếu dữ liệu chưa migration)
        if (selectedSize === "Lớn") basePrice *= 1.35;
        else if (selectedSize === "Nhỏ") basePrice *= 0.8;
    }

    // 3. Tính giá Đế bánh (Crust) - Theo Size
    let crustPrice = 0;
    if (selectedCrust) {
        // Nếu crust có cấu trúc prices: { S, M, L }
        if (selectedCrust.prices && selectedCrust.prices[currentSizeKey] !== undefined) {
            crustPrice = selectedCrust.prices[currentSizeKey];
        } 
        // Fallback cũ: selectedCrust.price
        else if (selectedCrust.price) {
            crustPrice = selectedCrust.price;
        }
    }

    // 4. Tính giá Topping
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + (Number(t.price) || 0), 0);

    // 5. Tổng đơn giá
    const unitPrice = Math.round(basePrice + crustPrice + toppingsPrice);
    
    setTotalPrice(unitPrice * quantity);

  }, [food, selectedSize, selectedCrust, selectedToppings, quantity]);


  // 👉 Xác nhận (Thêm vào giỏ)
  const handleConfirm = () => {
    // Tính lại unit price để lưu vào giỏ (tránh lưu tổng tiền cục bộ)
    const unitPrice = totalPrice / quantity;

    const payload = {
      _id: food._id,
      name: food.name,
      image: food.image,
      price: food.price, // Giá gốc tham khảo

      size: selectedSize,
      crust: selectedCrust, // Lưu cả object crust (để sau này biết nó là đế gì, giá bao nhiêu)
      toppings: selectedToppings,

      note,
      quantity,
      
      // Lưu totalPrice chính xác do Client tính (để hiển thị ngay lập tức)
      totalPrice: totalPrice, 
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
    quantity, setQuantity,
    selectedSize, setSelectedSize,
    selectedCrust, setSelectedCrust,
    selectedToppings, toggleTopping,
    note, setNote,
    totalPrice, // Trả về state đã tính toán
    handleConfirm,
  };
}