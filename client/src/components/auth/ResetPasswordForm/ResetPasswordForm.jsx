import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPasswordForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirm) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (password !== confirm) {
      setError("Xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:4000/api/user/reset-password/${token}`,
        { newPassword: password }
      );

      if (res.data.success) {
        setMessage("Đổi mật khẩu thành công! Đang chuyển hướng...");
        setTimeout(() => navigate("/sign-in"), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Token không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="reset-form" onSubmit={handleSubmit}>
      {error && <p className="reset-error">{error}</p>}
      {message && <p className="reset-success">{message}</p>}

      <div className="reset-group">
        <label>Mật khẩu mới *</label>
        <input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="reset-group">
        <label>Xác nhận mật khẩu *</label>
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      <button disabled={loading} className="reset-btn">
        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
