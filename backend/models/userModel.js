import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
  name: String,
  image: { type: String, default: "" },
  size: { type: String, default: "Mặc định" },
  toppings: [{ label: String, price: Number }],
  crust: { type: mongoose.Schema.Types.Mixed, default: null },
  note: { type: String, default: "" },
  quantity: { type: Number, default: 1 },
  basePrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
}); 

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    
    // 🟢 SỬA LẠI THÀNH ARRAY TỰ DO (Object)
    // Cách này giúp Mongoose lưu y nguyên những gì cartController gửi vào
    cartData: { type: Array, default: [] }, 
    
    addressList: [
      {
        id: { type: String },
        label: { type: String },
        street: { type: String },
        ward: { type: String },
        district: { type: String },
        city: { type: String },
        isDefault: { type: Boolean, default: false }
      }, 
    ],
    isVerified: {
      type: Boolean,
      default: false
    },
    // Trường cũ (nếu không dùng thì sau này xóa)
    cart: { type: Array, default: [] }
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;