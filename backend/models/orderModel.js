import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

  orderId: { type: String, required: true, unique: true },
  userId: { type: String, default: null },

  items: { type: Array, required: true },

  amount: { type: Number, required: true },

  shippingFee: { type: Number, default: 15000 },

  address: { type: Object, required: true },

  customer: { type: Object, required: true },

  paymentMethod: {
    type: String,
    enum: ["cod", "momo", "card"],
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "unpaid", "paid"],
    default: "pending",
  },

  status: {
    type: String,
    enum: ["preparing", "shipping", "completed", "cancelled"],
    default: "preparing",
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("order", orderSchema);
