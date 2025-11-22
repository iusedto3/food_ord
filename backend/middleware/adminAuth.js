import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  try {
    // 🔹 Kiểm tra có header Authorization không
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Yêu cầu xác thực! Thiếu hoặc sai định dạng token.",
      });
    }

    // 🔹 Lấy token thật sự
    const token = authHeader.split(" ")[1];

    // 🔹 Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Lưu thông tin admin vào request
    req.admin = decoded;

    // 🔹 Cho phép đi tiếp
    next();
  } catch (err) {
    console.error("Lỗi xác thực admin:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        message: "Token đã hết hạn! Vui lòng đăng nhập lại.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Token không hợp lệ!",
    });
  }
};

export default adminAuth;
