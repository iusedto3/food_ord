// backend/routes/foodRoute.js
import express from "express";
import multer from "multer";
import {
  addFood,
  listFood,
  removeFood,
  updateFood,
  listCategories,
  getFoodByCategory,
  getFoodById
} from "../controllers/foodController.js";

const foodRouter = express.Router();

/* ------------------ MULTER CONFIG ------------------ */
const storage = multer.diskStorage({
  destination: "uploads", // Đảm bảo thư mục 'uploads' tồn tại ở root
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

/* ------------------ ROUTES ------------------ */

// Thêm món (có ảnh)
foodRouter.post("/add", upload.single("image"), addFood);

// Cập nhật món (có ảnh)
foodRouter.put("/update/:id", upload.single("image"), updateFood);

// Các route Get/Delete
foodRouter.get("/list", listFood);
foodRouter.delete("/remove", removeFood); // ⚠️ Chú ý: Admin panel của bạn đang gọi /remove với body {id} hay là delete /:id?
// Nếu Admin panel gọi axios.post("/api/food/remove", { id: ... }) thì dùng:
foodRouter.post("/remove", removeFood); 
// Nếu gọi axios.delete(`/api/food/${id}`) thì dùng:
// foodRouter.delete("/:id", removeFood); 
// (Dựa vào controller của bạn dùng req.body.id hay req.params.id. Trong code controller ở trên mình đã sửa thành req.params.id để chuẩn RESTful, bạn nên dùng delete /:id)

foodRouter.delete("/:id", removeFood); // Khuyên dùng dòng này và sửa Admin Panel gọi API delete

foodRouter.get("/categories", listCategories);
foodRouter.get("/category/:name", getFoodByCategory);
foodRouter.get("/detail/:id", getFoodById);

export default foodRouter;