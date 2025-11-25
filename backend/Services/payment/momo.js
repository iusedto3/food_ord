import axios from 'axios';
import crypto from 'crypto';
import { config } from '../../config/paymentConfig.js';

export const createMomoPayment = async (orderId, amount) => {
    try {
        const { partnerCode, accessKey, secretKey, endpoint, returnUrl, notifyUrl } = config.momo;
        
        // 1. Dữ liệu cơ bản
        const requestId = orderId + new Date().getTime(); // Mã request phải duy nhất
        const orderInfo = `Thanh toan don hang #${orderId}`;
        const requestType = "captureWallet";
        const extraData = ""; 

        // 2. Tạo chuỗi ký tự để mã hóa (Đúng thứ tự a-z là bắt buộc)
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;

        // 3. Ký tên (HMAC SHA256)
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        // 4. Body gửi sang MoMo
        const requestBody = {
            partnerCode,
            partnerName: "Test Momo",
            storeId: "MomoTestStore",
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl: returnUrl, // Sau khi thanh toán xong, MoMo sẽ chuyển user về đây
            ipnUrl: notifyUrl,
            lang: 'vi',
            requestType,
            autoCapture: true,
            extraData,
            signature
        };

        // 5. Gọi API
        const response = await axios.post(endpoint, requestBody);
        
        return response.data.payUrl; // Trả về link thanh toán

    } catch (error) {
        console.error("MoMo Error:", error.message);
        return null;
    }
};