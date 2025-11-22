import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: String, default: "other" }, // pizza, drink, etc.

    // Image
    image: { type: String, default: "" },

    // Sizes dành cho món có size
    sizes: [String],

    // Toppings / Options
    options: [
      {
        label: String,
        price: Number,
      },
    ],

    // NEW: Crust dành riêng cho Pizza
    crust: {
      enabled: { type: Boolean, default: false }, // true nếu sản phẩm có crust
      list: [
        {
          label: String,
          price: Number,
        },
      ],
    },

    // trạng thái bán
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const foodModel =
  mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;
