import Promotion from "../models/promotionModel.js";

// --- GET ALL ---
export const getPromotions = async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    res.json({ success: true, data: promos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- GET ACTIVE ---
export const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const promos = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    res.json({ success: true, data: promos });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- CREATE ---
export const createPromotion = async (req, res) => {
  try {
    const { code, type, value, startDate, endDate } = req.body;

    if (!type || !value || !startDate || !endDate) {
        return res.json({ success: false, message: "Thiếu thông tin bắt buộc!" });
    }

    // --- SỬA ĐOẠN NÀY ---
    // Logic mới: Nếu không nhập code, tự động sinh code ngẫu nhiên (Ví dụ: AUTO_X7Z9)
    let finalCode = code ? code.trim().toUpperCase() : "";
    
    if (finalCode === "") {
        // Sinh chuỗi ngẫu nhiên 6 ký tự
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        finalCode = `AUTO_${randomString}`;
    }

    // Kiểm tra trùng
    const exists = await Promotion.findOne({ code: finalCode });
    if (exists) {
        return res.json({ success: false, message: "Mã code này đã tồn tại!" });
    }

    const newPromoData = {
        ...req.body,
        code: finalCode // Luôn luôn có code
    };
    // --------------------

    const promo = new Promotion(newPromoData);
    await promo.save();

    res.json({ success: true, message: "Tạo khuyến mãi thành công!", data: promo });

  } catch (err) {
    // ... giữ nguyên phần catch lỗi
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- UPDATE ---
export const updatePromotion = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Kiểm tra trùng mã nếu có sửa mã
    if (code) {
      const exists = await Promotion.findOne({
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }, // Tìm thằng khác ID này mà trùng code
      });
      if (exists) return res.json({ success: false, message: "Mã code đã được dùng!" });
    }

    const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promo) return res.json({ success: false, message: "Không tìm thấy khuyến mãi" });

    res.json({ success: true, message: "Cập nhật thành công", data: promo });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- DELETE ---
export const deletePromotion = async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.id);
    if (!promo) return res.json({ success: false, message: "Không tìm thấy" });

    res.json({ success: true, message: "Đã xóa khuyến mãi" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- VALIDATE (Dùng cho Client áp mã) ---
export const validatePromotionCode = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) return res.json({ success: false, message: "Vui lòng nhập mã!" });

    const promo = await Promotion.findOne({ code: code.toUpperCase() });

    if (!promo) return res.json({ success: false, message: "Mã không tồn tại!" });

    const now = new Date();

    if (!promo.isActive) return res.json({ success: false, message: "Mã này đang tạm khóa!" });
    if (new Date(promo.startDate) > now) return res.json({ success: false, message: "Mã chưa đến đợt áp dụng!" });
    if (new Date(promo.endDate) < now) return res.json({ success: false, message: "Mã đã hết hạn!" });

    if (orderTotal < promo.minOrderAmount)
      return res.json({
        success: false,
        message: `Đơn tối thiểu phải từ ${promo.minOrderAmount.toLocaleString("vi-VN")}₫`
      });

    // Tính giảm giá
    let discount = 0;
    if (promo.type === "percentage") {
      discount = Math.round((orderTotal * promo.value) / 100);
    } else {
      discount = promo.value;
    }

    const finalPrice = Math.max(orderTotal - discount, 0);

    return res.json({
      success: true,
      valid: true,
      discount,
      finalPrice,
      promotion: promo,
      message: "Áp dụng mã thành công!"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};