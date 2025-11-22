import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// 🔒 Chỉ admin đã đăng nhập mới truy cập được
router.get("/check", adminAuth, (req, res) => {
  res.json({ success: true, message: "Admin hợp lệ", admin: req.admin });
});

export default router;
