import express from 'express';
import { addToCart, getCart, removeFromCart, updateCartItem } from '../controllers/cartController.js';
import authMiddleware from '../middleware/auth.js';
import { syncCart } from '../controllers/cartController.js';

const cartRouter = express.Router();

cartRouter.post('/add',authMiddleware, addToCart);
cartRouter.post('/remove',authMiddleware, removeFromCart);
cartRouter.post('/get',authMiddleware, getCart)
cartRouter.put('/update', authMiddleware, updateCartItem);

// 👉 THÊM DÒNG NÀY
cartRouter.post('/sync', authMiddleware, syncCart);

export default cartRouter;