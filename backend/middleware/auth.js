import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.json({ success: false, message: "⚠️ Không có token, từ chối truy cập" });
  }

  const token = authHeader.split(" ")[1]; // Lấy phần sau 'Bearer '
  if (!token) {
    return res.json({ success: false, message: "⚠️ Token không hợp lệ" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!req.body) {
      req.body = {};
    }
    req.body.userId = decoded.id;
    next();
  } catch (err) {
    console.log("❌ Lỗi verify token:", err.message);
    res.json({ success: false, message: "Token không hợp lệ hoặc hết hạn" });
  }
};

export default authMiddleware;