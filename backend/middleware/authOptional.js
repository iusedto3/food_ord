import jwt from 'jsonwebtoken';

const authOptional = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Nếu có gửi kèm Token -> Cố gắng giải mã
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id; // ✅ Gắn ID nếu là User thật
    } catch (err) {
      // Nếu Token lỗi hoặc hết hạn, ta cứ lờ đi và coi như khách vãng lai
      console.log("Token optional check failed:", err.message);
      req.userId = null;
    }
  } else {
    // 2. Không có Token -> Là khách vãng lai (Guest)
    req.userId = null;
  }

  // 3. Quan trọng nhất: LUÔN LUÔN CHO QUA (không return lỗi)
  next();
};

export default authOptional;