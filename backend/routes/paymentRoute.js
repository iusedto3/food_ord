import express from 'express';
import { 
    handleMomoIPN, 
    handleZaloPayCallback, 
    handleStripeWebhook 
} from '../controllers/paymentController.js';

const paymentRouter = express.Router();

// --- ROUTE XỬ LÝ WEBHOOK / IPN ---

// 1. Momo IPN (Instant Payment Notification)
// Momo sẽ gọi vào đây ngầm để báo kết quả (không qua trình duyệt)
paymentRouter.post('/momo-ipn', handleMomoIPN);

// 2. ZaloPay Callback
// ZaloPay gọi vào đây để cập nhật trạng thái đơn hàng
paymentRouter.post('/zalopay-callback', handleZaloPayCallback);

// 3. Stripe Webhook
// Stripe gọi vào đây khi sự kiện 'checkout.session.completed' xảy ra
// Lưu ý: Với Stripe, cần cấu hình raw body parser trong server.js nếu muốn verify signature chặt chẽ
paymentRouter.post('/stripe-webhook', handleStripeWebhook);

export default paymentRouter;