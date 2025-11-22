// utils/sendOrderEmail.js
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

  const mailOptions = {
    from: `"Food Delivery" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Xác nhận đơn hàng #${order.orderId}`,
    html: `
      <h2>Đặt hàng thành công!</h2>
      <p><b>Mã đơn:</b> ${order.orderId}</p>
      <p><b>Tổng tiền:</b> ${Number(order.amount).toLocaleString()}đ</p>
      <h3>Chi tiết đơn</h3>
      <ul>
        ${order.items
          .map(
            (it) =>
              `<li>${it.name || it.title || "Item"} x${it.quantity || 1} — ${Number(
                it.totalPrice || it.price || 0
              ).toLocaleString()}đ</li>`
          )
          .join("")}
      </ul>
      <p>Cảm ơn bạn đã đặt hàng!</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  // trả về info để caller kiểm tra info.accepted
  return { accepted: info.accepted || [], info };
};
