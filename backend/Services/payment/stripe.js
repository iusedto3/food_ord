import Stripe from 'stripe';
import { config } from '../../config/paymentConfig.js';

// Kiểm tra xem Key có nạp được không
const stripeKey = config.stripe.secretKey;
if (!stripeKey) {
    console.error("❌ LỖI: Chưa tìm thấy Stripe Secret Key trong .env!");
}

const stripe = new Stripe(stripeKey);

export const createStripePayment = async (orderId, amount) => {
    try {
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'vnd',
                        product_data: {
                            name: `Thanh toán đơn hàng #${orderId}`,
                        },
                        unit_amount: amount, // Số tiền (VND không nhân 100)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${config.stripe.returnUrl}&success=true&orderId=${orderId}`,
            cancel_url: `${config.stripe.returnUrl}&success=false&orderId=${orderId}`,
        });

        console.log("✅ Stripe Session URL:", session.url);
        return session.url;

    } catch (error) {
        // 👇 IN CHI TIẾT LỖI RA ĐÂY ĐỂ ĐỌC
        console.error("❌ Stripe Error Detail:", error.message); 
        console.error("🔍 Full Error:", error);
        return null;
    }
};