import express from "express";
import {
  addFood,
  listFood,
  removeFood,
  listCategories,
  getFoodByCategory
} from "../controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Các route hiện có
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.get("/categories", listCategories);

// Route mới: lấy danh sách món theo danh mục
foodRouter.get("/category/:name", getFoodByCategory);

export default foodRouter;
