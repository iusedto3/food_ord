import { useContext, useEffect, useRef, useState } from "react";
import { StoreContext } from "../contexts/StoreContext";

export default function useFoodPopup(food, mode, itemIndex, onClose) {
  const { addToCart, updateCartItem } = useContext(StoreContext);
  const popupRef = useRef(null);

  // === 🟢 1. XÁC ĐỊNH DỮ LIỆU GỐC (QUAN TRỌNG) ===
  // Nếu đang Edit: food là Cart Item -> Dữ liệu giá nằm trong food.product (hoặc food.productId)
  // Nếu đang Add: food chính là Product -> Dữ liệu giá nằm ngay tại food
  const productData = food?.product || food?.productId || food || {};

  // === STATE ===
  const [quantity, setQuantity] = useState(mode === "edit" ? (food.quantity || 1) : 1);

  const [selectedSize, setSelectedSize] = useState(
    mode === "edit" ? (food.size || "Vừa") : "Vừa"
  );

  // Logic chọn Crust: Nếu edit thì lấy cái đã chọn, nếu add thì lấy cái đầu tiên trong list
  const [selectedCrust, setSelectedCrust] = useState(
    mode === "edit"
      ? (food.crust || null)
      : (productData.crust?.list?.[0] || null)
  );

  const [selectedToppings, setSelectedToppings] = useState(
    mode === "edit" ? (food.toppings || []) : []
  );

  const [note, setNote] = useState(mode === "edit" ? (food.note || "") : "");
  
  const [totalPrice, setTotalPrice] = useState(0);

  // AUTO FOCUS & CLOSE ON ESC
  useEffect(() => {
    popupRef.current?.focus();
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // SYNC WHEN EDIT MODE (Đồng bộ dữ liệu khi mở popup sửa)
  useEffect(() => {
    if (mode === "edit" && food) {
      // Ưu tiên lấy dữ liệu đã lưu trong Cart Item
      setSelectedSize(food.user_size || food.size || "Vừa");
      setSelectedCrust(food.user_crust || food.crust || null);
      setSelectedToppings(food.user_toppings || food.toppings || []);
      setQuantity(food.user_quantity || food.quantity || 1);
      setNote(food.user_note || food.note || "");
    }
  }, [mode, food]);

  // Toggle topping
  const toggleTopping = (opt) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.label === opt.label);
      if (exists) return prev.filter((t) => t.label !== opt.label);
      return [...prev, opt];
    });
  };

  // === 🟢 2. LOGIC TÍNH TIỀN ĐÃ FIX ===
  useEffect(() => {
    // Hàm phụ trợ: Ép kiểu giá tiền an toàn (xử lý cả chuỗi "49.000" và số)
    const parsePrice = (val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const cleanString = val.replace(/[^0-9]/g, ''); 
            return Number(cleanString) || 0;
        }
        return 0;
    };

    // Nếu không có dữ liệu sản phẩm gốc thì không tính được
    if (!productData || Object.keys(productData).length === 0) return;

    // A. Map tên Size -> Key
    const sizeMap = { "Nhỏ": "S", "Vừa": "M", "Lớn": "L" };
    const currentSizeKey = sizeMap[selectedSize] || "M";

    // B. Tính giá gốc (Base Price) dựa trên productData
    let basePrice = parsePrice(productData.price); 
    
    // Kiểm tra xem sản phẩm có bảng giá theo size không?
    if (productData.sizes && typeof productData.sizes === 'object') {
        const sizePrice = productData.sizes[currentSizeKey];
        if (sizePrice !== undefined && sizePrice !== null) {
            const parsedSizePrice = parsePrice(sizePrice);
            // Chỉ lấy giá size nếu nó > 0 (tránh trường hợp size=0 trong DB)
            if (parsedSizePrice > 0) {
                 basePrice = parsedSizePrice;
            }
        }
    } else {
        // Fallback logic cũ (nếu không có bảng sizes trong DB)
        if (selectedSize === "Lớn") basePrice *= 1.35;
        else if (selectedSize === "Nhỏ") basePrice *= 0.8;
    }

    // C. Tính giá Đế bánh (Crust)
    let crustPrice = 0;
    if (selectedCrust) {
        // Cố gắng tìm lại thông tin đế bánh mới nhất từ productData
        const originalCrust = productData.crust?.list?.find(c => c.label === selectedCrust.label);
        const crustSource = originalCrust || selectedCrust;

        if (crustSource.prices && crustSource.prices[currentSizeKey] !== undefined) {
            crustPrice = parsePrice(crustSource.prices[currentSizeKey]);
        } else if (crustSource.price) {
            crustPrice = parsePrice(crustSource.price);
        }
    }

    // D. Tính giá Topping
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + parsePrice(t.price), 0);

    // E. Tổng tiền
    const unitPrice = Math.round(basePrice + crustPrice + toppingsPrice);
    setTotalPrice(unitPrice * quantity);

    // Console log để debug nếu vẫn sai
    // console.log("Debug Price:", { basePrice, crustPrice, toppingsPrice, unitPrice });

  }, [productData, selectedSize, selectedCrust, selectedToppings, quantity]); // 🟢 Dependency thay đổi thành productData


const handleConfirm = () => {
    // Lấy ID gốc của sản phẩm
    const finalId = productData._id || food._id; 
    
    // 🟢 FIX LỖI: Kiểm tra kỹ Cruts/Topping trước khi lưu
    // Chỉ lưu crust nếu nó thực sự tồn tại và có tên (label)
    // Giúp tránh trường hợp lưu object rỗng {} hoặc null làm hiển thị sai ở giỏ hàng
    const finalCrust = (selectedCrust && selectedCrust.label) ? selectedCrust : null;

    const payload = {
      _id: finalId,
      name: productData.name || food.name,
      image: productData.image || food.image,
      price: productData.price || food.price, 

      size: selectedSize,
      
      // Sử dụng biến đã lọc sạch này
      crust: finalCrust, 
      
      toppings: selectedToppings,
      note,
      quantity,
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
    totalPrice,
    handleConfirm,
  };
}