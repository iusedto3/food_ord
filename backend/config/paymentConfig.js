import dotenv from 'dotenv';
dotenv.config();

export const config = {
    // STRIPE
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        returnUrl: `${process.env.FRONTEND_URL}/verify?method=stripe`, // Trang Client nhận kết quả
    },
    
    // MOMO (Thông tin test mặc định của Momo)
    momo: {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        accessKey: process.env.MOMO_ACCESS_KEY,
        secretKey: process.env.MOMO_SECRET_KEY,
        endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
        returnUrl: `${process.env.FRONTEND_URL}/verify?method=momo`,
        notifyUrl: `${process.env.BACKEND_URL}/api/payment/momo-ipn`, // API Backend nhận kết quả ngầm
    },

    // ZALOPAY (Thông tin test mặc định của ZaloPay Sandbox)
    zalopay: {
        app_id: "2553", // Sandbox App ID mặc định
        key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL", // Key 1 chuẩn Sandbox
        key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
        endpoint: "https://sb-openapi.zalopay.vn/v2/create",
        // Đảm bảo URL này đúng định dạng, ví dụ: http://localhost:5173/verify?method=zalopay
        returnUrl: `${process.env.FRONTEND_URL}/verify?method=zalopay`, 
        callbackUrl: `${process.env.BACKEND_URL}/api/payment/zalopay-callback`
    }
};

