// models/promotionModel.js
import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, sparse: true, trim: true },
    type: {
      type: String,
      enum: ["percentage", "fixed", "coupon"],
      required: true,
    },
    value: { type: Number, required: true }, // percentage (0-100) or fixed amount
    minOrderAmount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String, default: "" },
    usageLimit: { type: Number, default: 0 }, // optional: 0 = unlimited
    usedCount: { type: Number, default: 0 }, // optional tracking
  },
  { timestamps: true }
);

const Promotion = mongoose.models.promotion || mongoose.model("promotion", promotionSchema);
export default Promotion;
