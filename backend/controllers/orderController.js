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
  try {
    const { userId, address, customer, shippingFee, paymentMethod, items, voucher } = req.body;

    console.log("👉 [DEBUG] Bắt đầu placeOrder");
    console.log("👉 [DEBUG] Body userId:", userId);
    console.log("👉 [DEBUG] Req userId:", req.userId);
    console.log("👉 [DEBUG] Auth Header:", req.headers.authorization)
    
    // 1. Xác định User & Giỏ hàng (Logic cũ)
    let currentUserId = req.userId || userId;
    // ... (Đoạn fallback decode token giữ nguyên) ...
    // ... (Đoạn lấy finalCartItems giữ nguyên) ...
    
    // Đoạn check giỏ hàng trống giữ nguyên
    let finalCartItems = items || [];
    if (currentUserId) { 
        const user = await userModel.findById(currentUserId);
        if (user && user.cartData && user.cartData.length > 0) finalCartItems = user.cartData;
    }
    if (!finalCartItems || finalCartItems.length === 0) return res.json({ success: false, msg: "Giỏ hàng trống" });

    // -------------------------------------------------------------
    // 🔥 TÍNH TOÁN GIÁ TIỀN (BAO GỒM CẢ CRUST/ĐẾ BÁNH)
    // -------------------------------------------------------------
    let totalAmount = 0;
    const orderItems = [];

    // Helper map size
    const sizeMap = { "Nhỏ": "S", "Vừa": "M", "Lớn": "L" };

    for (const item of finalCartItems) {
        const foodId = item.itemId || item._id; 
        const foodInfo = await foodModel.findById(foodId);

        if (foodInfo) {
            // 1. Xác định Size Key (S, M, L)
            const itemSizeName = item.size || "Vừa"; 
            const sizeKey = sizeMap[itemSizeName] || "M";

            // 2. Tính Giá Cơ Bản (Theo Size)
            let basePrice = foodInfo.price; // Mặc định giá gốc
            if (foodInfo.sizes && foodInfo.sizes[sizeKey] > 0) {
                basePrice = foodInfo.sizes[sizeKey];
            }

            // 3. Tính Giá Toppings
            let toppingPrice = 0;
            if (item.toppings && Array.isArray(item.toppings)) {
                toppingPrice = item.toppings.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
            }

            // 4. 🔥 TÍNH GIÁ ĐẾ BÁNH (CRUST) - MỚI THÊM 🔥
            let crustPrice = 0;
            // Kiểm tra món này có bật tính năng chọn đế không
            if (foodInfo.crust && foodInfo.crust.enabled && item.crust) {
                // Frontend có thể gửi crust là String "Dày" hoặc Object { label: "Dày" }
                const labelToCheck = item.crust.label || item.crust; 
                
                // Tìm đế bánh tương ứng trong Menu
                const foundCrust = foodInfo.crust.list.find(c => c.label === labelToCheck);
                
                if (foundCrust && foundCrust.prices) {
                    // Lấy giá đế bánh theo Size hiện tại (Ví dụ: Đế dày size L giá khác size M)
                    crustPrice = foundCrust.prices[sizeKey] || 0;
                }
            }

            // 5. Tổng tiền 1 món
            const singleItemTotal = basePrice + toppingPrice + crustPrice;
            const itemTotalAmount = singleItemTotal * item.quantity;
            
            totalAmount += itemTotalAmount;

            // Debug log để bạn kiểm tra
            console.log(`Món: ${foodInfo.name} | Size: ${basePrice} | Topping: ${toppingPrice} | Đế: ${crustPrice} -> Tổng: ${singleItemTotal}`);

            orderItems.push({
                itemId: foodInfo._id,
                name: foodInfo.name,
                image: foodInfo.image,
                size: itemSizeName,
                toppings: item.toppings || [],
                // Lưu thông tin đế bánh
                crust: item.crust ? (item.crust.label || item.crust) : "", 
                note: item.note || "",
                quantity: item.quantity,
                basePrice: singleItemTotal, 
                totalPrice: itemTotalAmount 
            });
        }
    }

    // ... (Phần còn lại: Ship, Voucher, Tạo đơn hàng... giữ nguyên như file trước) ...
    // Copy đoạn dưới từ file trước dán vào đây (từ dòng "const finalShippingFee = ..." trở đi)
    
    // --- ĐOẠN SAU NÀY GIỮ NGUYÊN ---
    const finalShippingFee = Number(shippingFee) || 20000;
    let discountAmount = 0;
    let voucherCode = "";
    if (voucher && voucher.discount) {
        discountAmount = Number(voucher.discount);
        voucherCode = voucher.code;
    }
    const amountToPay = Math.max(0, totalAmount + finalShippingFee - discountAmount);

    const newOrder = new orderModel({
      orderId: generateOrderId(),
      userId: currentUserId || undefined,
      items: orderItems,           
      amount: totalAmount,         
      shippingFee: finalShippingFee,
      discountAmount: discountAmount,
      voucherCode: voucherCode,
      address,
      customer,
      paymentMethod,
      paymentStatus: "pending", 
      status: "preparing",
      date: Date.now()
    });

    await newOrder.save();
    console.log("👉 [DEBUG] Chuẩn bị xóa giỏ hàng cho ID:", currentUserId);

    if (req.io) {
        req.io.emit("new_order", {
            message: "Có đơn hàng mới!",
            orderId: newOrder.orderId,
            amount: amountToPay
        });
    }

    if (currentUserId) {
        // Tìm user trước
        const user = await userModel.findById(currentUserId);
        if (user) {
            user.cartData = [];  // Gán trực tiếp về rỗng
            user.markModified('cartData'); // 🔥 BẮT BUỘC: Báo cho Mongoose biết trường này đã đổi
            await user.save();   // Lưu lại
            console.log("✅ Đã xóa sạch cartData cho User ID:", currentUserId);
        }
    }

    if (paymentMethod !== 'cod') {
       const paymentUrl = await processPayment(paymentMethod, newOrder._id, amountToPay);
       if (paymentUrl) return res.json({ success: true, orderId: newOrder._id, paymentUrl });
    } 
    
    try { await sendEmail(newOrder); } catch (err) {}

    return res.json({ success: true, msg: "Đặt hàng thành công", orderId: newOrder._id });

  } catch (err) {
    console.log("❌ Lỗi đặt hàng:", err);
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
    
    // Tìm đơn hàng để lấy userId trước khi update (để biết gửi cho ai)
    const orderToUpdate = await orderModel.findById(orderId); 
    if (!orderToUpdate) return res.json({ success: false, msg: "Không tìm thấy đơn" });

    const updated = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    
    // 🔥 SOCKET: Báo riêng cho User đó
    // Gửi vào room có tên là userId của khách
    if (orderToUpdate.userId) {
        req.io.to(orderToUpdate.userId.toString()).emit("order_status_updated", {
            orderId: orderToUpdate.orderId,
            status: status,
            message: `Đơn hàng #${orderToUpdate.orderId} đã chuyển sang: ${status}`
        });
    }

    // Nếu muốn Admin bên khác cũng thấy cập nhật ngay lập tức (Realtime sync giữa các admin)
    req.io.emit("admin_update_order", { orderId, status });

    return res.json({ success: true, msg: "Cập nhật thành công", order: updated });
  } catch (err) { 
    return res.json({ success: false, msg: "Lỗi cập nhật", error: err.message }); 
  }
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

    // 1. Kiểm tra điều kiện thành công (Stripe, MoMo, ZaloPay)
    if (success === "true" || 
       (resultCode && resultCode.toString() === "0") || 
       (status && status.toString() === "1")) {
        isSuccess = true;
    }

    if (isSuccess) {
      // 2. Cập nhật DB: Payment Status = paid
      const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { 
          paymentStatus: "paid",
          payment: true 
      }, { new: true });

      if (updatedOrder) {
          // 3. Gửi Email (nếu lỗi cũng không chặn luồng chính)
          try { 
             await sendEmail(updatedOrder);
             console.log("📧 Email xác nhận đã được gửi.");
          } catch (e) {
             console.error("❌ Lỗi gửi email:", e.message);
          }

          // 4. Xóa giỏ hàng của user (Logic an toàn)
          if (updatedOrder.userId) {
              const user = await userModel.findById(updatedOrder.userId);
              if (user) {
                  user.cartData = [];
                  user.markModified('cartData'); // 🔥 Quan trọng
                  await user.save();
                  console.log("🛒 (Verify) Đã xóa sạch giỏ hàng cho user:", updatedOrder.userId);
              }
          }

          // 🔥 SOCKET.IO: BẮN TÍN HIỆU THANH TOÁN THÀNH CÔNG 🔥
          
          // a. Báo cho Admin (Cập nhật bảng admin ngay lập tức)
          if (req.io) {
            req.io.emit("payment_updated", {
              orderId: updatedOrder._id, 
              paymentStatus: "paid",
              payment: true
            });
            
            // b. Báo cho Khách hàng (Cập nhật màn hình My Orders)
            if (updatedOrder.userId) {
              req.io.to(updatedOrder.userId.toString()).emit("payment_updated", {
                  orderId: updatedOrder._id,
                  paymentStatus: "paid",
                  payment: true
              });
            }
          }
      }

      return res.json({ success: true, message: "Thanh toán thành công" });

    } else {
      // 5. Nếu thất bại -> Xóa đơn hàng
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Thanh toán thất bại hoặc bị hủy" });
    }

  } catch (error) {
    console.error("Verify Error:", error);
    return res.json({ success: false, message: "Lỗi xác thực hệ thống" });
  }
};