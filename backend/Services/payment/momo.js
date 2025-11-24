import axios from 'axios';
import crypto from 'crypto';
import { config } from '../../config/paymentConfig.js';

export const createMomoPayment = async (orderId, amount) => {
    try {
        const { partnerCode, accessKey, secretKey, endpoint, returnUrl, notifyUrl } = config.momo;
        
        const requestId = orderId + "_" + new Date().getTime();
        const orderInfo = `Thanh toan don hang ${orderId}`;
        const requestType = "captureWallet";
        const extraData = ""; // Pass empty value if not needed

        // Tạo chuỗi ký tự để mã hóa (Theo tài liệu MoMo)
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;

        // Mã hóa HMAC SHA256
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        // Body gửi đi
        const requestBody = {
            partnerCode,
            partnerName: "Test Momo",
            storeId: "MomoTestStore",
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl: returnUrl,
            ipnUrl: notifyUrl,
            lang: 'vi',
            requestType,
            autoCapture: true,
            extraData,
            signature
        };

        // Gọi API Momo
        const response = await axios.post(endpoint, requestBody);
        
        if (response.data && response.data.payUrl) {
            return response.data.payUrl;
        } else {
            console.log("Momo Response Error:", response.data);
            return null;
        }

    } catch (error) {
        console.error("Momo Error:", error);
        return null;
    }
};