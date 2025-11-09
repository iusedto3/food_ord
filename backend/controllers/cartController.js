import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// 🧺 Thêm món vào giỏ hàng
export const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size, toppings = [], note = "", quantity = 1 } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "Không tìm thấy người dùng" });

    const food = await foodModel.findById(itemId);
    if (!food) return res.json({ success: false, message: "Không tìm thấy món ăn" });

    // 🧮 Tính giá tiền
    const toppingTotal = toppings.reduce((sum, t) => sum + (t.price || 0), 0);
    const basePrice = Number(food.price);
    const totalPrice = (basePrice + toppingTotal) * quantity;

    // 🧩 Kiểm tra món tương tự đã tồn tại chưa (id + size + toppings + note)
    const existingItem = user.cartData.find(
      (i) =>
        i.itemId.toString() === itemId &&
        i.size === size &&
        JSON.stringify(i.toppings) === JSON.stringify(toppings) &&
        i.note === note
    );

    if (existingItem) {
      // Nếu trùng thì cộng dồn số lượng và giá
      existingItem.quantity += quantity;
      existingItem.totalPrice += totalPrice;
    } else {
      // Nếu chưa có, thêm mới vào giỏ
      const newItem = {
        itemId,
        name: food.name,
        size,
        toppings,
        note,
        quantity,
        basePrice,
        totalPrice,
        image: food.image,
      };
      user.cartData.push(newItem);
    }

    await user.save();
    res.json({
      success: true,
      message: "Đã thêm vào giỏ hàng",
      cartData: user.cartData,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm vào giỏ hàng:", err);
    res.json({ success: false, message: "Lỗi khi thêm vào giỏ hàng" });
  }
};

// 🗑️ Xóa món khỏi giỏ (dựa theo index)
export const removeFromCart = async (req, res) => {
  try {
    const { userId, itemIndex } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "Không tìm thấy người dùng" });

    if (itemIndex < 0 || itemIndex >= user.cartData.length) {
      return res.json({ success: false, message: "Món ăn không tồn tại trong giỏ" });
    }

    user.cartData.splice(itemIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: "Đã xoá món khỏi giỏ hàng",
      cartData: user.cartData,
    });
  } catch (err) {
    console.error("❌ Lỗi khi xoá khỏi giỏ hàng:", err);
    res.json({ success: false, message: "Lỗi khi xoá món ăn" });
  }
};

// 📦 Lấy giỏ hàng của người dùng
export const getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "Không tìm thấy người dùng" });

    res.json({
      success: true,
      cartData: user.cartData,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy giỏ hàng:", err);
    res.json({ success: false, message: "Không thể tải giỏ hàng" });
  }
};


export const updateCartItem = async (req, res) => {
  try {
    const { userId, itemIndex, updatedItem } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "Không tìm thấy người dùng" });

    if (itemIndex < 0 || itemIndex >= user.cartData.length) {
      return res.json({ success: false, message: "Món ăn không tồn tại trong giỏ" });
    }

    // 🧩 Gộp dữ liệu mới
    user.cartData[itemIndex] = {
      ...user.cartData[itemIndex],
      ...updatedItem
    };

    await user.save();

    res.json({
      success: true,
      message: "Đã cập nhật món trong giỏ hàng",
      cartData: user.cartData
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật giỏ hàng:", err);
    res.json({ success: false, message: "Lỗi khi cập nhật món ăn" });
  }
};