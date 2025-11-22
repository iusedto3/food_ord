import express from 'express'
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
  validatePromotionCode
} from '../controllers/promotionController.js'

const promotionRouter = express.Router()

promotionRouter.get('/', getPromotions)
promotionRouter.get('/active', getActivePromotions)
promotionRouter.post('/', createPromotion)
promotionRouter.put('/:id', updatePromotion)
promotionRouter.delete('/:id', deletePromotion)

// FE will use this
promotionRouter.post('/validate', validatePromotionCode)

export default promotionRouter
