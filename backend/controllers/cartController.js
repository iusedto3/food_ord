import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// ===================== GET CART =====================
export const getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "Không tìm thấy người dùng" });

    return res.json({
      success: true,
      cartData: user.cartData || []
    });
  } catch (err) {
    console.error("getCart error:", err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// ===================== ADD TO CART =====================
export const addToCart = async (req, res) => {
  try {
    // 1. Nhận totalPrice từ Frontend
    const { userId, _id: itemId, size, crust, toppings = [], note = "", quantity = 1, totalPrice } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (!user.cartData) user.cartData = [];

    const food = await foodModel.findById(itemId);
    if (!food) return res.json({ success: false, message: "Food not found" });

    // =========================================================
    // 🟢 QUAN TRỌNG: ƯU TIÊN GIÁ TỪ FRONTEND
    // =========================================================
    let finalItemPrice = 0;
    let finalTotalPrice = 0;

    if (totalPrice) {
        // ✅ TRƯỜNG HỢP 1: Frontend đã tính sẵn (120k) -> Dùng luôn!
        finalTotalPrice = Number(totalPrice); 
        // Tính ngược lại đơn giá (để lưu vào price nếu cần)
        finalItemPrice = finalTotalPrice / quantity;
    } else {
        // ⚠️ TRƯỜNG HỢP 2: Frontend không gửi giá -> Server tự tính (Fallback)
        // (Giữ lại logic tính toán cũ của bạn ở đây để phòng hờ)
        let basePrice = food.price;
        const sizeMap = { "Nhỏ": "S", "Vừa": "M", "Lớn": "L" };
        const sizeKey = sizeMap[size] || "M"; 
        
        if (food.sizes && food.sizes[sizeKey]) basePrice = food.sizes[sizeKey];
        
        // ... logic tính đế/topping server ...
        // finalTotalPrice = ...
        // Tạm thời nếu fallback thì lấy giá gốc
        finalTotalPrice = basePrice * quantity;
    }

    // 3. LƯU VÀO GIỎ HÀNG
    const existingIndex = user.cartData.findIndex(
      (item) =>
        item._id.toString() === itemId &&
        item.size === size &&
        // So sánh label đế bánh (nếu có)
        (item.crust?.label || "") === (crust?.label || "") &&
        JSON.stringify(item.toppings) === JSON.stringify(toppings)
    );

    if (existingIndex !== -1) {
      // Cập nhật số lượng
      user.cartData[existingIndex].quantity += quantity;
      
      // ✅ CỘNG DỒN GIÁ TIỀN (Lấy giá cũ + giá mới gửi lên)
      user.cartData[existingIndex].totalPrice += finalTotalPrice;
      
    } else {
      // Thêm mới
      user.cartData.push({
        _id: itemId,
        name: food.name,
        image: food.image,
        price: food.price, // Giá gốc tham khảo
        size,
        crust, 
        toppings,
        note,
        quantity,
        
        // ✅ LƯU GIÁ CUỐI CÙNG (120.000đ)
        totalPrice: finalTotalPrice, 
      });
    }

    await user.save();
    return res.json({ success: true, message: "Đã thêm vào giỏ hàng", cartData: user.cartData });

  } catch (err) {
    console.error("addToCart error:", err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// ... (Giữ nguyên các hàm remove, update, sync, clear bên dưới)
export const removeFromCart = async (req, res) => {
  try {
    const { userId, itemIndex } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.cartData || itemIndex < 0 || itemIndex >= user.cartData.length) {
      return res.json({ success: false, message: "Món ăn không tồn tại" });
    }

    user.cartData.splice(itemIndex, 1);
    await user.save();

    return res.json({ success: true, message: "Đã xoá món", cartData: user.cartData });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { userId, index, updatedItem } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.cartData || index < 0 || index >= user.cartData.length) {
      return res.json({ success: false, message: "Món ăn không tồn tại" });
    }

    // 🟢 TODO: Nếu muốn bảo mật tuyệt đối, ở đây cũng nên tính lại giá như addToCart
    // Nhưng để đơn giản cho đồ án, ta tạm chấp nhận cập nhật từ client
    user.cartData[index] = updatedItem;
    await user.save();

    return res.json({ success: true, cartData: user.cartData });
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

export const syncCart = async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (!items || items.length === 0) return res.json({ success: true, message: "Nothing to sync" });

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.cartData) user.cartData = [];

    // Logic merge đơn giản: Cứ push vào (hoặc check trùng nếu muốn kỹ)
    items.forEach((item) => user.cartData.push(item));

    await user.save();
    return res.json({ success: true, message: "Đồng bộ thành công", cartData: user.cartData });
  } catch (err) {
    console.error("Sync cart error:", err);
    res.json({ success: false, message: "Lỗi đồng bộ" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    if (!userId) return res.json({ success: false, message: "Thiếu ID" });

    await userModel.findByIdAndUpdate(userId, { cartData: [] });

    if (res) return res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("clearCart error:", err);
    if (res) res.json({ success: false, message: "Error clearing cart" });
  }
};