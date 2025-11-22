import React from "react";
import SignUpForm from "../../components/auth/SignUpForm/SignUpForm";
import "./SignUp.css";

export default function SignUp() {
  return (
    <div className="signup-container">
      <h1 className="signup-title">Tạo tài khoản</h1>

      <div className="signup-card">
        <SignUpForm />
      </div>
    </div>
  );
}
