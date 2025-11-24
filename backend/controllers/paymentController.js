import orderModel from "../models/orderModel.js";
import crypto from 'crypto';
import { config } from "../config/paymentConfig.js";

// ==========================================
// 1. XỬ LÝ MOMO IPN
// ==========================================
export const handleMomoIPN = async (req, res) => {
    console.log("🔔 MOMO IPN RECEIVED:", req.body);
    
    try {
        const { resultCode, orderId, extraData } = req.body;
        
        // resultCode = 0 nghĩa là thành công
        if (resultCode == 0) {
            await orderModel.findByIdAndUpdate(orderId, { 
                paymentStatus: 'paid',
                transactionId: req.body.transId
            });
            console.log(`✅ Đơn hàng ${orderId} đã thanh toán qua MoMo!`);
        }

        // Momo yêu cầu phản hồi lại status 204
        res.status(204).send(); 
    } catch (error) {
        console.error("Momo IPN Error:", error);
        res.status(500).send();
    }
};

// ==========================================
// 2. XỬ LÝ ZALOPAY CALLBACK
// ==========================================
export const handleZaloPayCallback = async (req, res) => {
    console.log("🔔 ZALOPAY CALLBACK RECEIVED:", req.body);

    let result = {};

    try {
        const { data: dataStr, mac: reqMac } = req.body;
        const key2 = config.zalopay.key2;

        // Kiểm tra tính hợp lệ (MAC)
        const mac = crypto.createHmac("sha256", key2).update(dataStr).digest("hex");

        if (reqMac !== mac) {
            // MAC không khớp -> Gói tin giả mạo
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            // MAC hợp lệ -> Xử lý đơn hàng
            const dataJson = JSON.parse(dataStr);
            
            // Trong dataJson.embed_data thường chứa orderId nếu lúc tạo bạn có gửi kèm
            // Hoặc bạn phải parse từ app_trans_id nếu bạn lưu mapping
            console.log("ZaloPay Data:", dataJson);

            // Giả sử bạn lấy được orderId từ description hoặc embed_data
            // await orderModel.findByIdAndUpdate(orderId, { paymentStatus: 'paid' });

            result.return_code = 1;
            result.return_message = "success";
            console.log(`✅ Thanh toán ZaloPay thành công!`);
        }
    } catch (ex) {
        result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
        result.return_message = ex.message;
    }

    // ZaloPay yêu cầu trả về JSON kết quả
    res.json(result);
};

// ==========================================
// 3. XỬ LÝ STRIPE WEBHOOK
// ==========================================
export const handleStripeWebhook = async (req, res) => {
    const event = req.body;

    console.log("🔔 STRIPE WEBHOOK RECEIVED:", event.type);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const orderId = session.client_reference_id || session.metadata?.orderId; // Tùy cách bạn gửi lúc tạo

                // Trong stripe.js lúc tạo session, bạn nên thêm metadata: { orderId: orderId }
                // Nhưng ở phần verifyOrder (frontend redirect) chúng ta đã xử lý rồi.
                // Webhook này là lớp bảo vệ thứ 2 để chắc chắn DB được update.
                
                // Cập nhật DB (nếu lấy được ID)
                // await orderModel.findByIdAndUpdate(orderId, { paymentStatus: 'paid' });
                console.log("✅ Stripe Checkout Completed!");
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({received: true});
    } catch (err) {
        console.error("Stripe Webhook Error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};