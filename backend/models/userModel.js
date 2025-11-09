import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
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

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: [cartItemSchema], default: [] },
    address: {
      street: { type: String, default: "" },
      ward: { type: String, default: "" },
      district: { type: String, default: "" },
      city: { type: String, default: "" },
    },
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
