import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
  code: { 
      type: String, 
      uppercase: true, 
      trim: true, 
      unique: true, 
      sparse: true // 👈 QUAN TRỌNG: Cho phép nhiều khuyến mãi không có mã
  },
  type: { 
    type: String, 
    required: true, 
    enum: ["percentage", "fixed", "coupon"] 
  },
  value: { type: Number, required: true }, 
  description: { type: String },
  minOrderAmount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Promotion = mongoose.models.promotion || mongoose.model("promotion", promotionSchema);

export default Promotion;