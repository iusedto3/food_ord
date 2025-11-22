import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";

// ---------------------------
// PLACE ORDER
// ---------------------------
export const placeOrder = async (req, res) => {
  const userId = req.body.userId || null; // guest sẽ không có userId

  try {
    let cartItems = [];

    // ---------------------------
    // 1. Nếu USER → lấy cart từ DB
    // ---------------------------
    if (userId) {
      const user = await userModel.findById(userId);

      if (!user) {
        return res.json({ success: false, msg: "User không tồn tại" });
      }

      cartItems = user.cartData;
      if (!cartItems || cartItems.length === 0) {
        return res.json({ success: false, msg: "Giỏ hàng trống" });
      }
    }

    // ---------------------------
    // 2. Nếu GUEST → lấy từ FE gửi qua
    // ---------------------------
    if (!userId) {
      if (!req.body.items || req.body.items.length === 0) {
        return res.json({ success: false, msg: "Giỏ hàng trống (guest)" });
      }

      cartItems = req.body.items;
    }

    // ---------------------------
    // 3. Lấy các field từ FE gửi lên
    // ---------------------------
    const { address, customer, amount, paymentMethod } = req.body;

    if (!address || !customer || !amount || !paymentMethod) {
      return res.json({
        success: false,
        msg: "Thiếu dữ liệu order (address, customer, paymentMethod...)",
      });
    }

    // Recalculate totalPrice for each item
    const itemsWithTotalPrice = cartItems.map(item => {
      const toppingsPrice = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
      const itemTotalPrice = (item.basePrice + toppingsPrice) * item.quantity;
      return { ...item, totalPrice: itemTotalPrice };
    });

    // ---------------------------
    // 4. Tạo order
    // ---------------------------
    const newOrder = new orderModel({
      orderId: generateOrderId(),
      userId: userId || null,
      items: itemsWithTotalPrice,
      amount,
      shippingFee: 15000,

      address,
      customer,

      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "unpaid",

      status: "preparing",
    });

    await newOrder.save();
    // Gửi email xác nhận đơn hàng
    try {
    await sendEmail(newOrder);
  } catch (err) {
    console.log("❌ Lỗi gửi email:", err);
  }
    // ---------------------------
    // 5. Nếu USER → clear giỏ hàng
    // ---------------------------
    if (userId) {
      await userModel.findByIdAndUpdate(userId, { cartData: [] });
    }

    return res.json({
      success: true,
      msg: "Đặt hàng thành công",
      orderId: newOrder._id,
    });
  } catch (err) {
    console.log("❌ Error placeOrder:", err);
    return res.json({
      success: false,
      msg: "Lỗi server khi đặt hàng",
      error: err.message,
    });
  }
};

// Tạo mã đơn duy nhất
const generateOrderId = () => {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PH${yy}${mm}${dd}${random}`;
};

// ---------------------------
// GET ORDER DETAIL
// ---------------------------
export const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({ success: false, msg: "Không tìm thấy đơn hàng" });
    }

    return res.json({
      success: true,
      order,
    });
  }
  catch (err) {
    console.log("❌ Lỗi lấy chi tiết đơn:", err);
    return res.json({
      success: false,
      msg: "Lỗi server khi lấy chi tiết đơn hàng",
      error: err.message,
    });
  }
};

// ---------------------------
// GET USER ORDERS
// ---------------------------
export const getUserOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi server!" });
  }
};

// ---------------------------
// ADMIN: LẤY DANH SÁCH ĐƠN HÀNG
// ---------------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .sort({ createdAt: -1 }); // Sắp xếp từ mới nhất

    return res.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.log("❌ Lỗi lấy danh sách đơn:", err);
    return res.json({
      success: false,
      msg: "Lỗi server khi lấy đơn hàng",
      error: err.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const valid = ["preparing", "delivering", "completed", "canceled"];
    if (!valid.includes(status)) {
      return res.json({ success: false, msg: "Trạng thái không hợp lệ" });
    }

    const updated = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, msg: "Không tìm thấy đơn hàng" });
    }

    return res.json({
      success: true,
      msg: "Cập nhật thành công",
      order: updated,
    });
  } catch (err) {
    return res.json({
      success: false,
      msg: "Lỗi khi cập nhật trạng thái",
      error: err.message,
    });
  }
};