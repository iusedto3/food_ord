import { createMomoPayment } from './momo.js';
import { createStripePayment } from './stripe.js';
import { createZaloPayPayment } from './zalopay.js';
import dotenv from 'dotenv';

export const processPayment = async (method, orderId, amount) => {
    try {
        
        switch (method) {
            case 'momo':
                return await createMomoPayment(orderId, amount);
            case 'zalopay':
                return await createZaloPayPayment(orderId, amount);
            case 'stripe':
                return await createStripePayment(orderId, amount);
            default:
                return null;
        }
    } catch (error) {
        console.error("Payment Service Error:", error);
        return null;
    }
};