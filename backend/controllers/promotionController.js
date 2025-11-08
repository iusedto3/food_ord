import Promotion from '../models/promotionModel.js'

// Lấy danh sách khuyến mãi
export const getPromotions = async (req, res) => {
    const promos = await Promotion.find().sort({ createdAt: -1 })
    res.json(promos)
}

// Thêm mới
export const createPromotion = async (req, res) => {
    try {
    const promo = await Promotion.create(req.body)
    res.status(201).json(promo)
    } catch (err) {
    res.status(400).json({ error: err.message })
    }
}

// Cập nhật
export const updatePromotion = async (req, res) => {
    try {
    const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(promo)
    } catch (err) {
    res.status(400).json({ error: err.message })
    }
}

// Xóa
export const deletePromotion = async (req, res) => {
    await Promotion.findByIdAndDelete(req.params.id)
    res.json({ message: 'Đã xóa mã khuyến mãi!' })
}
