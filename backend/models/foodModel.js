import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true }, // Giá gốc (Size M)
    category: { type: String, default: "other" },
    image: { type: String, default: "" },

    // 🔴 SỬA ĐOẠN NÀY (QUAN TRỌNG)
    // Cũ: sizes: [String]  <-- XÓA DÒNG NÀY
    // Mới: sizes là Object chứa giá tiền
    sizes: {
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 }
    },

    // Toppings
    options: [
      {
        label: String,
        price: Number,
      },
    ],

    // 🔴 SỬA CẢ ĐOẠN NÀY (Đế bánh)
    crust: {
      enabled: { type: Boolean, default: false },
      list: [
        {
          label: { type: String, required: true },
          // Giá riêng cho từng size
          prices: { 
              S: { type: Number, default: 0 },
              M: { type: Number, default: 0 },
              L: { type: Number, default: 0 }
          }
        },
      ],
    },

    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;