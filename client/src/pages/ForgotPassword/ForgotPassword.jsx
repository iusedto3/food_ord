import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm/ForgotPasswordForm";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  return (
    <div className="forgot-container">
      <h1 className="forgot-title">Quên mật khẩu</h1>

      <div className="forgot-card">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
