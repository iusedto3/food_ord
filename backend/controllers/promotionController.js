import Promotion from "../models/promotionModel.js";
import { validatePromotion } from "../utils/promotionValidator.js";
import { ok, created, badRequest, notFound, serverError } from "../utils/response.js";

export const getPromotions = async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    return ok(res, promos);
  } catch (err) {
    return serverError(res, err);
  }
};

export const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const promos = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    return ok(res, promos);
  } catch (err) {
    return serverError(res, err);
  }
};

export const createPromotion = async (req, res) => {
  try {
    const error = validatePromotion(req.body);
    if (error) return badRequest(res, error);

    if (req.body.code) {
      const exists = await Promotion.findOne({ code: req.body.code });
      if (exists) return badRequest(res, "Mã code đã tồn tại");
    }

    const promo = await Promotion.create(req.body);
    return created(res, promo, "Đã tạo promotion");
  } catch (err) {
    return serverError(res, err);
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const error = validatePromotion(req.body);
    if (error) return badRequest(res, error);

    if (req.body.code) {
      const exists = await Promotion.findOne({
        code: req.body.code,
        _id: { $ne: req.params.id },
      });
      if (exists) return badRequest(res, "Code này đã được dùng ở promotion khác");
    }

    const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promo) return notFound(res, "Không tìm thấy promotion");

    return ok(res, promo, "Đã cập nhật");
  } catch (err) {
    return serverError(res, err);
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.id);
    if (!promo) return notFound(res, "Không tìm thấy promotion");

    return ok(res, null, "Đã xoá promotion");
  } catch (err) {
    return serverError(res, err);
  }
};

export const validatePromotionCode = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) return badRequest(res, "Vui lòng nhập mã!");
    if (!orderTotal && orderTotal !== 0)
      return badRequest(res, "Thiếu orderTotal!");

    const promo = await Promotion.findOne({ code });

    if (!promo) return badRequest(res, "Mã không tồn tại!");

    const now = new Date();

    if (!promo.isActive)
      return badRequest(res, "Mã này đã bị tạm khóa!");

    if (promo.startDate > now || promo.endDate < now)
      return badRequest(res, "Mã không còn hiệu lực!");

    if (orderTotal < promo.minOrderAmount)
      return badRequest(
        res,
        `Đơn tối thiểu phải từ ${promo.minOrderAmount.toLocaleString("vi-VN")}₫`
      );

    // 🚀 Tính số tiền giảm
    let discount = 0;

    if (promo.type === "percentage") {
      discount = Math.round((orderTotal * promo.value) / 100);
    } else {
      discount = promo.value; // fixed & coupon
    }

    const finalPrice = Math.max(orderTotal - discount, 0);

    return ok(
      res,
      {
        valid: true,
        discount,
        finalPrice,
        promotion: promo,
      },
      "Áp dụng mã thành công!"
    );
  } catch (err) {
    return serverError(res, err);
  }
};

export const applyVoucher = async (req, res) => {
  try {
    const { code } = req.body;

    const voucher = await Voucher.findOne({ code });

    if (!voucher)
      return res.status(400).json({ message: "Mã không tồn tại!" });

    if (new Date(voucher.endDate) < new Date())
      return res.status(400).json({ message: "Mã đã hết hạn!" });

    return res.json({
      code: voucher.code,
      type: voucher.type,
      discountValue: voucher.type === "percentage"
        ? voucher.value // %
        : voucher.value, // tiền
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};