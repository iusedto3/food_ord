import mongoose from "mongoose";

// Schema cho từng món ăn trong đơn hàng
const orderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
  name: String,
  image: { type: String, default: "" },
  size: { type: String, default: "Mặc định" },
  toppings: [{ label: String, price: Number }],
  note: { type: String, default: "" },
  quantity: { type: Number, default: 1 },
  basePrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

// Schema đơn hàng chính
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // Mã đơn tự sinh (VD: PH2411...)
  userId: { type: String, default: null }, // ID khách hàng (nếu đã đăng nhập)
  
  items: { type: [orderItemSchema], required: true },
  
  // --- THÔNG TIN TIỀN ---
  amount: { type: Number, required: true }, // Tổng tiền hàng
  shippingFee: { type: Number, default: 15000 },
  discountAmount: { type: Number, default: 0 }, // Số tiền giảm
  voucherCode: { type: String, default: "" },   // Mã voucher đã dùng (nếu có)

  // --- THÔNG TIN GIAO HÀNG ---
  address: { type: Object, required: true },
  customer: { type: Object, required: true },

  // --- THANH TOÁN (UPDATED) ---
  paymentMethod: {
    type: String,
    enum: ["cod", "momo", "stripe", "zalopay", "card"], // 👇 Thêm các cổng mới
    required: true,
  },
  
  paymentStatus: {
    type: String, 
    enum: ["pending", "paid", "failed", "refunded"], // 👇 Quản lý trạng thái thanh toán chi tiết
    default: "pending", 
  },

  transactionId: { type: String, default: "" }, // 👇 Lưu mã giao dịch từ Momo/Stripe/Zalo

  // --- TRẠNG THÁI ĐƠN HÀNG ---
  status: {
    type: String,
    enum: ["preparing", "delivering", "completed", "canceled"], // Đồng bộ với Admin Panel
    default: "preparing",
  },

  date: { type: Date, default: Date.now } // Ngày đặt hàng
}, { 
  timestamps: true, // Tự động tạo createdAt và updatedAt
  minimize: false 
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;