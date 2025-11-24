import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment'; // npm install moment
import { config } from '../../config/paymentConfig.js';

export const createZaloPayPayment = async (orderId, amount) => {
    try {
        const { app_id, key1, endpoint, callbackUrl, returnUrl } = config.zalopay;

        const embed_data = {
            redirecturl: returnUrl // ZaloPay sẽ chuyển hướng về đây sau khi thanh toán
        };

        const items = [{}]; // Có thể truyền danh sách món ăn vào đây nếu muốn
        const transID = Math.floor(Math.random() * 1000000);
        
        // app_trans_id phải là duy nhất và theo định dạng YYMMDD_xxxxxx
        const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;

        const order = {
            app_id: app_id,
            app_trans_id: app_trans_id, // Mã giao dịch phía ZaloPay (cần lưu lại vào orderModel nếu muốn đối soát)
            app_user: "user123",
            app_time: Date.now(), // miliseconds
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: amount,
            description: `Thanh toan don hang #${orderId}`,
            bank_code: "",
            callback_url: callbackUrl
        };

        // Tạo chữ ký HMAC SHA256
        const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = crypto.createHmac('sha256', key1).update(data).digest('hex');

        // Gọi API ZaloPay
        const response = await axios.post(endpoint, null, { params: order });

        if (response.data.return_code === 1) {
            return response.data.order_url; // Link thanh toán
        } else {
            console.log("ZaloPay Error:", response.data);
            return null;
        }

    } catch (error) {
        console.error("ZaloPay Service Error:", error);
        return null;
    }
};