import express from 'express'
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from '../controllers/promotionController.js'

// ✅ Khai báo router
const promotionRouter = express.Router()

// ✅ Định nghĩa các route
promotionRouter.get('/', getPromotions)
promotionRouter.post('/', createPromotion)
promotionRouter.put('/:id', updatePromotion)
promotionRouter.delete('/:id', deletePromotion)

// ✅ Xuất router ra
export default promotionRouter