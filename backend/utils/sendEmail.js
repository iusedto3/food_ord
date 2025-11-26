// server/utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendEmail = async (order) => {
  if (!order?.customer?.email) {
    return { accepted: [], info: null };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  // 1. Xác định trạng thái thanh toán để hiển thị text
  const isPaid = order.paymentStatus === "paid" || order.payment === true;
  const paymentMethodText = order.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : order.paymentMethod.toUpperCase();
  
  const paymentStatusHtml = isPaid 
    ? `<p style="color: green; font-weight: bold;">✅ Đã thanh toán thành công qua ${paymentMethodText}</p>`
    : `<p style="color: orange; font-weight: bold;">⏳ Thanh toán khi nhận hàng (${paymentMethodText})</p>`;

  // 2. Tính lại tổng cộng (để chắc chắn)
  const subtotal = order.amount || 0;
  const shipping = order.shippingFee || 0;
  const discount = order.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal + shipping - discount);

  const mailOptions = {
    from: `"Tomato Food Delivery" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `[Tomato] Xác nhận đơn hàng #${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ff6347; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">Đặt Hàng Thành Công!</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Xin chào <b>${order.customer.name}</b>,</p>
          <p>Cảm ơn bạn đã đặt món tại Tomato. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 5px 0;"><b>Mã đơn hàng:</b> #${order.orderId}</p>
            <p style="margin: 5px 0;"><b>Thời gian:</b> ${new Date(order.createdAt || Date.now()).toLocaleString("vi-VN")}</p>
            ${paymentStatusHtml}
          </div>

          <h3>Chi tiết đơn hàng</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${order.items.map(it => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0;">
                  <b>${it.name}</b> <br/>
                  <small style="color: #666;">x${it.quantity} ${it.size ? `(${it.size})` : ''}</small>
                </td>
                <td style="text-align: right;">${Number(it.totalPrice).toLocaleString()}đ</td>
              </tr>
            `).join("")}
          </table>

          <hr style="border: 0; border-top: 1px dashed #ccc; margin: 20px 0;">

          <div style="text-align: right;">
             <p style="margin: 5px 0;">Tạm tính: ${subtotal.toLocaleString()}đ</p>
             <p style="margin: 5px 0;">Phí giao hàng: ${shipping.toLocaleString()}đ</p>
             ${discount > 0 ? `<p style="margin: 5px 0; color: green;">Voucher: -${discount.toLocaleString()}đ</p>` : ''}
             <h3 style="color: #d32f2f; margin: 10px 0;">Tổng cộng: ${finalTotal.toLocaleString()}đ</h3>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
            Đây là email tự động, vui lòng không trả lời.<br/>
            Cần hỗ trợ? Liên hệ hotline: 1900 xxxx
          </p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { accepted: info.accepted || [], info };
};