import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { placeOrder, getOrderDetail, getAllOrders, updateOrderStatus, getUserOrders, getDashboardStats, verifyOrder, trackOrder } from '../controllers/orderController.js';


const orderRouter = express.Router();

orderRouter.post('/place',  placeOrder);
orderRouter.get('/my-orders', authMiddleware, getUserOrders);

orderRouter.get('/admin/dashboard', getDashboardStats);

orderRouter.get('/:orderId', getOrderDetail);

// Admin route to get all orders
orderRouter.get("/admin/orders", getAllOrders);
orderRouter.put("/admin/update-status/:orderId", updateOrderStatus);

orderRouter.post('/verify', verifyOrder);

orderRouter.post('/track', trackOrder);

export default orderRouter;