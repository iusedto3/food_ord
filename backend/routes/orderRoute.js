import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { placeOrder, getOrderDetail, getAllOrders, updateOrderStatus, getUserOrders } from '../controllers/orderController.js';


const orderRouter = express.Router();

orderRouter.post('/place', placeOrder);
orderRouter.get('/my-orders', authMiddleware, getUserOrders);

orderRouter.get('/:orderId', getOrderDetail);

// Admin route to get all orders
orderRouter.get("/admin/orders", getAllOrders);
orderRouter.put("/admin/update-status/:orderId", updateOrderStatus);

export default orderRouter;