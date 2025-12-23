import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js"; // Đã import thêm model món ăn
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
// 👇 Import Service Thanh toán (Giữ nguyên của bạn)
import { processPayment } from "../Services/payment/paymentService.js";

// =========================================================================
// 1. PLACE ORDER (ĐÃ ĐƯỢC NÂNG CẤP ĐỂ SỬA LỖI ĐỊA CHỈ VÀ CRUST)
// =========================================================================
export const placeOrder = async (req, res) => {
  try {
    // 1. Nhận dữ liệu thô từ Frontend
    let { userId, address, customer, shippingFee, paymentMethod, items, voucher } = req.body;

    console.log("👉 [DEBUG] Bắt đầu placeOrder");

    // 2. Xác định User
    let currentUserId = req.userId || userId;
    
    // 3. Xác định Giỏ hàng (Ưu tiên items gửi lên, nếu không có thì lấy trong DB)
    let finalCartItems = items || [];
    if (currentUserId && (!finalCartItems || finalCartItems.length === 0)) { 
        const user = await userModel.findById(currentUserId);
        if (user && user.cartData) finalCartItems = user.cartData;
    }

    if (!finalCartItems || finalCartItems.length === 0) {
        return res.json({ success: false, msg: "Giỏ hàng trống" });
    }

    // ------------------------------------------------------------------
    // 🟢 FIX 1: TỰ ĐỘNG LẤY ĐỊA CHỈ TỪ DB NẾU CHỈ CÓ ID (Khắc phục lỗi thiếu Quận/Huyện)
    // ------------------------------------------------------------------
    let finalAddress = { ...address }; // Copy ra biến mới để xử lý

    if (currentUserId && address && address.selectedId) {
        const user = await userModel.findById(currentUserId);
        // Tìm trong addressList của user
        const savedAddr = user?.addressList?.find(
            a => a.id === address.selectedId || (a._id && a._id.toString() === address.selectedId)
        );

        if (savedAddr) {
            console.log("✅ Đã tìm thấy địa chỉ đầy đủ trong DB:", savedAddr.street);
            finalAddress = {
                street: savedAddr.street,
                ward: savedAddr.ward,       // Lấy lại tên Phường
                district: savedAddr.district, // Lấy lại tên Quận
                city: savedAddr.city,       // Lấy lại tên TP
                // Giữ lại tên/sdt người nhận từ form nhập (nếu user muốn đổi người nhận)
                details: savedAddr.street, 
            };
        }
    }

    // ------------------------------------------------------------------
    // 🟢 FIX 2: TÍNH TOÁN GIÁ & SỬA LỖI OBJECT CRUST (Khắc phục lỗi Cast Error)
    // ------------------------------------------------------------------
    let totalAmount = 0;
    const orderItems = [];
    const sizeMap = { "Nhỏ": "S", "Vừa": "M", "Lớn": "L" };

    for (const item of finalCartItems) {
        const foodId = item.itemId || item._id; 
        const foodInfo = await foodModel.findById(foodId);

        if (foodInfo) {
            const itemSizeName = item.size || "Vừa"; 
            const sizeKey = sizeMap[itemSizeName] || "M";

            // Tính giá cơ bản
            let basePrice = foodInfo.price;
            if (foodInfo.sizes && foodInfo.sizes[sizeKey] > 0) {
                basePrice = foodInfo.sizes[sizeKey];
            }

            // Tính giá Topping
            let toppingPrice = 0;
            if (item.toppings && Array.isArray(item.toppings)) {
                toppingPrice = item.toppings.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
            }

            // Tính giá Đế (Crust) & Sửa lỗi Object
            let crustPrice = 0;
            let finalCrustString = ""; // Biến để lưu vào DB (String)

            if (item.crust) {
                // Nếu là String (ví dụ: "Đế dày") -> OK
                if (typeof item.crust === 'string') {
                    finalCrustString = item.crust;
                } 
                // Nếu là Object (ví dụ: { label: "Đế dày", price: 0 }) -> Lấy label ra
                else if (typeof item.crust === 'object' && item.crust.label) {
                    finalCrustString = item.crust.label;
                }
                
                // Tính tiền đế (nếu config server có bật)
                if (foodInfo.crust && foodInfo.crust.enabled) {
                    const foundCrust = foodInfo.crust.list.find(c => c.label === finalCrustString);
                    if (foundCrust && foundCrust.prices) {
                        crustPrice = foundCrust.prices[sizeKey] || 0;
                    }
                }
            }

            const singleItemTotal = basePrice + toppingPrice + crustPrice;
            const itemTotalAmount = singleItemTotal * item.quantity;
            totalAmount += itemTotalAmount;

            orderItems.push({
                itemId: foodInfo._id,
                name: foodInfo.name,
                image: foodInfo.image,
                size: itemSizeName,
                toppings: item.toppings || [],
                // 👇 QUAN TRỌNG: Luôn lưu chuỗi, không lưu object gây lỗi
                crust: finalCrustString, 
                note: item.note || "",
                quantity: item.quantity,
                basePrice: singleItemTotal, 
                totalPrice: itemTotalAmount 
            });
        }
    }

    // 4. Tính toán phí ship/voucher (Logic cũ giữ nguyên)
    const finalShippingFee = Number(shippingFee) || 20000;
    let discountAmount = 0;
    let voucherCode = "";
    if (voucher && voucher.discount) {
        discountAmount = Number(voucher.discount);
        voucherCode = voucher.code;
    }
    const amountToPay = Math.max(0, totalAmount + finalShippingFee - discountAmount);

    // 5. Tạo đơn hàng mới
    const newOrder = new orderModel({
      orderId: generateOrderId(),
      userId: currentUserId || undefined,
      items: orderItems,           // Items đã được làm sạch
      amount: totalAmount,         
      shippingFee: finalShippingFee,
      discountAmount: discountAmount,
      voucherCode: voucherCode,
      address: finalAddress,       // Address đã được điền đủ thông tin
      customer: customer,   
      paymentMethod,
      paymentStatus: "pending", 
      status: "preparing",
      date: Date.now()
    });

    await newOrder.save();

    // 6. Xử lý Socket & Xóa giỏ hàng (Logic cũ giữ nguyên)
    if (req.io) {
        req.io.emit("new_order", {
            message: "Có đơn hàng mới!",
            orderId: newOrder.orderId,
            amount: amountToPay
        });
    }

    if (currentUserId) {
        const user = await userModel.findById(currentUserId);
        if (user) {
            user.cartData = [];
            user.markModified('cartData');
            await user.save();
        }
    }

    // 7. Xử lý thanh toán Online
    if (paymentMethod !== 'cod') {
       const paymentUrl = await processPayment(paymentMethod, newOrder._id, amountToPay);
       if (paymentUrl) return res.json({ success: true, orderId: newOrder._id, paymentUrl });
    } 
    
    // 8. Gửi email
    try { await sendEmail(newOrder); } catch (err) {}

    return res.json({ success: true, msg: "Đặt hàng thành công", orderId: newOrder._id });

  } catch (err) {
    console.log("❌ Lỗi đặt hàng:", err);
    return res.status(500).json({ success: false, msg: "Lỗi server", error: err.message });
  }
};

// =========================================================================
// CÁC HÀM BÊN DƯỚI ĐƯỢC GIỮ NGUYÊN (KHÔNG THAY ĐỔI GÌ)
// =========================================================================

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
    
    const orderToUpdate = await orderModel.findById(orderId); 
    if (!orderToUpdate) return res.json({ success: false, msg: "Không tìm thấy đơn" });

    const updated = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    
    if (orderToUpdate.userId) {
        req.io.to(orderToUpdate.userId.toString()).emit("order_status_updated", {
            orderId: orderToUpdate.orderId,
            status: status,
            message: `Đơn hàng #${orderToUpdate.orderId} đã chuyển sang: ${status}`
        });
    }

    req.io.emit("admin_update_order", { orderId, status });

    return res.json({ success: true, msg: "Cập nhật thành công", order: updated });
  } catch (err) { 
    return res.json({ success: false, msg: "Lỗi cập nhật", error: err.message }); 
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const { date } = req.query; 

    let matchQuery = { status: { $ne: "canceled" } }; 
    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        matchQuery.createdAt = { $gte: start, $lte: end };
    }

    const filteredOrders = await orderModel.find(matchQuery);
    const orderCount = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((acc, order) => acc + order.amount, 0);

    const foodCount = await foodModel.countDocuments({});
    const userCount = await userModel.countDocuments({});

    const allOrders = await orderModel.find({ status: { $ne: "canceled" } });
    const salesData = {}; 
    allOrders.forEach(order => {
        const d = new Date(order.createdAt).toLocaleDateString('en-CA'); 
        if (salesData[d]) salesData[d] += order.amount;
        else salesData[d] = order.amount;
    });
    const graphData = Object.keys(salesData).sort().slice(-7).map(date => ({ name: date, sales: salesData[date] }));

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

    if (success === "true" || 
       (resultCode && resultCode.toString() === "0") || 
       (status && status.toString() === "1")) {
        isSuccess = true;
    }

    if (isSuccess) {
      const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { 
          paymentStatus: "paid",
          payment: true 
      }, { new: true });

      if (updatedOrder) {
          try { 
             await sendEmail(updatedOrder);
             console.log("📧 Email xác nhận đã được gửi.");
          } catch (e) {
             console.error("❌ Lỗi gửi email:", e.message);
          }

          if (updatedOrder.userId) {
              const user = await userModel.findById(updatedOrder.userId);
              if (user) {
                  user.cartData = [];
                  user.markModified('cartData'); 
                  await user.save();
                  console.log("🛒 (Verify) Đã xóa sạch giỏ hàng cho user:", updatedOrder.userId);
              }
          }

          if (req.io) {
            req.io.emit("payment_updated", {
              orderId: updatedOrder._id, 
              paymentStatus: "paid",
              payment: true
            });
            
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
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Thanh toán thất bại hoặc bị hủy" });
    }

  } catch (error) {
    console.error("Verify Error:", error);
    return res.json({ success: false, message: "Lỗi xác thực hệ thống" });
  }
};