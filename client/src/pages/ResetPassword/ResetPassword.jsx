import ResetPasswordForm from "../../components/auth/ResetPasswordForm/ResetPasswordForm";
import "./ResetPassword.css";

export default function ResetPassword() {
  return (
    <div className="reset-container">
      <h1 className="reset-title">Đặt lại mật khẩu</h1>

      <div className="reset-card">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
