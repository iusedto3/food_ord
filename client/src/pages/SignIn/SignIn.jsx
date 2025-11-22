import React from "react";
import "./SignIn.css";
import SignInForm from "../../components/auth/SignInForm/SignInForm";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="signin-wrapper">
      <div className="signin-card">
        <h1 className="signin-title">Đăng nhập</h1>
        <SignInForm />
      </div>
    </div>
  );
};

export default SignIn;
