import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js"; // Đã thêm
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken"; 
// 👇 Import Service Thanh toán (Nếu bạn đã tạo file service, nếu chưa thì comment lại dòng này)
import { processPayment } from "../Services/payment/paymentService.js";

// ---------------------------
// 1. PLACE ORDER
// ---------------------------
export const placeOrder = async (req, res) => {
  // Không cần lấy finalTotal từ Frontend nữa
  let { userId, address, customer, amount, shippingFee, paymentMethod, items, voucher } = req.body;
  let cartItems = [];

  try {
    // 0. Lấy userId từ Token (Logic cũ)
    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id; 
        }
      } catch (e) {}
    }

    // 1. Lấy cartItems (Logic cũ)
    if (userId) {
      const user = await userModel.findById(userId);
      if (!user) return res.json({ success: false, msg: "User không tồn tại" });
      cartItems = (user.cartData && user.cartData.length > 0) ? user.cartData : (items || []);
    } else {
      cartItems = items;
    }

    if (!cartItems || cartItems.length === 0) {
      return res.json({ success: false, msg: "Giỏ hàng trống" });
    }

    // ---------------------------------------------------
    // 🟢 2. TÍNH TOÁN TIỀN (Server Side Calculation)
    // ---------------------------------------------------
    
    // A. Tạm tính (Lấy từ req.body hoặc tự tính lại từ cartItems để an toàn hơn)
    // Ở đây ta tạm tin tưởng amount từ frontend gửi lên để đơn giản hóa
    const subtotal = Number(amount);

    // B. Phí ship (Mặc định 20k nếu thiếu)
    const finalShippingFee = shippingFee !== undefined ? Number(shippingFee) : 20000;

    // C. Voucher
    let discountAmount = 0;
    let voucherCode = "";
    if (voucher) {
        // Nếu voucher hợp lệ thì tính tiền giảm
        // (Thực tế nên query DB kiểm tra voucher lần nữa, nhưng ở đây ta lấy tạm từ body)
        discountAmount = Number(voucher.discount) || 0;
        voucherCode = voucher.code || "";
    }

    // D. TỔNG THANH TOÁN CUỐI CÙNG (QUAN TRỌNG NHẤT)
    // Công thức: Tạm tính + Ship - Giảm giá
    const amountToPay = Math.max(0, subtotal + finalShippingFee - discountAmount);

    // 👉 LOG ĐỂ DEBUG (Xem trong Terminal)
    console.log("========= TÍNH TOÁN ĐƠN HÀNG =========");
    console.log(`💰 Tạm tính: ${subtotal}`);
    console.log(`🚚 Phí ship: ${finalShippingFee}`);
    console.log(`🎟  Giảm giá: -${discountAmount}`);
    console.log(`✅ THỰC THU (Gửi sang Zalo): ${amountToPay}`);
    console.log("======================================");

    // Validation cơ bản
    if (!address || !customer || !paymentMethod) {
      return res.json({ success: false, msg: "Thiếu thông tin giao hàng" });
    }

    // 3. Chuẩn hóa items (Logic cũ)
    const itemsWithTotalPrice = cartItems.map((item) => {
      const itemObj = (item.toObject && typeof item.toObject === 'function') ? item.toObject() : item;
      return {
        ...itemObj,
        itemId: itemObj.itemId || itemObj._id,       
        basePrice: itemObj.basePrice || itemObj.price || 0, 
        totalPrice: itemObj.totalPrice || 0,
      };
    });

    // 4. TẠO ORDER VÀO DB
    const newOrder = new orderModel({
      orderId: generateOrderId(),
      userId: userId || undefined,
      items: itemsWithTotalPrice,  
      amount: subtotal,            // Lưu Tạm tính
      discountAmount,    // Lưu Tiền giảm
      voucherCode,
      shippingFee: finalShippingFee, // Lưu Phí ship
      address,
      customer,
      paymentMethod,
      paymentStatus: "pending", 
      status: "preparing",
      date: Date.now()
    });

    await newOrder.save();

    // 5. XỬ LÝ THANH TOÁN ONLINE
    if (paymentMethod !== 'cod') {
        try {
            // Gửi đúng con số amountToPay đã tính ở trên
            const paymentUrl = await processPayment(paymentMethod, newOrder._id, amountToPay);
            
            if (paymentUrl) {
                return res.json({ 
                    success: true, 
                    message: "Redirect to Payment", 
                    orderId: newOrder._id,
                    paymentUrl 
                });
            } else {
                throw new Error("Không tạo được link thanh toán");
            }
        } catch (err) {
            console.error("❌ Lỗi thanh toán:", err);
            await orderModel.findByIdAndDelete(newOrder._id); // Xóa đơn lỗi
            return res.json({ success: false, message: "Lỗi cổng thanh toán: " + err.message });
        }
    }
    
    // 6. XỬ LÝ COD
    try { await sendEmail(newOrder); } catch (err) {}

    if (userId) {
      await userModel.findByIdAndUpdate(userId, { cartData: [] });
    }

    return res.json({
      success: true,
      msg: "Đặt hàng thành công",
      orderId: newOrder._id,
    });

  } catch (err) {
    console.log("❌ Lỗi server:", err);
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
  const { orderId, success, resultCode, status } = req.body;
  
  try {
    let isSuccess = false;

    // 1. Kiểm tra điều kiện thành công của từng cổng
    // - Stripe: success = "true"
    // - MoMo: resultCode = "0"
    // - ZaloPay: status = "1"
    if (success === "true" || 
       (resultCode && resultCode.toString() === "0") || 
       (status && status.toString() === "1")) {
        isSuccess = true;
    }

    if (isSuccess) {
      // 2. Cập nhật trạng thái đơn hàng thành "Đã thanh toán"
      const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { 
          paymentStatus: "paid",
          payment: true 
      }, { new: true });

      if (updatedOrder) {
          // 3. Gửi Email xác nhận (Bọc try-catch để lỗi mail không chặn luồng chính)
          try { 
             await sendEmail(updatedOrder);
             console.log("📧 Email xác nhận đã được gửi.");
          } catch (e) {
             console.error("❌ Lỗi gửi email:", e.message);
          }

          // 4. 🔴 QUAN TRỌNG: XÓA SẠCH GIỎ HÀNG 🔴
          // Chúng ta update cả 'cart' và 'cartData' về mảng rỗng []
          // để đảm bảo dù Model dùng tên gì thì cũng bị xóa sạch.
          if (updatedOrder.userId) {
              await userModel.findByIdAndUpdate(updatedOrder.userId, { 
                  cart: [],      // Xóa trường cũ (nếu có)
                  cartData: []   // Xóa trường mới (chuẩn)
              });
              console.log("🛒 Đã xóa sạch giỏ hàng (cart & cartData) của User:", updatedOrder.userId);
          }
      }

      return res.json({ success: true, message: "Thanh toán thành công" });

    } else {
      // 5. Nếu thất bại (User hủy hoặc lỗi cổng) -> Xóa đơn hàng nháp
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Thanh toán thất bại hoặc bị hủy" });
    }

  } catch (error) {
    console.error("Verify Error:", error);
    return res.json({ success: false, message: "Lỗi xác thực hệ thống" });
  }
};