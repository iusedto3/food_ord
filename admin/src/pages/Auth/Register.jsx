import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";

const Register = () => {
  const [form, setForm] = useState({ username: "", name: "", password: "" });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:4000/api/admin/register",
        form
      );

      if (res.data.success) {
        toast.success("🎉 Tạo admin thành công! Vui lòng đăng nhập.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        toast.error(res.data.message || "❌ Đăng ký thất bại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Lỗi kết nối server!");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Đăng ký Admin</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Tên hiển thị"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Tạo tài khoản</button>
        <p>
          Đã có tài khoản? <a href="/login">Đăng nhập</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
