import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js"; // Đã thêm
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken"; 
// 👇 Import Service Thanh toán (Nếu bạn đã tạo file service, nếu chưa thì comment lại dòng này)
import { processPayment } from "../Services/payment/paymentService.js";

// ---------------------------
// PLACE ORDER
// ---------------------------
export const placeOrder = async (req, res) => {
  // Lấy dữ liệu từ req.body
  let { userId, address, customer, amount, paymentMethod, items, voucher } = req.body;
  let cartItems = [];

  try {
    // ---------------------------
    // 0. THÔNG MINH: Tự lấy userId từ Token nếu Frontend gửi thiếu
    // ---------------------------
    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id; 
        }
      } catch (e) {
        // Token lỗi hoặc hết hạn -> coi như Guest
      }
    }

    // ---------------------------
    // 1. Phân biệt USER và GUEST để lấy cartItems
    // ---------------------------
    if (userId) {
      const user = await userModel.findById(userId);
      if (!user) return res.json({ success: false, msg: "User không tồn tại" });
      
      // Ưu tiên lấy từ DB, nếu DB rỗng thì lấy từ req.body (fallback)
      cartItems = (user.cartData && user.cartData.length > 0) ? user.cartData : (items || []);
    } else {
      cartItems = items;
    }

    if (!cartItems || cartItems.length === 0) {
      return res.json({ success: false, msg: "Giỏ hàng trống" });
    }

    // Xử lý Voucher
    let discountAmount = 0;
    let voucherCode = "";
    if (voucher) {
        discountAmount = Number(voucher.discount) || 0;
        voucherCode = voucher.code || "";
    }

    // Validation
    if (!address || !customer || !amount || !paymentMethod) {
      return res.json({ success: false, msg: "Thiếu dữ liệu order" });
    }

    // ---------------------------
    // 2. CHUẨN HÓA ITEMS & TÍNH TOÁN
    // ---------------------------
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

    // ---------------------------
    // 3. TẠO ORDER (TRẠNG THÁI PENDING)
    // ---------------------------
    const newOrder = new orderModel({
      orderId: generateOrderId(),
      userId: userId || undefined,
      items: itemsWithTotalPrice,  
      amount,
      discountAmount,
      voucherCode,
      shippingFee: 15000,
      address,
      customer,
      paymentMethod,
      paymentStatus: "pending", 
      status: "preparing",
      date: Date.now()
    });

    await newOrder.save();

    // ---------------------------
    // 4. XỬ LÝ THANH TOÁN ONLINE (MỚI)
    // ---------------------------
    if (paymentMethod !== 'cod') {
        try {
            console.log(`🔄 Đang tạo link thanh toán ${paymentMethod}...`); // Log 1

            // Gọi Service
            const paymentUrl = await processPayment(paymentMethod, newOrder._id, amount);
            
            console.log("✅ Link thanh toán:", paymentUrl); // Log 2

            if (paymentUrl) {
                // Nếu có link thì trả về luôn
                return res.json({ 
                    success: true, 
                    message: "Redirect to Payment", 
                    orderId: newOrder._id,
                    paymentUrl 
                });
            } else {
                // Nếu không tạo được link (ví dụ lỗi Stripe), throw lỗi để xuống catch
                throw new Error("Không tạo được paymentUrl (kết quả null)");
            }
        } catch (err) {
            // 👇 IN LỖI RA TERMINAL ĐỂ DEBUG
            console.error("❌ LỖI THANH TOÁN ONLINE:", err);
            
            // Xóa đơn hàng lỗi để tránh rác DB
            await orderModel.findByIdAndDelete(newOrder._id);
            
            return res.json({ 
                success: false, 
                message: "Lỗi tạo cổng thanh toán: " + err.message 
            });
        }
    }
    // ---------------------------
    // 5. XỬ LÝ COD (MẶC ĐỊNH)
    // ---------------------------
    try { await sendEmail(newOrder); } catch (err) {}

    // Clear giỏ hàng
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
    return res.status(500).json({ success: false, msg: "Lỗi server", error: err.message });
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

// ---------------------------
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

export const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "paid" }); // Cập nhật đã thanh toán
            res.json({ success: true, message: "Paid" });
        } else {
            await orderModel.findByIdAndDelete(orderId); // Nếu lỗi thì xóa đơn nháp đi
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}