import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment';
// 👇 1. Import lại file config
import { config } from '../../config/paymentConfig.js'; 

export const createZaloPayPayment = async (orderId, amount) => {
    try {
        // 👇 2. Lấy Key từ file config (thay vì ZALO_CONFIG cứng)
        const { app_id, key1, endpoint, callbackUrl, returnUrl } = config.zalopay;

        const embed_data = {
            redirecturl: returnUrl // "http://localhost:5173/verify"
        };

        const items = []; 
        const transID = Math.floor(Math.random() * 1000000);
        const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;

        const order = {
            app_id: parseInt(app_id),
            app_trans_id: app_trans_id, 
            app_user: "user123",
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: parseInt(amount),
            description: `Thanh toan don hang #${transID}`,
            bank_code: "",
        };

        // Tạo MAC
        const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = crypto.createHmac('sha256', key1).update(data).digest('hex');

        console.log("⚡ Gửi ZaloPay Order:", order);

        // 👇 3. Giữ nguyên dòng code đã fix được lỗi
        const response = await axios.post(endpoint, order);

        console.log("👉 ZaloPay Response:", response.data);

        if (response.data.return_code === 1) {
            return response.data.order_url;
        } else {
            return null;
        }

    } catch (error) {
        console.error("❌ ZaloPay Service Error:", error.message);
        return null;
    }
};