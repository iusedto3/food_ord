// controllers/adminController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";

// 🧩 Đăng ký admin đầu tiên
export const registerAdmin = async (req, res) => {
  try {
    const { username, password, name } = req.body;

    // Kiểm tra đã có admin trong DB chưa
    const adminCount = await adminModel.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: "Đã tồn tại admin. Không thể đăng ký thêm!",
      });
    }

    // Kiểm tra trùng username
    const existing = await adminModel.findOne({ username });
    if (existing) {
      return res.json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
    }

    // Hash mật khẩu
    const hashed = await bcrypt.hash(password, 10);

    // Tạo mới admin
    const newAdmin = new adminModel({ username, name, password: hashed });
    await newAdmin.save();

    res.json({ success: true, message: "Tạo admin đầu tiên thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

// 🔐 Đăng nhập admin
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await adminModel.findOne({ username });
    if (!admin)
      return res.json({ success: false, message: "Tài khoản không tồn tại!" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid)
      return res.json({ success: false, message: "Sai mật khẩu!" });

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin._id, name: admin.name, username: admin.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};
