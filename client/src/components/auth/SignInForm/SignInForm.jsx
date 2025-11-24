import React, { useState, useContext } from "react";
import { StoreContext } from "../../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignInForm = () => {
  const navigate = useNavigate();
  // 💡 Không cần lấy mergeGuestCart nữa, chỉ cần setToken là đủ
  const { url, setToken } = useContext(StoreContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Reset lỗi cũ nếu có

    try {
      const res = await axios.post(`${url}/api/user/login`, {
        email,
        password,
      });

      if (res.data.success) {
        // 1. Lưu token vào localStorage (để chắc chắn)
        localStorage.setItem("token", res.data.token);

        // 2. Gọi setToken từ Context
        // (Hàm này trong Context sẽ tự động Gộp giỏ hàng Guest -> Server, sau đó mới update State)
        await setToken(res.data.token);

        // 3. Chuyển hướng ngay lập tức, không cần setTimeout hack
        navigate("/");
      } else {
        // Xử lý trường hợp backend trả về success: false (ví dụ: sai pass)
        setErrorMsg(res.data.message || "Sai email hoặc mật khẩu");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Lỗi kết nối hoặc sai thông tin đăng nhập");
    }
  };

  return (
    <form className="signin-form" onSubmit={handleLogin}>
      {errorMsg && <p className="signin-error">{errorMsg}</p>}

      <label>Email</label>
      <input
        type="email"
        placeholder="example@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>Mật khẩu</label>
      <input
        type="password"
        placeholder="Nhập mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <p className="signin-forgot" onClick={() => navigate("/forgot-password")}>
        Quên mật khẩu?
      </p>

      <button className="signin-btn" type="submit">
        Đăng nhập
      </button>

      <p className="signin-switch">
        Bạn chưa có tài khoản?{" "}
        <span onClick={() => navigate("/sign-up")}>Tạo tài khoản</span>
      </p>
    </form>
  );
};

export default SignInForm;
