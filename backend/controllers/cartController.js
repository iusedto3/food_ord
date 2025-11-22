import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// ===================== GET CART =====================
export const getCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    return res.json({
      success: true,
      cartData: user.cart || []
    });
  } catch (err) {
    console.error("getCart error:", err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// ===================== ADD TO CART =====================
export const addToCart = async (req, res) => {
  try {
    const {
      userId,
      _id: itemId,
      size,
      crust,
      toppings = [],
      note = "",
      quantity = 1,
      totalPrice,
    } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    if (!user.cart) user.cart = [];

    const food = await foodModel.findById(itemId);
    if (!food) {
      return res.json({ success: false, message: "Không tìm thấy món ăn" });
    }

    const existingIndex = user.cart.findIndex(
      (item) =>
        item._id.toString() === itemId &&
        item.size === size &&
        JSON.stringify(item.crust) === JSON.stringify(crust) &&
        JSON.stringify(item.toppings) === JSON.stringify(toppings) &&
        item.note === note
    );

    if (existingIndex !== -1) {
      user.cart[existingIndex].quantity += quantity;
      user.cart[existingIndex].totalPrice = totalPrice * user.cart[existingIndex].quantity;
    } else {
      user.cart.push({
        _id: itemId,
        name: food.name,
        image: food.image,
        size,
        crust,
        toppings,
        note,
        quantity,
        price: food.price,
        totalPrice,
      });
    }

    await user.save();

    return res.json({
      success: true,
      message: "Đã thêm vào giỏ hàng",
      cartData: user.cart
    });
  } catch (err) {
    console.error("addToCart error:", err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// ===================== REMOVE FROM CART =====================
export const removeFromCart = async (req, res) => {
  try {
    const { userId, itemIndex } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    if (!user.cart || itemIndex < 0 || itemIndex >= user.cart.length) {
      return res.json({ success: false, message: "Món ăn không tồn tại trong giỏ" });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    return res.json({
      success: true,
      message: "Đã xoá món khỏi giỏ hàng",
      cartData: user.cart
    });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// ===================== UPDATE CART ITEM =====================
export const updateCartItem = async (req, res) => {
  try {
    const { userId, index, updatedItem } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "Không tìm thấy người dùng" });

    if (!user.cart || index < 0 || index >= user.cart.length) {
      return res.json({ success: false, message: "Món ăn không tồn tại trong giỏ" });
    }

    user.cart[index] = updatedItem;
    await user.save();

    return res.json({
      success: true,
      cartData: user.cart
    });
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};
