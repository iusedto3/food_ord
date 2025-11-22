import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");

  const vnPhoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    allowNews: false,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!vnPhoneRegex.test(form.phone)) {
      setError("Số điện thoại không hợp lệ. Vui lòng nhập đúng số Việt Nam!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/api/user/register", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        allowNews: form.allowNews,
      });

      if (res.data.success) {
        setSuccessMessage(
          "Đăng ký thành công! Hãy kiểm tra email của bạn để hoàn tất xác thực tài khoản."
        );
        setTimeout(() => navigate("/sign-in"), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-group" onSubmit={handleSubmit}>
      {error && <p className="signup-error">{error}</p>}

      {successMessage && (
        <p className="signup-success-message">{successMessage}</p>
      )}

      <div className="form-group">
        <label>Họ và tên *</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Số điện thoại *</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Mật khẩu *</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Xác nhận mật khẩu *</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
        />
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          name="allowNews"
          checked={form.allowNews}
          onChange={handleChange}
        />
        <label>Tôi đồng ý nhận tin tức qua email & điện thoại</label>
      </div>

      <button type="submit" disabled={loading} className="signup-btn">
        {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
      </button>
    </form>
  );
}
