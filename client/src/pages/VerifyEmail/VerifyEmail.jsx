import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Đang xác thực...");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/user/verify-email/${token}`
        );

        if (res.data.success) {
          setStatus("success");
          setMessage("Xác thực email thành công!");
        } else {
          setStatus("failed");
          setMessage(res.data.message || "Xác thực thất bại!");
        }
      } catch (error) {
        setStatus("failed");
        setMessage("Lỗi server!");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1 className="verify-title">Email Verification</h1>

        <p
          className={
            status === "success"
              ? "verify-success"
              : status === "failed"
              ? "verify-error"
              : "verify-loading"
          }
        >
          {message}
        </p>

        {status === "success" && (
          <button className="verify-btn" onClick={() => navigate("/sign-in")}>
            Đăng nhập ngay
          </button>
        )}

        {status === "failed" && (
          <button className="verify-btn" onClick={() => navigate("/sign-up")}>
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}
