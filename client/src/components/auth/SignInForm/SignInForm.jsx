import React, { useState, useContext } from "react";
import { StoreContext } from "../../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignInForm = () => {
  const navigate = useNavigate();
  const { url, setToken, mergeGuestCart } = useContext(StoreContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${url}/api/user/login`, {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);

        // Đợi token được set vào context
        setToken(res.data.token);

        // Đợi React cập nhật token xong
        setTimeout(async () => {
          try {
            await mergeGuestCart(); // merge lúc này mới có token đúng
          } catch (error) {
            console.log("Merge cart failed, nhưng không ảnh hưởng login");
          }

          navigate("/");
        }, 200);
      }
    } catch (err) {
      setErrorMsg("Sai email hoặc mật khẩu");
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

      <button className="signin-btn">Đăng nhập</button>

      <p className="signin-switch">
        Bạn chưa có tài khoản?{" "}
        <span onClick={() => navigate("/sign-up")}>Tạo tài khoản</span>
      </p>
    </form>
  );
};

export default SignInForm;
