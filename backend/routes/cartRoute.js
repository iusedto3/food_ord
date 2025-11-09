import express from 'express';
import { addToCart, getCart, removeFromCart, updateCartItem } from '../controllers/cartController.js';
import authMiddleware from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.post('/add',authMiddleware, addToCart);
cartRouter.post('/remove',authMiddleware, removeFromCart);
cartRouter.post('/get',authMiddleware, getCart)
cartRouter.put('/update', authMiddleware, updateCartItem);

export default cartRouter;