import { useState } from "react";
import axios from "axios";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Vui lòng nhập email!");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:4000/api/user/reset-password-link",
        { email }
      );

      if (res.data.success) {
        setMessage("Đã gửi email đặt lại mật khẩu!");
      } else {
        setError(res.data.message || "Không thể gửi email!");
      }
    } catch (err) {
      setError("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="forgot-form" onSubmit={handleSubmit}>
      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}

      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <button disabled={loading} className="forgot-btn">
        {loading ? "Đang gửi..." : "Gửi yêu cầu đặt lại mật khẩu"}
      </button>
    </form>
  );
}
