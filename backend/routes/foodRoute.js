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

/* ------------------ MULTER UPLOAD CONFIG ------------------ */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ------------------ ROUTES ------------------ */

// Thêm món
foodRouter.post("/add", upload.single("image"), addFood);

// Cập nhật món
foodRouter.put("/update/:id", upload.single("image"), updateFood);

// Lấy toàn bộ món
foodRouter.get("/list", listFood);

// Xóa món
foodRouter.delete("/:id", removeFood);

// Lấy danh mục
foodRouter.get("/categories", listCategories);

// Lấy món theo danh mục
foodRouter.get("/category/:name", getFoodByCategory);

// Lấy món theo ID
foodRouter.get("/detail/:id", getFoodById);

export default foodRouter;
