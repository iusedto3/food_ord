import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken"; 
import { processPayment } from "../Services/payment/paymentService.js";

// ---------------------------
// 1. PLACE ORDER
// ---------------------------
export const placeOrder = async (req, res) => {
  let { userId, address, customer, amount, paymentMethod, items, voucher } = req.body;
  let cartItems = [];

  let calculatedAmount = 0;
    cartItems.forEach(item => {
        // Nếu item có totalPrice thì dùng, không thì tính tay
        const itemPrice = item.totalPrice ? item.totalPrice : (item.price * item.quantity);
        calculatedAmount += itemPrice;
    });

    // Gán ngược lại vào amount
    amount = calculatedAmount;

  try {
    // --- AUTH: Lấy userId từ Token nếu thiếu ---
    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id; 
        }
      } catch (e) {}
    }

    // --- ITEMS: Xử lý giỏ hàng ---
    if (userId) {
      const user = await userModel.findById(userId);
      if (!user) return res.json({ success: false, msg: "User không tồn tại" });
      // Ưu tiên lấy từ DB
      cartItems = (user.cartData && user.cartData.length > 0) ? user.cartData : (items || []);
    } else {
      cartItems = items;
    }

    if (!cartItems || cartItems.length === 0) {
      return res.json({ success: false, msg: "Giỏ hàng trống" });
    }

    // --- CALCULATION: Tính tổng tiền chuẩn xác ---
    let discountAmount = 0;
    let voucherCode = "";
    const shippingFee = 15000; // Phí ship

    if (voucher) {
        discountAmount = Number(voucher.discount) || 0;
        voucherCode = voucher.code || "";
    }

    // Tính lại tổng tiền cuối cùng để gửi sang cổng thanh toán
    // amount: Là tổng tiền hàng (Subtotal)
    const finalAmount = Math.max(0, amount + shippingFee - discountAmount);

    if (!address || !customer || !amount || !paymentMethod) {
      return res.json({ success: false, msg: "Thiếu dữ liệu order" });
    }

    // --- TẠO ORDER ---
    const itemsWithTotalPrice = cartItems.map((item) => {
      const itemObj = (item.toObject && typeof item.toObject === 'function') ? item.toObject() : item;
      const finalBasePrice = itemObj.basePrice !== undefined ? itemObj.basePrice : (itemObj.price || 0);
      const finalItemId = itemObj.itemId || itemObj._id;
      const toppingsPrice = Array.isArray(itemObj.toppings) ? itemObj.toppings.reduce((sum, t) => sum + (t.price || 0), 0) : 0;
      const itemTotalPrice = (finalBasePrice + toppingsPrice) * (itemObj.quantity || 1);

      return {
        ...itemObj,
        itemId: finalItemId,       
        basePrice: finalBasePrice, 
        totalPrice: itemTotalPrice,
      };
    });

    const newOrder = new orderModel({
      orderId: generateOrderId(),
      userId: userId || undefined,
      items: itemsWithTotalPrice,  
      amount, // Lưu giá gốc
      discountAmount,
      voucherCode,
      shippingFee,
      address,
      customer,
      paymentMethod,
      paymentStatus: "pending", // Mặc định là chờ
      status: "preparing",
      date: Date.now()
    });

    await newOrder.save();

    // --- XỬ LÝ THANH TOÁN ONLINE ---
    if (paymentMethod !== 'cod') {
        try {
            // Gửi finalAmount (đã tính toán) sang Service
            const paymentUrl = await processPayment(paymentMethod, newOrder._id, finalAmount);
            
            if (paymentUrl) {
                // Nếu là Online: CHƯA gửi mail, CHƯA xóa giỏ hàng (đợi verify)
                return res.json({ 
                    success: true, 
                    message: "Redirect to Payment", 
                    orderId: newOrder._id,
                    paymentUrl 
                });
            }
        } catch (err) {
            console.error("Lỗi tạo link thanh toán:", err);
            // Nếu lỗi, xóa đơn hàng rác
            await orderModel.findByIdAndDelete(newOrder._id);
            return res.json({ success: false, msg: "Lỗi cổng thanh toán" });
        }
    }

    // --- XỬ LÝ COD (TIỀN MẶT) ---
    // 1. Gửi mail ngay
    try { await sendEmail(newOrder); } catch (err) {}

    // 2. Clear giỏ hàng ngay (QUAN TRỌNG)
    if (userId) {
      await userModel.findByIdAndUpdate(userId, { cart: [] });
    }

    return res.json({
      success: true,
      msg: "Đặt hàng thành công",
      orderId: newOrder._id,
    });

  } catch (err) {
    console.log("❌ Error placeOrder:", err);
    return res.status(500).json({ success: false, msg: "Lỗi server", error: err.message });
  }
};

// ---------------------------
// 2. VERIFY ORDER (Xác thực & Gửi mail Online)
// ---------------------------
export const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    const query = {
        $or: [ { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderId: orderId } ] 
    };

    if (success === "true" || success === true) {
      const updatedOrder = await orderModel.findOneAndUpdate(
        query, 
        { paymentStatus: "paid" },
        { new: true }
      );
      
      if (!updatedOrder) return res.json({ success: false, message: "Không tìm thấy đơn hàng" });

      // 👇 ONLINE: Gửi mail khi đã thanh toán thành công
      try { await sendEmail(updatedOrder); } catch (err) {}

      // 👇 ONLINE: Xóa giỏ hàng khi đã thanh toán thành công
      if (updatedOrder.userId) {
          await userModel.findByIdAndUpdate(updatedOrder.userId, { cart: [] });
          console.log(`🧹 Đã dọn sạch giỏ hàng sau Verify: ${updatedOrder.userId}`);
      }

      res.json({ success: true, message: "Paid" });
    } else {
      // Nếu thất bại -> Xóa đơn nháp
      await orderModel.findOneAndDelete(query);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log("Lỗi Verify:", error);
    res.json({ success: false, message: "Error" });
  }
};
// ... (Giữ nguyên các hàm generateOrderId, getOrderDetail, getUserOrders, getAllOrders, updateOrderStatus) ...
const generateOrderId = () => {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PH${yy}${mm}${dd}${random}`;
};
export const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findOne({ 
        $or: [ { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderId: orderId } ] 
    });
    if (!order) return res.json({ success: false, msg: "Không tìm thấy đơn hàng" });
    return res.json({ success: true, order });
  } catch (err) {
    return res.json({ success: false, msg: "Lỗi server", error: err.message });
  }
};
export const getUserOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) { res.json({ success: false, message: "Lỗi server!" }); }
};
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (err) { return res.json({ success: false, msg: "Lỗi server", error: err.message }); }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updated = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updated) return res.json({ success: false, msg: "Không tìm thấy đơn hàng" });
    return res.json({ success: true, msg: "Cập nhật thành công", order: updated });
  } catch (err) { return res.json({ success: false, msg: "Lỗi cập nhật", error: err.message }); }
};
// DASHBOARD STATS (ĐÃ CẬP NHẬT FILTER NGÀY)
// ---------------------------
export const getDashboardStats = async (req, res) => {
  try {
    const { date } = req.query; 

    // Filter Query
    let matchQuery = { status: { $ne: "canceled" } }; 
    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        matchQuery.createdAt = { $gte: start, $lte: end };
    }

    // Data theo filter
    const filteredOrders = await orderModel.find(matchQuery);
    const orderCount = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((acc, order) => acc + order.amount, 0);

    // Data tĩnh
    const foodCount = await foodModel.countDocuments({});
    const userCount = await userModel.countDocuments({});

    // Graph Data (Luôn lấy 7 ngày gần nhất)
    const allOrders = await orderModel.find({ status: { $ne: "canceled" } });
    const salesData = {}; 
    allOrders.forEach(order => {
        const d = new Date(order.createdAt).toLocaleDateString('en-CA'); 
        if (salesData[d]) salesData[d] += order.amount;
        else salesData[d] = order.amount;
    });
    const graphData = Object.keys(salesData).sort().slice(-7).map(date => ({ name: date, sales: salesData[date] }));

    // Payment Stats (Theo filter)
    const paymentCounts = filteredOrders.reduce((acc, order) => {
        const method = order.paymentMethod.toUpperCase();
        acc[method] = (acc[method] || 0) + 1;
        return acc;
    }, {});
    
    const paymentStats = Object.keys(paymentCounts).map(key => ({ name: key, value: paymentCounts[key] }));

    res.json({
      success: true,
      data: { foodCount, userCount, orderCount, totalRevenue, graphData, paymentStats }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi lấy thống kê" });
  }
};

export const trackOrder = async (req, res) => {
    const { keyword } = req.body; 

    if (!keyword) {
        return res.json({ success: false, message: "Vui lòng nhập mã đơn hàng!" });
    }

    try {
        // Logic tìm kiếm:
        // 1. Tìm theo orderId (Mã đơn tự tạo PH...)
        // 2. Hoặc tìm theo _id (MongoID)
        const query = {
            $or: [
                { orderId: keyword },
                { _id: keyword.match(/^[0-9a-fA-F]{24}$/) ? keyword : null } 
            ]
        };

        const orders = await orderModel.find(query);

        if (!orders || orders.length === 0) {
            return res.json({ success: false, message: "Không tìm thấy đơn hàng này." });
        }

        res.json({ success: true, orders }); 
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Lỗi server" });
    }
}