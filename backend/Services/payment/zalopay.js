import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment'; 
import { config } from '../../config/paymentConfig.js';

export const createZaloPayPayment = async (orderId, amount) => {
    try {
        const { app_id, key1, endpoint, callbackUrl, returnUrl } = config.zalopay;

        // 🟢 FIX LỖI REDIRECT: Xử lý kỹ link chuyển hướng
        // returnUrl gốc: "http://localhost:5173/verify?method=zalopay"
        // Ta nối thêm orderId vào
        const redirectUrl = `${returnUrl}&orderId=${orderId}`;
        
        console.log("🔗 Redirect URL sẽ gửi cho Zalo:", redirectUrl); // <--- Kiểm tra xem log này có ra đúng link không

        // ZaloPay yêu cầu embed_data là chuỗi JSON chứa key 'redirecturl'
        const embed_data = JSON.stringify({
            redirecturl: redirectUrl 
        });

        const items = JSON.stringify([]); 

        const transID = Math.floor(Math.random() * 1000000);
        const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;

        const order = {
            app_id: parseInt(app_id),
            app_trans_id: app_trans_id, 
            app_user: "user123",
            app_time: Date.now(), 
            item: items,       
            embed_data: embed_data, // <--- Gửi chuỗi JSON vào đây
            amount: amount,
            description: `Thanh toan don hang #${orderId}`,
            bank_code: "", 
            callback_url: callbackUrl
        };

        // Tạo chữ ký MAC
        const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = crypto.createHmac('sha256', key1).update(data).digest('hex');

        // Gửi request
        const params = new URLSearchParams();
        params.append('app_id', order.app_id);
        params.append('app_trans_id', order.app_trans_id);
        params.append('app_user', order.app_user);
        params.append('app_time', order.app_time);
        params.append('item', order.item);
        params.append('embed_data', order.embed_data);
        params.append('amount', order.amount);
        params.append('description', order.description);
        params.append('bank_code', order.bank_code);
        params.append('callback_url', order.callback_url);
        params.append('mac', order.mac);

        console.log("🚀 Đang gửi ZaloPay...", order.app_trans_id);

        const response = await axios.post(endpoint, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.data.return_code === 1) {
            return response.data.order_url; 
        } else {
            console.error("❌ ZaloPay Error:", response.data);
            return null;
        }

    } catch (error) {
        console.error("❌ ZaloPay Service Exception:", error.message);
        return null;
    }
};