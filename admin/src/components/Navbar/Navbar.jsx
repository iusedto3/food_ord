import React from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🧹 Xoá token trong localStorage
    localStorage.removeItem("adminToken");

    // 🧭 Chuyển về trang đăng nhập
    navigate("/login");

    // 🪄 Thông báo nhỏ
    toast.success("Đã đăng xuất thành công!");
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img className="logo" src={assets.logo} alt="logo" />
      </div>

      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Navbar;
