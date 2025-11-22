import React from "react";

const SuccessHero = ({ orderId, loading }) => {
  return (
    <section className="success-hero">
      <h1>Cảm ơn bạn!</h1>
      <h2>Chúng tôi đang xác nhận đơn hàng của bạn</h2>
      <p className="order-ref">
        {loading ? "Đang tải..." : `Mã đơn hàng: #${orderId || "—"}`}
      </p>

      {/* animation: dùng video hoặc GIF từ public */}
      <div className="hero-media">
        <video
          src="/ani_01_placing_order_tomato.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="success-video"
        />
      </div>

      <div className="hero-actions">
        <a className="btn-primary" href="/">
          Đi đến trang chính
        </a>
      </div>
    </section>
  );
};

export default SuccessHero;
